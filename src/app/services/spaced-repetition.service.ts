import {Injectable} from '@angular/core';
import {DatabaseService, Question} from './database.service';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';

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
export const MAX_REVISIONS_PER_SESSION = 10;

@Injectable({
  providedIn: 'root'
})
export class SpacedRepetitionService {
  public numRevisionsInCurrentSession = new BehaviorSubject(0);
  public numCorrectAnswersGiven = new BehaviorSubject(0);

  constructor(private databaseService: DatabaseService) {
  }

  static chooseOneAtRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static arraysEqual(array1, array2) {
    return JSON.stringify(array1) === JSON.stringify(array2);
  }

  static shuffleAnswersOfQuestion(question: Question): Question {
    if (!question.preserveAnswerOrder) {
      const copiedAnswers = [...question.answers];
      SpacedRepetitionService.shuffleArray(copiedAnswers);

      if (question.type === 'order' && SpacedRepetitionService.arraysEqual(copiedAnswers, question.answers)) {
        copiedAnswers.reverse();
      }

      question.answers = copiedAnswers;
    }
    return question;
  }

  static isSorted(array) {
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] > array[i + 1]) {
        return false;
      }
    }
    return true;
  }

  resetSession() {
    this.numRevisionsInCurrentSession.next(0);
    this.numCorrectAnswersGiven.next(0);
  }

  getNextRevisionQuestion(): Question {
    const filteredQuestions = this.getAllQuestionsDueToday();

    if (filteredQuestions.length === 0 || this.numRevisionsInCurrentSession.getValue() + 1 === MAX_REVISIONS_PER_SESSION) {
      this.numRevisionsInCurrentSession.next(MAX_REVISIONS_PER_SESSION);
      return null;
    } else {
      const chosenQuestion = {...SpacedRepetitionService.chooseOneAtRandom(filteredQuestions)};
      return SpacedRepetitionService.shuffleAnswersOfQuestion(chosenQuestion);
    }
  }

  getAllQuestionsDueToday(): Question[] {
    return this.databaseService.getCurrentQuestions().filter(question => {
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

  processOrderQuestionAnswered(id: number, indexOrder): Promise<boolean> {
    const question = this.databaseService.getCurrentQuestions().find(q => q.id === id);
    return this.processQuestionAnswered(question, SpacedRepetitionService.isSorted(indexOrder));
  }

  private processQuestionAnswered(question: Question, correctly: boolean): Promise<boolean> {
    this.numRevisionsInCurrentSession.next(this.numRevisionsInCurrentSession.getValue() + 1);

    question.lastVisitDateTime = moment().toISOString();

    if (correctly) {
      if (!question.box) {
        question.box = 1;
      }

      question.box += question.box === MAX_BOX ? 0 : 1;
      this.numCorrectAnswersGiven.next(this.numCorrectAnswersGiven.getValue() + 1);
    } else {
      question.box = 0;
    }

    return this.databaseService.updateQuestion(question).then(() => correctly);
  }
}
