import { Component, OnInit } from '@angular/core';
import {DatabaseService, Question} from '../../services/database.service';
import {SpacedRepetitionService} from '../../services/spaced-repetition.service';
import {SharedModule} from '../../shared/shared.module';
import {DragulaService} from 'ng2-dragula';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
})
export class QuestionPage implements OnInit {
  question: Question = null;
  selectedAnswer = -1;
  previousQuestionId = -1;
  maxRevisions = 0;
  endScreen = false;
  submitted = false;
  answerCorrect = false;
  score = 0;
  category = null;

  constructor(
    public databaseService: DatabaseService,
    public spacedRepetitionService: SpacedRepetitionService,
    private dragulaService: DragulaService,
    private route: ActivatedRoute,
  ) {
    dragulaService.destroy('ANSWERS');
    dragulaService.createGroup('ANSWERS', {
      moves: () => !this.submitted
    });
    databaseService.getScoreAsObservable().subscribe(newScore => this.score = newScore);
    databaseService.getMaxRevisionsPerSessionAsObservable().subscribe(newMaxRevisions => this.maxRevisions = newMaxRevisions);
  }

  ngOnInit() {
    this.databaseService.isReady.subscribe(ready => {
      if (ready) {
        this.route.paramMap.subscribe(params => {
          this.endScreen = false;
          this.category = params.get('id');
          this.spacedRepetitionService.resetSession();
          this.nextQuestion();
        });
      }
    });
  }

  async selectMultipleChoiceAnswer(index) {
    if (this.selectedAnswer !== -1) {
      return;
    }
    this.answerCorrect = await this.spacedRepetitionService.processMultipleChoiceQuestionAnswered(this.question.id, index);
    this.selectedAnswer = index;
    this.submitted = true;
  }

  async selectTrueFalseAnswer(index) {
    if (this.selectedAnswer !== -1) {
      return;
    }
    this.answerCorrect = await this.spacedRepetitionService.processTrueFalseQuestionAnswered(this.question.id, index);
    this.selectedAnswer = index;
    this.submitted = true;
  }

  async submitOrder() {
    this.answerCorrect = await this.spacedRepetitionService.processOrderQuestionAnswered(
      this.question.id,
      this.question.answers.map(a => a.id),
    );
    this.submitted = true;
    SharedModule.sortById(this.question.answers);
  }

  nextQuestion() {
    this.selectedAnswer = -1;
    this.submitted = false;
    this.question = this.spacedRepetitionService.getNextQuestionDueToday(this.category, this.previousQuestionId);
    if (this.question === null) {
      this.endScreen = true;
    } else {
      this.previousQuestionId = this.question.id;
    }
  }
}
