import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  categories = [
    {
      id: 'procedure',
      title: 'Volgorde van Eerste Hulp',
    },
    {
      id: 'reanimatie',
      title: 'Reanimatie',
    },
  ];

  constructor() {}

}
