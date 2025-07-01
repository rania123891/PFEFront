import { Component, OnInit, OnDestroy } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { NbMenuItem } from '@nebular/theme';

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
export class PagesComponent implements OnInit, OnDestroy {
  menu: NbMenuItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Écouter les changements de rôle utilisateur
    this.authService.userRole$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(role => {
      this.updateMenuBasedOnRole(role);
    });

    // Initialiser le menu avec le rôle actuel
    const currentRole = this.authService.getRole();
    this.updateMenuBasedOnRole(currentRole);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMenuBasedOnRole(role: string | null) {
    if (role === 'Admin') {
      // Administrateur : afficher tout le menu
      this.menu = MENU_ITEMS;
    } else {
      // Utilisateur normal : filtrer le menu pour exclure la section PARAMÉTRAGE
      this.menu = MENU_ITEMS.filter(item => {
        // Exclure le groupe PARAMÉTRAGE
        if (item.group && item.title === 'PARAMETRAGE') {
          return false;
        }
        
        // Exclure les éléments de la section PARAMÉTRAGE
        const parametrageItems = [
          '/pages/projets',
          '/pages/taches', 
          '/pages/equipes',
          '/pages/equipes/membres',
          '/pages/utilisateurs'
        ];
        
        if (item.link && parametrageItems.includes(item.link)) {
          return false;
        }
        
        return true;
      });
    }
    
    console.log('🔍 Menu mis à jour pour le rôle:', role);
    console.log('📋 Éléments du menu:', this.menu.map(item => ({ title: item.title, link: item.link })));
  }
}
