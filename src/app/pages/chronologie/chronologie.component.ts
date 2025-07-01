import { Component, OnInit } from '@angular/core';
import { NbCalendarRange, NbDateService } from '@nebular/theme';
import { ChronologieTunisienService, JourFerieTunisien } from './chronologie-tunisien.service';
import { PlanificationService, Planification, EtatListe } from '../../services/planification.service';
import { TacheService, Tache, PrioriteTache, StatutTache } from '../../services/tache.service';
import { ProjetService, Projet } from '../../services/projet.service';
import { AuthService } from '../../auth/auth.service';
import { UserService, User } from '../../services/user.service';
import { forkJoin } from 'rxjs';

interface JourCalendrier {
  date: Date;
  estDuMoisCourant: boolean;
}

interface EvenementPlanification {
  id?: number;
  titre: string;
  description: string;
  type: 'planification' | 'tache';
  priorite?: PrioriteTache;
  statut?: StatutTache;
  etatListe?: EtatListe;
  heureDebut?: string;
  heureFin?: string;
  couleur?: string;
  data?: Planification | Tache;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    profilePicture?: string;
    initiales: string;
    couleurAvatar: string;
  };
}

@Component({
  selector: 'ngx-chronologie',
  templateUrl: './chronologie.component.html',
  styleUrls: ['./chronologie.component.scss']
})
export class ChronologieComponent implements OnInit {
  
  // Variables pour le calendrier
  date = new Date();
  selectedDate: Date = new Date();
  range: NbCalendarRange<Date> = {
    start: new Date(),
    end: new Date()
  };

  // Mode d'affichage du calendrier
  viewMode: 'month' | 'week' | 'day' = 'month';

  // Jours fériés tunisiens
  joursFeries: JourFerieTunisien[] = [];

  // Jours de la semaine (commençant par lundi)
  joursDeSemine: string[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

  // Grille du calendrier
  joursDeCalendrier: JourCalendrier[] = [];

  // Planifications et tâches
  planifications: Planification[] = [];
  taches: Tache[] = [];
  projets: Projet[] = [];
  utilisateurs: User[] = [];
  evenementsParJour: Map<string, EvenementPlanification[]> = new Map();
  loading: boolean = false;

  // Utilisateur connecté
  currentUser: any = null;

  constructor(
    private dateService: NbDateService<Date>,
    private chronologieService: ChronologieTunisienService,
    private planificationService: PlanificationService,
    private tacheService: TacheService,
    private projetService: ProjetService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Charger les jours fériés de l'année courante
    this.chargerJoursFeries();
    // Générer la grille du calendrier
    this.genererGrilleCalendrier();
    // Charger les données utilisateur et planifications
    this.initializeData();
  }

  private chargerJoursFeries(): void {
    const anneeActuelle = new Date().getFullYear();
    this.joursFeries = this.chronologieService.getJoursFeries(anneeActuelle);
    
    // Charger aussi les jours fériés de l'année suivante si on est en fin d'année
    if (new Date().getMonth() >= 10) { // Novembre/Décembre
      const feriesAnneeSuivante = this.chronologieService.getJoursFeries(anneeActuelle + 1);
      this.joursFeries = [...this.joursFeries, ...feriesAnneeSuivante];
    }
  }

  // Vérifier si une date est un jour férié
  estJourFerie(date: Date): JourFerieTunisien | null {
    return this.chronologieService.estJourFerie(date, this.joursFeries);
  }

  // Obtenir la classe CSS pour un jour férié
  getClasseJourFerie(date: Date): string {
    const ferie = this.estJourFerie(date);
    return ferie ? this.chronologieService.getClasseCssParType(ferie.type) : '';
  }

  // Gestion de la sélection de date
  onDateSelect(date: Date): void {
    this.selectedDate = date;
    console.log('Date sélectionnée:', date);
    
    // Vérifier s'il y a des événements ce jour
    const evenementsJour = this.getEvenementsJour(date);
    if (evenementsJour.length > 0) {
      console.log('Événements ce jour:', evenementsJour);
    }

    // Vérifier s'il s'agit d'un jour férié
    const ferie = this.estJourFerie(date);
    if (ferie) {
      console.log('Jour férié:', ferie);
    }
  }

  // Obtenir les événements d'un jour
  getEvenementsJour(date: Date): EvenementPlanification[] {
    const dateStr = this.formatDateToString(date);
    return this.evenementsParJour.get(dateStr) || [];
  }



  // Changer le mode d'affichage
  changerVue(mode: 'month' | 'week' | 'day'): void {
    this.viewMode = mode;
  }

  // Formatage des dates en français
  formaterDateFrancaise(date: Date): string {
    return this.chronologieService.formaterDateFrancaise(date);
  }

  // Obtenir le nom du mois en français
  getNomMois(date: Date): string {
    return this.chronologieService.formaterDateFrancaise(date, 'mois');
  }

  // Filtrer les jours fériés par type
  getJoursFeriesParType(type: 'religieux' | 'national' | 'civil'): JourFerieTunisien[] {
    return this.joursFeries.filter(ferie => ferie.type === type);
  }

  // Obtenir les prochains jours fériés
  getProchainsFeries(): JourFerieTunisien[] {
    return this.chronologieService.getProchainsFeries(5);
  }

  // Générer la grille du calendrier
  genererGrilleCalendrier(): void {
    this.joursDeCalendrier = [];
    
    const date = new Date(this.date);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Calculer le premier jour de la grille (début de semaine = lundi)
    const firstDayOfGrid = new Date(firstDayOfMonth);
    // getDay() retourne 0=dimanche, 1=lundi, ..., 6=samedi
    // Pour avoir lundi=0, on fait (getDay() + 6) % 7
    // Mais il faut ajuster car on veut que dimanche soit en position 6
    let dayOfWeek = firstDayOfMonth.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Dimanche devient 7
    dayOfWeek = dayOfWeek - 1; // Maintenant lundi=0, mardi=1, ..., dimanche=6
    firstDayOfGrid.setDate(firstDayOfGrid.getDate() - dayOfWeek);
    
    // Debug pour vérifier l'alignement
    console.log('🗓️ Mois:', date.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'}));
    console.log('📅 1er du mois:', firstDayOfMonth.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric'}), '(jour', firstDayOfMonth.getDay(), ')');
    console.log('📅 Début grille:', firstDayOfGrid.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric'}));
    
    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(firstDayOfGrid.getTime() + (i * 24 * 60 * 60 * 1000));
      
      this.joursDeCalendrier.push({
        date: new Date(currentDate),
        estDuMoisCourant: currentDate.getMonth() === date.getMonth()
      });
    }
    
    // Vérification des 7 premiers jours (première semaine)
    const premiereSemine = this.joursDeCalendrier.slice(0, 7);
    console.log('📋 Première semaine:', premiereSemine.map(j => 
      `${j.date.getDate()}/${j.date.getMonth() + 1}=${['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][j.date.getDay()]}`
    ));
  }

  // Fonction de tracking pour ngFor
  trackByJour(index: number, jour: JourCalendrier): string {
    return jour.date.toDateString();
  }

  // Vérifier si c'est aujourd'hui
  estAujourdhui(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Vérifier si une date est sélectionnée
  estSelectionne(date: Date): boolean {
    return this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
  }

  // Vérifier si c'est un weekend
  estWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Dimanche ou samedi
  }

  // Obtenir le statut Nebular selon le type de jour férié
  getStatusParType(type: string): string {
    switch(type) {
      case 'national': return 'danger';
      case 'religieux': return 'warning';
      case 'civil': return 'info';
      default: return 'basic';
    }
  }

  // Obtenir l'emoji selon le type
  getEmojiParType(type: string): string {
    switch(type) {
      case 'national': return '🇹🇳';
      case 'religieux': return '☪️';
      case 'civil': return '🎉';
      default: return '📅';
    }
  }

  // Obtenir le symbole de priorité
  getPrioriteSymbol(priorite: PrioriteTache): string {
    switch(priorite) {
      case PrioriteTache.Elevee: return '🔴';
      case PrioriteTache.Moyenne: return '🟡';
      case PrioriteTache.Faible: return '🟢';
      default: return '';
    }
  }

  // Obtenir le label de priorité
  getPrioriteLabel(priorite: PrioriteTache): string {
    switch(priorite) {
      case PrioriteTache.Elevee: return 'Élevée';
      case PrioriteTache.Moyenne: return 'Moyenne';
      case PrioriteTache.Faible: return 'Faible';
      default: return 'Inconnue';
    }
  }

  // Obtenir les initiales d'un utilisateur
  getUtilisateurInitiales(utilisateur: User): string {
    const prenom = utilisateur.prenom || '';
    const nom = utilisateur.nom || '';
    
    const initialePrenom = prenom.charAt(0).toUpperCase();
    const initialeNom = nom.charAt(0).toUpperCase();
    
    if (initialePrenom && initialeNom) {
      return `${initialePrenom}${initialeNom}`;
    } else if (initialePrenom) {
      return initialePrenom;
    } else if (initialeNom) {
      return initialeNom;
    } else {
      return utilisateur.email.charAt(0).toUpperCase();
    }
  }

  // Obtenir une couleur unique pour l'avatar d'un utilisateur
  getUtilisateurCouleur(userId: number): string {
    const couleurs = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C0E9', '#D2B4DE'
    ];
    
    return couleurs[userId % couleurs.length];
  }

  // Construire l'URL de l'image de profil
  getUtilisateurImageUrl(profilePicture?: string): string | null {
    console.log('🖼️ getUtilisateurImageUrl appelée avec:', profilePicture);
    
    if (!profilePicture) {
      console.log('❌ Pas de profilePicture fourni');
      return null;
    }
    
    if (profilePicture.startsWith('/')) {
      const fileName = profilePicture.split('/').pop();
      const url = `http://localhost:5093/user/api/Utilisateur/image/${fileName}`;
      console.log('✅ URL construite pour image relative:', url);
      return url;
    }
    
    console.log('✅ URL directe retournée:', profilePicture);
    return profilePicture;
  }

  // Gérer les erreurs de chargement d'avatar
  onAvatarError(event: any, utilisateur: any): void {
    utilisateur.showInitials = true;
    event.target.style.display = 'none';
  }

  // ===== MÉTHODES POUR LES PLANIFICATIONS =====

  // Initialiser les données
  initializeData(): void {
    this.loading = true;
    
    if (!this.authService.isAuthenticated()) {
      console.warn('Aucun utilisateur connecté');
      this.loading = false;
      return;
    }
    
    this.currentUser = { token: this.authService.getToken(), role: this.authService.getRole() };

    // Charger projets, tâches et utilisateurs en parallèle
    forkJoin({
      projets: this.projetService.getProjets(),
      taches: this.tacheService.getTaches(),
      utilisateurs: this.userService.getUsers()
    }).subscribe({
      next: (data) => {
        this.projets = data.projets;
        this.taches = data.taches;
        this.utilisateurs = data.utilisateurs;
        
        console.log('✅ Données chargées - Projets:', this.projets.length, 'Tâches:', this.taches.length, 'Utilisateurs:', this.utilisateurs.length);
        console.log('👥 Détail des utilisateurs chargés:', this.utilisateurs);
        
        // Vérifier spécifiquement Rania Bouachir
        const rania = this.utilisateurs.find(u => u.prenom?.toLowerCase() === 'rania' && u.nom?.toLowerCase() === 'bouachir');
        if (rania) {
          console.log('🎯 Rania Bouachir trouvée:', rania);
          console.log('📸 Photo de profil de Rania:', rania.profilePicture);
        }
        
        // Charger les planifications du mois
        this.chargerPlanificationsDuMois();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.loading = false;
      }
    });
  }

  // Charger les planifications du mois visible
  chargerPlanificationsDuMois(): void {
    if (!this.currentUser) return;

    console.log('🔍 Chargement des planifications du mois...');

    // Charger d'abord toutes les planifications (approche simplifiée)
    this.planificationService.getAllPlanificationsSimple().subscribe({
      next: (planifications: Planification[]) => {
        console.log('✅ Toutes les planifications chargées:', planifications.length);
        
        // Organiser les planifications par jour
        this.evenementsParJour.clear();
        
        planifications.forEach(planif => {
          const dateStr = typeof planif.date === 'string' ? planif.date.split('T')[0] : this.formatDateToString(new Date(planif.date));
          
          if (!this.evenementsParJour.has(dateStr)) {
            this.evenementsParJour.set(dateStr, []);
          }
          
          const evenements = this.convertirPlanificationsEnEvenements([planif]);
          const evenementsExistants = this.evenementsParJour.get(dateStr) || [];
          this.evenementsParJour.set(dateStr, [...evenementsExistants, ...evenements]);
        });

        console.log('📅 Événements organisés pour', this.evenementsParJour.size, 'jours');
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des planifications:', error);
        
        // Fallback : essayer avec l'endpoint basique
        this.planificationService.getPlanifications().subscribe({
          next: (planifications: Planification[]) => {
            console.log('✅ Fallback: Planifications chargées:', planifications.length);
            
            // Organiser les planifications par jour
            this.evenementsParJour.clear();
            
            planifications.forEach(planif => {
              const dateStr = typeof planif.date === 'string' ? planif.date.split('T')[0] : this.formatDateToString(new Date(planif.date));
              
              if (!this.evenementsParJour.has(dateStr)) {
                this.evenementsParJour.set(dateStr, []);
              }
              
              const evenements = this.convertirPlanificationsEnEvenements([planif]);
              const evenementsExistants = this.evenementsParJour.get(dateStr) || [];
              this.evenementsParJour.set(dateStr, [...evenementsExistants, ...evenements]);
            });

            console.log('📅 Événements organisés pour', this.evenementsParJour.size, 'jours');
            this.loading = false;
          },
          error: (fallbackError) => {
            console.error('❌ Erreur fallback:', fallbackError);
            this.loading = false;
          }
        });
      }
    });
  }

  // Convertir les planifications en événements pour affichage
  convertirPlanificationsEnEvenements(planifications: Planification[]): EvenementPlanification[] {
    const evenements: EvenementPlanification[] = [];

    planifications.forEach(planif => {
      const tache = this.taches.find(t => t.id === planif.tacheId);
      const projet = this.projets.find(p => p.id === planif.projetId);
      const utilisateur = this.utilisateurs.find(u => u.id === planif.userId);

      console.log(`🔍 Planification ${planif.id}: userId=${planif.userId}, utilisateur trouvé:`, utilisateur);
      if (utilisateur) {
        console.log(`👤 Utilisateur ${utilisateur.prenom} ${utilisateur.nom} - Photo:`, utilisateur.profilePicture);
      }

      if (tache) {
        const evenement: EvenementPlanification = {
          id: planif.id,
          titre: tache.titre,
          description: `${planif.description || ''}\nProjet: ${projet?.nom || 'Inconnu'}\nStatut: ${this.getEtatLabel(planif.listeId)}\nAssigné à: ${utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : 'Inconnu'}`,
          type: 'planification',
          priorite: tache.priorite,
          statut: tache.statut,
          etatListe: planif.listeId,
          heureDebut: planif.heureDebut,
          heureFin: planif.heureFin,
          couleur: this.getCouleurPlanification(planif.listeId, tache.priorite),
          data: planif,
          utilisateur: utilisateur ? {
            id: utilisateur.id,
            nom: utilisateur.nom || '',
            prenom: utilisateur.prenom || '',
            email: utilisateur.email,
            profilePicture: this.getUtilisateurImageUrl(utilisateur.profilePicture),
            initiales: this.getUtilisateurInitiales(utilisateur),
            couleurAvatar: this.getUtilisateurCouleur(utilisateur.id)
          } : undefined
        };

        evenements.push(evenement);
      }
    });

    return evenements;
  }

  // Obtenir la couleur selon l'état et la priorité
  getCouleurPlanification(etat: EtatListe, priorite: PrioriteTache): string {
    // Couleur principale selon l'état
    let couleurBase = '';
    switch (etat) {
      case EtatListe.Todo:
        couleurBase = '#6c757d'; // Gris
        break;
      case EtatListe.EnCours:
        couleurBase = '#007bff'; // Bleu
        break;
      case EtatListe.Test:
        couleurBase = '#ffc107'; // Jaune
        break;
      case EtatListe.Termine:
        couleurBase = '#28a745'; // Vert
        break;
      default:
        couleurBase = '#6c757d';
    }

    // Ajuster selon la priorité
    switch (priorite) {
      case PrioriteTache.Elevee:
        return etat === EtatListe.Termine ? couleurBase : '#dc3545'; // Rouge pour priorité élevée
      case PrioriteTache.Moyenne:
        return etat === EtatListe.Termine ? couleurBase : '#fd7e14'; // Orange pour priorité moyenne
      case PrioriteTache.Faible:
      default:
        return couleurBase;
    }
  }

  // Obtenir le label de l'état
  getEtatLabel(etat: EtatListe): string {
    return this.planificationService.getEtatLabel(etat);
  }

  // Formater une date en string YYYY-MM-DD
  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Override des méthodes de navigation pour recharger les planifications
  changerMois(direction: 'previous' | 'next'): void {
    const currentDate = new Date(this.date);
    if (direction === 'previous') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.date = currentDate;
    
    // Recharger les jours fériés si on change d'année
    if (currentDate.getFullYear() !== this.date.getFullYear()) {
      this.chargerJoursFeries();
    }
    
    // Régénérer la grille du calendrier
    this.genererGrilleCalendrier();
    
    // Recharger les planifications du nouveau mois
    this.chargerPlanificationsDuMois();
  }

  allerAujourdhui(): void {
    this.date = new Date();
    this.selectedDate = new Date();
    this.genererGrilleCalendrier();
    this.chargerPlanificationsDuMois();
  }
} 