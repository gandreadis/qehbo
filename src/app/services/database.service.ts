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
  private score = new BehaviorSubject(0);
  private maxRevisionsPerSession = new BehaviorSubject(DEFAULT_MAX_REVISIONS_PER_SESSION);

  constructor(private storage: Storage, private http: HttpClient) {
    this.storage.ready().then(async () => {
      this.initializeDatabase();
    });
  }

  async initializeDatabase() {
    const storedQuestions = await this.storage.get('questions');
    const storedScore = await this.storage.get('score');
    const maxRevisionsPerSession = await this.storage.get('maxRevisionsPerSession');

    if (storedQuestions === null) {
      this.isReady.next(false);
      this.resetDatabase();
    } else {
      this.questions.next(storedQuestions);

      if (storedScore === null) {
        await this.updateScore(0);
      } else {
        this.score.next(storedScore);
      }

      if (maxRevisionsPerSession === null) {
        await this.updateMaxRevisionsPerSession(DEFAULT_MAX_REVISIONS_PER_SESSION);
      } else {
        this.maxRevisionsPerSession.next(maxRevisionsPerSession);
      }

      this.isReady.next(true);
    }
  }

  async resetDatabase() {
    this.http.get('assets/questions.yml', {responseType: 'text'}).subscribe(async yml => {
      const parsedQuestions = yaml.parse(yml);
      parsedQuestions.forEach((question, index) => {
        question.id = index;

        if (question.hasOwnProperty('answers')) {
          question.answers = question.answers.map((text, id) => ({ text, id }));
        }

        if (question.type === 'true-false') {
          question.answers = [
            { id: 0, text: 'Waar' },
            { id: 1, text: 'Fout' },
          ];
          question.preserveAnswerOrder = true;
          question.isTrue = (question.isTrue === 'true');
        }
      });

      await this.updateQuestions(parsedQuestions);
      await this.updateScore(0);
      await this.updateMaxRevisionsPerSession(DEFAULT_MAX_REVISIONS_PER_SESSION);
      this.isReady.next(true);
    });
  }

  getCurrentQuestions(): Question[] {
    return this.questions.getValue();
  }

  getScoreAsObservable(): Observable<number> {
    return this.score.asObservable();
  }

  getMaxRevisionsPerSessionAsObservable(): Observable<number> {
    return this.maxRevisionsPerSession.asObservable();
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

  updateScore(score): Promise<void> {
    return this.storage.set('score', score).then(() => {
      this.score.next(score);
    });
  }

  addToScore(diff): Promise<void> {
    return this.updateScore(this.score.getValue() + diff);
  }

  updateMaxRevisionsPerSession(maxRevisionsPerSession): Promise<void> {
    return this.storage.set('maxRevisionsPerSession', maxRevisionsPerSession).then(() => {
      this.maxRevisionsPerSession.next(maxRevisionsPerSession);
    });
  }
}
