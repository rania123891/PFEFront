import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
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
        children: [] // Les projets seront chargés dynamiquement
      },
      {
        title: 'Afficher tous les projets',
        icon: 'grid-outline',
        link: '/pages/projet'
      },
      {
        title: 'Ajouter un projet',
        icon: 'plus-outline',
        link: '/pages/projet/nouveau'
      }
    ]
  },
  {
    title: 'Équipes',
    icon: 'people-outline',
    children: [
      {
        title: 'Liste des équipes',
        icon: 'list-outline',
        link: '/pages/equipes',
      },
      {
        title: 'Ajouter une équipe',
        icon: 'person-add-outline',
        link: '/pages/equipes/ajouter',
      },
    ],
  },
  {
    title: 'Utilisateurs',
    icon: 'person-outline',
    children: [
      {
        title: 'Liste des utilisateurs',
        icon: 'list-outline',
        link: '/pages/utilisateurs/liste',
      },
    ],
  },
  {
    title: 'Assistant IA',
    icon: 'mic-outline',
    link: '/pages/assistant', // Assure-toi de créer cette route !
  }
]; 