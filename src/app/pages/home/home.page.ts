import {Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';

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
  score = 0;

  constructor(public databaseService: DatabaseService) {
    databaseService.getScoreAsObservable().subscribe(newScore => this.score = newScore);
  }
}
