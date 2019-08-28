import {Component, Input, OnInit} from '@angular/core';
import {SpacedRepetitionService} from '../../services/spaced-repetition.service';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-box-stars',
  templateUrl: './box-stars.component.html',
  styleUrls: ['./box-stars.component.scss'],
})
export class BoxStarsComponent implements OnInit {
  @Input() public category: string;

  numBoxes = 0;

  constructor(public spacedRepetitionService: SpacedRepetitionService, public databaseService: DatabaseService) {
  }

  ngOnInit() {
    this.databaseService.isReady.subscribe(ready => {
      if (ready) {
        this.numBoxes = this.spacedRepetitionService.getMinimumBoxOfCategory(this.category);
        this.databaseService.getQuestionsAsObservable().subscribe(() => {
          this.numBoxes = this.spacedRepetitionService.getMinimumBoxOfCategory(this.category);
        });
      }
    });
  }
}
