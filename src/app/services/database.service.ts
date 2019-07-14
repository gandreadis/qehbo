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
  correctAnswerIndex?: number;
  preserveAnswerOrder?: boolean;
  box?: number;
  lastVisitDateTime?: string;
}

export interface Answer {
  id: number;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public isReady = new BehaviorSubject(false);

  private questions = new BehaviorSubject([]);
  private score = new BehaviorSubject(0);

  constructor(private storage: Storage, private http: HttpClient) {
    this.storage.ready().then(async () => {
      this.initializeDatabase();
    });
  }

  async initializeDatabase() {
    const storedQuestions = await this.storage.get('questions');
    const storedScore = await this.storage.get('score');

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
      this.isReady.next(true);
    }
  }

  async resetDatabase() {
    this.http.get('assets/questions.yml', {responseType: 'text'}).subscribe(async yml => {
      const parsedQuestions = yaml.parse(yml);
      parsedQuestions.forEach(question => {
        if (question.hasOwnProperty('answers')) {
          question.answers = question.answers.map((text, index) => ({ text, id: index}));
        }
      });

      await this.updateQuestions(parsedQuestions);
      await this.updateScore(0);
      this.isReady.next(true);
    });
  }

  getCurrentQuestions(): Question[] {
    return this.questions.getValue();
  }

  getScoreAsObservable(): Observable<number> {
    return this.score.asObservable();
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
}
