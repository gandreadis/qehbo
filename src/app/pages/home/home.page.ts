import {Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {SpacedRepetitionService} from '../../services/spaced-repetition.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  categories = [
    {
      id: 'levensbedreigende-letsels',
      title: 'Levensbedreigende letsels en ziekten',
    },
    {
      id: 'overige-letsels',
      title: 'Overige letsels en ziekten',
    },
    {
      id: '112-bellen',
      title: '112 - ja of nee?',
    },
  ];
  categoriesAreActive = {};
  score = 0;

  constructor(public databaseService: DatabaseService, public spacedRepetitionService: SpacedRepetitionService) {
    databaseService.getQuestionsAsObservable().subscribe(() => {
      this.categoriesAreActive = {};
      this.categories.forEach(category => {
        this.categoriesAreActive[category.id] = spacedRepetitionService.getAllQuestionsDueToday(category.id).length > 0;
      });
    });
    databaseService.getScoreAsObservable().subscribe(newScore => this.score = newScore);
  }
}
