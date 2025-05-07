import { Component, OnInit } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';
import { ProjetMenuService } from './projet/services/projet-menu.service';
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
export class PagesComponent implements OnInit {
  menu = MENU_ITEMS;

  constructor(
    private projetMenuService: ProjetMenuService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Mettre à jour le menu au démarrage
    this.projetMenuService.updateProjetsMenu();

    // Mettre à jour le menu à chaque changement de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.projetMenuService.updateProjetsMenu();
    });
  }
}
