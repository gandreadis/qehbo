import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

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
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(true);
      this.splashScreen.hide();

      if (window.AndroidNotch) {
        const style = document.documentElement.style;

        window.AndroidNotch.getInsetTop(px => {
          style.setProperty('--ion-safe-area-top', px + 'px');
        }, (err) => console.error('Failed to get insets top:', err));
      }
    });
  }
}
