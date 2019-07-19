import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss'],
})
export class IntroductionPage implements OnInit, OnDestroy {
  storedValueRead = false;
  observableSubscription = null;
  slideOpts = {
    speed: 400
  };

  constructor(public databaseService: DatabaseService, public router: Router) { }

  ngOnInit() {
    this.storedValueRead = true;
    this.databaseService.isReady.subscribe(ready => {
      if (ready) {
        this.observableSubscription = this.databaseService.getShowedIntroductionAsObservable().subscribe(showed => {
          if (this.storedValueRead) {
            return;
          }
          if (showed) {
            this.router.navigateByUrl('/home');
            return;
          }

          this.storedValueRead = true;
          this.databaseService.updateShowedIntroduction(true);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.observableSubscription.unsubscribe();
    this.storedValueRead = true;
  }
}
