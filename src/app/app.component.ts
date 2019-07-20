import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'qehbo',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Instellingen',
      url: '/settings',
      icon: 'settings'
    },
    {
      title: 'Over deze app',
      url: '/about',
      icon: 'information-circle-outline'
    },
  ];

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private screenOrientation: ScreenOrientation,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(true);

      try {
        await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      } catch (e) {}

      if (window.AndroidNotch) {
        const style = document.documentElement.style;

        window.AndroidNotch.getInsetTop(px => {
          style.setProperty('--ion-safe-area-top', px + 'px');
        }, (err) => console.error('Failed to get insets top:', err));
      }
    });
  }
}
