import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Question} from '../services/database.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class SharedModule {
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
      SharedModule.shuffleArray(copiedAnswers);

      if (question.type === 'order' && SharedModule.arraysEqual(copiedAnswers, question.answers)) {
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

  static sortById(array) {
    array.sort((a, b) => {
      if (a.id < b.id) {
        return -1;
      } else if (a.id > b.id) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
