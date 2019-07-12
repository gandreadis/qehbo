import { Component, OnInit } from '@angular/core';
import {DatabaseService, Question} from '../../services/database.service';
import {SpacedRepetitionService} from '../../services/spaced-repetition.service';
import {MAX_REVISIONS_PER_SESSION} from '../../services/spaced-repetition.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
})
export class QuestionPage implements OnInit {
  question: Question = null;
  selectedAnswer = -1;
  maxRevisions = MAX_REVISIONS_PER_SESSION;
  endScreen = false;

  constructor(public databaseService: DatabaseService, public spacedRepetitionService: SpacedRepetitionService) {}

  ngOnInit() {
    this.databaseService.isReady.subscribe(ready => {
      if (ready) {
        this.spacedRepetitionService.resetSession();
        this.nextQuestion();
      }
    });
  }

  async selectAnswer(index) {
    await this.spacedRepetitionService.processMultipleChoiceQuestionAnswered(this.question.id, index);
    this.selectedAnswer = index;
  }

  nextQuestion() {
    this.selectedAnswer = -1;
    this.question = this.spacedRepetitionService.getNextRevisionQuestion();
    if (this.question === null) {
      this.endScreen = true;
    }
  }
}
