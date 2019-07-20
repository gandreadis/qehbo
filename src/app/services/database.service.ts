import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {HttpClient} from '@angular/common/http';
import yaml from 'yaml';
import {BehaviorSubject, Observable} from 'rxjs';

export interface Question {
  id: number;
  type: string;
  category: string;
  text: string;
  answers: Answer[];
  isTrue?: boolean;
  correctAnswerIndex?: boolean;
  preserveAnswerOrder?: boolean;
  box?: number;
  lastVisitDateTime?: string;
}

export interface Answer {
  id: number;
  text: string;
}

export const DEFAULT_MAX_REVISIONS_PER_SESSION = 10;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public isReady = new BehaviorSubject(false);

  private questions = new BehaviorSubject([]);
  private maxRevisionsPerSession = new BehaviorSubject(DEFAULT_MAX_REVISIONS_PER_SESSION);
  private showedIntroduction = new BehaviorSubject(false);

  constructor(private storage: Storage, private http: HttpClient) {
    this.storage.ready().then(async () => {
      this.initializeDatabase();
    });
  }

  async initializeDatabase() {
    const storedQuestions = await this.storage.get('questions');
    const maxRevisionsPerSession = await this.storage.get('maxRevisionsPerSession');
    const showedIntroduction = await this.storage.get('showedIntroduction');

    if (storedQuestions === null) {
      this.isReady.next(false);
      this.resetDatabase();
    } else {
      this.questions.next(storedQuestions);

      if (maxRevisionsPerSession === null) {
        await this.updateMaxRevisionsPerSession(DEFAULT_MAX_REVISIONS_PER_SESSION);
      } else {
        this.maxRevisionsPerSession.next(maxRevisionsPerSession);
      }

      if (showedIntroduction === null) {
        await this.updateShowedIntroduction(false);
      } else {
        this.showedIntroduction.next(showedIntroduction);
      }

      this.isReady.next(true);
    }
  }

  async resetDatabase() {
    await this.storage.clear();

    this.http.get('assets/questions.yml', {responseType: 'text'}).subscribe(async yml => {
      const parsedQuestions = yaml.parse(yml);
      parsedQuestions.forEach((question, index) => {
        question.id = index;

        if (question.hasOwnProperty('answers')) {
          question.answers = question.answers.map((text, id) => ({ text, id }));
        }

        if (!question.hasOwnProperty('correctAnswerIndex') && question.type === 'multiple-choice') {
          question.correctAnswerIndex = 0;
        }

        if (question.type === 'true-false') {
          question.answers = [
            { id: 0, text: 'Waar' },
            { id: 1, text: 'Fout' },
          ];
          question.preserveAnswerOrder = true;
        }
      });

      await this.updateQuestions(parsedQuestions);
      await this.updateMaxRevisionsPerSession(DEFAULT_MAX_REVISIONS_PER_SESSION);
      await this.updateShowedIntroduction(false);

      this.isReady.next(true);
    });
  }

  getCurrentQuestions(): Question[] {
    return this.questions.getValue();
  }

  getQuestionsAsObservable(): Observable<Question[]> {
    return this.questions.asObservable();
  }

  getMaxRevisionsPerSessionAsObservable(): Observable<number> {
    return this.maxRevisionsPerSession.asObservable();
  }

  getMaxRevisionsPerSessionAsValue(): number {
    return this.maxRevisionsPerSession.getValue();
  }

  getShowedIntroductionAsObservable(): Observable<boolean> {
    return this.showedIntroduction.asObservable();
  }

  updateQuestions(questions): Promise<void> {
    return this.storage.set('questions', questions).then(() => {
      this.questions.next(questions);
    });
  }

  updateQuestion(question): Promise<void> {
    const otherQuestions = this.questions.getValue().filter(q => q.id !== question.id);
    const allQuestions = [question, ...otherQuestions];
    return this.updateQuestions(allQuestions);
  }

  updateMaxRevisionsPerSession(maxRevisionsPerSession): Promise<void> {
    return this.storage.set('maxRevisionsPerSession', maxRevisionsPerSession).then(() => {
      this.maxRevisionsPerSession.next(maxRevisionsPerSession);
    });
  }

  updateShowedIntroduction(showedIntroduction): Promise<void> {
    return this.storage.set('showedIntroduction', showedIntroduction).then(() => {
      this.showedIntroduction.next(showedIntroduction);
    });
  }
}
