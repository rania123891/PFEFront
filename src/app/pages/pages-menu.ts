import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Messages',
    icon: 'message-circle-outline',
    link: '/pages/messages',
  },
  {
    group: true,
    title: 'PARAMETRAGE',
  },
  {
    title: 'Projets',
    icon: 'folder-outline',
    link: '/pages/projets',
  },
  {
    title: 'Tâches',
    icon: 'checkmark-square-outline',
    link: '/pages/taches',
  },
  {
    title: 'Équipes',
    icon: 'people-outline',
    link: '/pages/equipes',
  },
  {
    title: 'Membres Equipe',
    icon: 'person-outline',
    link: '/pages/equipes/membres',
  },
  {
    title: 'Utilisateurs',
    icon: 'person-outline',
    link: '/pages/utilisateurs',
  },
  {
    group: true,
    title: 'TABLESHEET',
  },
  {
    title: 'Planification de travail',
    icon: 'calendar-outline',
    link: '/pages/planification',
  },
  {
    group: true,
    title: 'AI ASSISTANT',
  },
  {
    title: 'Assistant',
    icon: 'bulb-outline',
    link: '/pages/assistant',
  },
]; 