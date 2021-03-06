import {Injectable} from '@angular/core';
import {DatabaseService, Question} from './database.service';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {SharedModule} from '../shared/shared.module';

const boxToDayDelta = {
  0: 0,
  1: 1,
  2: 3,
  3: 5,
  4: 10,
  5: 15,
  6: 30,
  7: 90,
};
const MAX_BOX = 7;

@Injectable({
  providedIn: 'root'
})
export class SpacedRepetitionService {
  public numRevisionsInCurrentSession = new BehaviorSubject(0);

  constructor(private databaseService: DatabaseService) {
  }

  resetSession() {
    this.numRevisionsInCurrentSession.next(0);
  }

  getNextQuestionDueToday(category: string, lastQuestionId: number): Question {
    const filteredQuestions = this.getAllQuestionsDueToday(category);

    if (filteredQuestions.length === 0
      || this.numRevisionsInCurrentSession.getValue() >= this.databaseService.getMaxRevisionsPerSessionAsValue()) {
      this.numRevisionsInCurrentSession.next(this.databaseService.getMaxRevisionsPerSessionAsValue());
      return null;
    } else {
      SharedModule.shuffleArray(filteredQuestions);
      if (filteredQuestions[0].id === lastQuestionId) {
        filteredQuestions.reverse();
      }
      return SharedModule.shuffleAnswersOfQuestion({...filteredQuestions[0]});
    }
  }

  getMinimumBoxOfCategory(category: string): number {
    const min = Math.min.apply(null, this.databaseService.getCurrentQuestions()
      .filter(question => question.category === category)
      .map(q => {
        if (q.box) {
          return q.box;
        } else {
          return 0;
        }
      }));

    if (min === Infinity) {
      return 0;
    } else {
      return min;
    }
  }

  getAllQuestionsDueToday(category: string): Question[] {
    return this.databaseService.getCurrentQuestions().filter(question => {
      if (question.category !== category) {
        return false;
      }

      if (!question.box) {
        return true;
      } else {
        const dueDate = moment(question.lastVisitDateTime).add(boxToDayDelta[question.box], 'days');
        return dueDate.isBefore(moment());
      }
    });
  }

  processMultipleChoiceQuestionAnswered(id: number, givenAnswerIndex): Promise<boolean> {
    const question = this.databaseService.getCurrentQuestions().find(q => q.id === id);
    return this.processQuestionAnswered(question, givenAnswerIndex === question.correctAnswerIndex);
  }

  processTrueFalseQuestionAnswered(id: number, givenAnswerIndex): Promise<boolean> {
    const question = this.databaseService.getCurrentQuestions().find(q => q.id === id);
    return this.processQuestionAnswered(question, givenAnswerIndex === (question.isTrue ? 0 : 1));
  }

  processOrderQuestionAnswered(id: number, indexOrder): Promise<boolean> {
    const question = this.databaseService.getCurrentQuestions().find(q => q.id === id);
    return this.processQuestionAnswered(question, SharedModule.isSorted(indexOrder));
  }

  private processQuestionAnswered(question: Question, correctly: boolean): Promise<boolean> {
    this.numRevisionsInCurrentSession.next(this.numRevisionsInCurrentSession.getValue() + 1);

    question.lastVisitDateTime = moment().toISOString();

    if (correctly) {
      if (!question.box) {
        question.box = 1;
      } else {
        question.box += question.box === MAX_BOX ? 0 : 1;
      }
    } else {
      question.box = 0;
    }

    return this.databaseService.updateQuestion(question).then(() => correctly);
  }
}
