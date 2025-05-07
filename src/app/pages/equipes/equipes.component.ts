import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from './services/utilisateur.service';
import { Utilisateur } from './models/utilisateur.model';

@Component({
  selector: 'ngx-equipes',
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.scss']
})
export class EquipesComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  selectedUsers: Utilisateur[] = [];

  constructor(private utilisateurService: UtilisateurService) { }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs()
      .subscribe(
        (users) => {
          this.utilisateurs = users;
        },
        (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
        }
      );
  }
} 