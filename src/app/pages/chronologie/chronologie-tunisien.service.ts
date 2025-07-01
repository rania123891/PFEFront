import { Injectable } from '@angular/core';

export interface JourFerieTunisien {
  date: Date;
  nom: string;
  type: 'religieux' | 'national' | 'civil';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChronologieTunisienService {

  // Jours fériés fixes tunisiens (calendrier grégorien)
  private joursFeriesFixes: Omit<JourFerieTunisien, 'date'>[] = [
    {
      nom: 'Nouvel An',
      type: 'civil',
      description: 'Premier jour de l\'année civile'
    },
    {
      nom: 'Fête de l\'Indépendance',
      type: 'national',
      description: 'Commémoration de l\'indépendance de la Tunisie (20 mars 1956)'
    },
    {
      nom: 'Journée des Martyrs',
      type: 'national',
      description: 'Hommage aux martyrs de la révolution tunisienne'
    },
    {
      nom: 'Fête du Travail',
      type: 'civil',
      description: 'Journée internationale des travailleurs'
    },
    {
      nom: 'Fête de la République',
      type: 'national',
      description: 'Proclamation de la République tunisienne (25 juillet 1957)'
    },
    {
      nom: 'Journée de la Femme',
      type: 'civil',
      description: 'Promulgation du Code du statut personnel (13 août 1956)'
    },
    {
      nom: 'Fête de l\'Évacuation',
      type: 'national',
      description: 'Évacuation des dernières troupes françaises (15 octobre 1963)'
    }
  ];

  // Mois en français (tunisien)
  private moisFrancais = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  // Jours de la semaine en français (commençant par lundi)
  private joursFrancais = [
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'
  ];

  constructor() { }

  /**
   * Obtenir tous les jours fériés pour une année donnée
   */
  getJoursFeries(annee: number): JourFerieTunisien[] {
    const jours: JourFerieTunisien[] = [];

    // Ajouter les jours fériés fixes
    const datesFixes = [
      { mois: 0, jour: 1 },   // 1er janvier
      { mois: 2, jour: 20 },  // 20 mars
      { mois: 3, jour: 9 },   // 9 avril
      { mois: 4, jour: 1 },   // 1er mai
      { mois: 6, jour: 25 },  // 25 juillet
      { mois: 7, jour: 13 },  // 13 août
      { mois: 9, jour: 15 }   // 15 octobre
    ];

    datesFixes.forEach((dateFixe, index) => {
      jours.push({
        date: new Date(annee, dateFixe.mois, dateFixe.jour),
        ...this.joursFeriesFixes[index]
      });
    });

    // Ajouter les fêtes religieuses (dates approximatives - dans un vrai projet, 
    // vous utiliseriez une API ou une librairie pour calculer les dates exactes du calendrier lunaire)
    const fetesReligieuses = this.getFetesReligieuses(annee);
    jours.push(...fetesReligieuses);

    return jours.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Calculer les fêtes religieuses (dates approximatives)
   * Note: Dans un projet réel, il faudrait utiliser une librairie spécialisée
   * pour calculer les dates exactes du calendrier lunaire
   */
  private getFetesReligieuses(annee: number): JourFerieTunisien[] {
    // Dates approximatives pour 2024-2025 (à ajuster avec une vraie API islamique)
    const fetesParAnnee: { [key: number]: { mois: number, jour: number, nom: string, description: string }[] } = {
      2024: [
        { mois: 3, jour: 10, nom: 'Aïd el-Fitr', description: 'Fin du mois de Ramadan' },
        { mois: 5, jour: 17, nom: 'Aïd el-Adha', description: 'Fête du sacrifice' },
        { mois: 6, jour: 7, nom: 'Nouvel An Hégirien', description: 'Premier jour de l\'année musulmane' },
        { mois: 8, jour: 15, nom: 'Mouloud', description: 'Naissance du Prophète Mohammed' }
      ],
      2025: [
        { mois: 2, jour: 30, nom: 'Aïd el-Fitr', description: 'Fin du mois de Ramadan' },
        { mois: 5, jour: 6, nom: 'Aïd el-Adha', description: 'Fête du sacrifice' },
        { mois: 5, jour: 26, nom: 'Nouvel An Hégirien', description: 'Premier jour de l\'année musulmane' },
        { mois: 8, jour: 4, nom: 'Mouloud', description: 'Naissance du Prophète Mohammed' }
      ]
    };

    const fetes = fetesParAnnee[annee] || [];
    
    return fetes.map(fete => ({
      date: new Date(annee, fete.mois, fete.jour),
      nom: fete.nom,
      type: 'religieux' as const,
      description: fete.description
    }));
  }

  /**
   * Vérifier si une date est un jour férié
   */
  estJourFerie(date: Date, joursFeries?: JourFerieTunisien[]): JourFerieTunisien | null {
    const feries = joursFeries || this.getJoursFeries(date.getFullYear());
    return feries.find(ferie => 
      ferie.date.toDateString() === date.toDateString()
    ) || null;
  }

  /**
   * Formater une date en français tunisien
   */
  formaterDateFrancaise(date: Date, format: 'complet' | 'court' | 'mois' = 'complet'): string {
    const jourSemaine = this.joursFrancais[(date.getDay() + 6) % 7]; // Conversion pour commencer par lundi
    const jour = date.getDate();
    const mois = this.moisFrancais[date.getMonth()];
    const annee = date.getFullYear();

    switch (format) {
      case 'complet':
        return `${jourSemaine} ${jour} ${mois} ${annee}`;
      case 'court':
        return `${jour} ${mois} ${annee}`;
      case 'mois':
        return `${mois} ${annee}`;
      default:
        return `${jourSemaine} ${jour} ${mois} ${annee}`;
    }
  }

  /**
   * Obtenir le nom du mois en français
   */
  getNomMois(numeroMois: number): string {
    return this.moisFrancais[numeroMois] || '';
  }

  /**
   * Obtenir le nom du jour de la semaine en français
   */
  getNomJour(numeroJour: number): string {
    // numeroJour: 0 = dimanche, 1 = lundi, etc.
    // Conversion pour que 0 = lundi
    const index = (numeroJour + 6) % 7;
    return this.joursFrancais[index] || '';
  }

  /**
   * Obtenir les prochains jours fériés
   */
  getProchainsFeries(limite: number = 5): JourFerieTunisien[] {
    const maintenant = new Date();
    const anneeActuelle = maintenant.getFullYear();
    
    // Récupérer les fêtes de cette année et de l'année suivante
    const feriesAnneeActuelle = this.getJoursFeries(anneeActuelle);
    const feriesAnneeSuivante = this.getJoursFeries(anneeActuelle + 1);
    
    const tousLesFeries = [...feriesAnneeActuelle, ...feriesAnneeSuivante];
    
    // Filtrer pour ne garder que les fêtes futures
    const feriesFutures = tousLesFeries.filter(ferie => ferie.date > maintenant);
    
    // Retourner les premiers jours fériés selon la limite
    return feriesFutures.slice(0, limite);
  }

  /**
   * Obtenir la classe CSS pour un type de fête
   */
  getClasseCssParType(type: 'religieux' | 'national' | 'civil'): string {
    const classes = {
      'national': 'jour-ferie-national',
      'religieux': 'jour-ferie-religieux',
      'civil': 'jour-ferie-civil'
    };
    return classes[type] || '';
  }

  /**
   * Obtenir l'emoji correspondant au type de fête
   */
  getEmojiParType(type: 'religieux' | 'national' | 'civil'): string {
    const emojis = {
      'national': '🇹🇳',
      'religieux': '☪️',
      'civil': '🎉'
    };
    return emojis[type] || '📅';
  }
} 