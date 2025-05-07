import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NbMenuItem } from '@nebular/theme';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuItems = new BehaviorSubject<NbMenuItem[]>([
    {
      title: 'Tableau de bord',
      icon: 'home-outline',
      link: '/pages/dashboard',
      home: true,
    },
    {
      title: 'Projets',
      icon: 'folder-outline',
      children: [
        {
          title: 'Liste des projets',
          icon: 'list-outline',
          link: '/pages/projet',
        },
        {
          title: 'Nouveau projet',
          icon: 'plus-outline',
          link: '/pages/projet/ajouter',
        },
      ],
    },
  ]);

  menuItems$ = this.menuItems.asObservable();

  constructor() {
    // Menu items par défaut
    const defaultMenu: NbMenuItem[] = [
      {
        title: 'Tableau de bord',
        icon: 'home-outline',
        link: '/pages/dashboard',
        home: true,
      },
      {
        title: 'Projet',
        icon: 'folder-outline',
        children: [
          {
            title: 'Liste des projets',
            icon: 'list-outline',
            children: [], // Sera rempli dynamiquement
          },
          {
            title: 'Ajouter un projet',
            icon: 'plus-outline',
            link: '/pages/projet/ajouter',
          },
        ],
      },
    ];
    this.setMenuItems(defaultMenu);
  }

  setMenuItems(items: NbMenuItem[]) {
    this.menuItems.next(items);
  }

  updateProjetsList(projets: any[]) {
    const currentMenu = this.menuItems.getValue();
    const projetsMenuItem = currentMenu.find(item => item.title === 'Projets');

    if (projetsMenuItem && projetsMenuItem.children) {
      // Garder les deux premiers éléments (Liste des projets et Nouveau projet)
      const menuFixe = projetsMenuItem.children.slice(0, 2);
      
      // Ajouter les projets après
      const projetsMenuItems = projets.map(projet => ({
        title: projet.nom,
        icon: 'file-text-outline',
        link: `/pages/projet/${projet.id}/tableau/${projet.tableaux?.[0]?.id || ''}`,
      }));

      projetsMenuItem.children = [...menuFixe, ...projetsMenuItems];
    }

    this.menuItems.next(currentMenu);
  }
} 