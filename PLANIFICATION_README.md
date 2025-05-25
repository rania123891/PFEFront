# Fonctionnalité de Planification - Guide d'utilisation

## Vue d'ensemble

La fonctionnalité de planification permet de créer et gérer des tâches planifiées avec un tableau Kanban interactif à 4 colonnes :
- **To Do** : Tâches planifiées à faire
- **En Cours** : Tâches en cours d'exécution  
- **Test** : Tâches en phase de test
- **Terminé** : Tâches terminées

## Structure Backend (.NET)

### Modèles
- `Planification.cs` : Modèle principal avec enum `EtatListe`
- DTOs : `CreatePlanificationDto`, `UpdatePlanificationDto`, `UpdatePlanificationStatusDto`

### API Endpoints
- `GET /projet/api/planification` - Toutes les planifications
- `GET /projet/api/planification/{id}` - Une planification par ID
- `GET /projet/api/planification/date/{date}` - Planifications par date
- `POST /projet/api/planification` - Créer une planification
- `PATCH /projet/api/planification/{id}/statut` - Changer le statut
- `DELETE /projet/api/planification/{id}` - Supprimer

### Configuration requise
- Repository pattern : `IPlanificationRepository` et `PlanificationRepository`
- Injection de dépendance configurée dans `Program.cs`
- CORS activé pour Angular
- Entity Framework avec relations vers `Tache` et `Projet`

## Structure Frontend (Angular)

### Services
- `PlanificationService` : Gestion des appels API avec gestion d'erreur
- URLs d'API configurées dans `environment.ts`

### Composants
- `PlanificationComponent` : Interface Kanban avec formulaire de création
- Module lazy-loaded avec routing configuré

### Fonctionnalités
- Sélection de date avec DatePicker Nebular
- Formulaire de création avec validation des heures
- Drag & Drop virtuel entre colonnes via boutons d'action
- Gestion d'erreur avec fallback vers données mock
- Interface responsive avec animations CSS

## Comment démarrer

1. **Backend** : S'assurer que l'API .NET fonctionne sur `http://localhost:5093`
2. **Frontend** : Lancer Angular avec `npm start` sur `http://localhost:4200`
3. **Navigation** : Aller à `/pages/planification`

## Utilisation

1. **Sélectionner une date** avec le DatePicker
2. **Choisir les heures** de début et fin
3. **Sélectionner un projet** (charge automatiquement les tâches)
4. **Choisir une tâche** du projet
5. **Ajouter une description** (optionnel)
6. **Cliquer sur "Ajouter"** pour créer la planification

### Actions sur les cartes
- **Flèches** : Déplacer entre colonnes (Todo → En Cours → Test → Terminé)
- **Éditer** : Modifier la planification (fonction à implémenter)
- **Supprimer** : Supprimer la planification avec confirmation

## Gestion d'erreur

Si l'API backend n'est pas disponible :
- Les données mock sont affichées automatiquement
- Les nouvelles planifications sont ajoutées localement
- Une notification informe l'utilisateur du mode offline

## Styling

Interface moderne avec :
- Design Material/Nebular
- Animations au survol
- Couleurs distinctes par colonne
- Responsive design
- Loading spinners

## Configuration CORS

Le backend doit autoriser les requêtes depuis `http://localhost:4200` :
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy => policy.WithOrigins("http://localhost:4200")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
``` 