import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  maxRevisions = 0;
  maxRevisionsMinValue = 5;
  maxRevisionsMaxValue = 200;

  constructor(private databaseService: DatabaseService, private alertController: AlertController) { }

  ngOnInit() {
    this.databaseService.isReady.subscribe(ready => {
      if (ready) {
        this.databaseService.getMaxRevisionsPerSessionAsObservable().subscribe(newMaxRevisions => this.maxRevisions = newMaxRevisions);
      }
    });
  }

  updateMaxRevisions(event) {
    let value = event.target.value > this.maxRevisionsMaxValue ? this.maxRevisionsMaxValue : event.target.value;
    value = value < this.maxRevisionsMinValue ? this.maxRevisionsMinValue : value;
    this.databaseService.updateMaxRevisionsPerSession(value);
  }

  async removeAllData() {
    const alert = await this.alertController.create({
      header: 'Ben je zeker?',
      message: 'Hiermee verwijder je al je data en wordt de app in de oorspronkelijke toestand gebracht.',
      buttons: [
        'Liever toch niet',
        {
          text: 'Ja, verwijder mijn data',
          handler: () => this.databaseService.resetDatabase()
        },
        ]
    });

    await alert.present();
  }
}
