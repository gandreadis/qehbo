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

  constructor(private storage: Storage, private http: HttpClient) {
    this.storage.ready().then(async () => {
      this.initializeDatabase();
    });
  }

  async initializeDatabase() {
    const storedQuestions = await this.storage.get('questions');

    if (storedQuestions === null) {
      this.isReady.next(false);
      this.resetDatabase();
    } else {
      await this.updateQuestions(storedQuestions);
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
      this.isReady.next(true);
    });
  }

  getCurrentQuestions(): Question[] {
    return this.questions.getValue();
  }

  getQuestionsObservable(): Observable<Question[]> {
    return this.questions.asObservable();
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
}
