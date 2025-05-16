import { Component, OnInit } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent  {
  menu = MENU_ITEMS;

  constructor(
    private router: Router,
  ) {}

  
}
