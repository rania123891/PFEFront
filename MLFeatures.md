# 🧠 Features ML pour Prédiction ETA

## 📈 Variables d'entrée (Features)

### 1. **Caractéristiques de la tâche**
- **Longueur du titre** : nombre de mots/caractères
- **Longueur de la description** : complexité textuelle
- **Mots-clés techniques** : "API", "CRUD", "interface", "base de données"
- **Type de tâche détecté** : développement, test, documentation, design
- **Priorité estimée** : urgence implicite dans le texte

### 2. **Contexte du projet**
- **Taille du projet** : nombre total de tâches
- **Complexité du projet** : durée moyenne des tâches passées
- **Statut d'avancement** : pourcentage de completion
- **Nombre d'équipiers**
- **Historique de performance** : respect des délais

### 3. **Historique personnel/équipe**
- **Vitesse moyenne** : temps moyen par type de tâche
- **Patterns temporels** : efficacité par heure/jour
- **Spécialisation** : expertise dans certains domaines
- **Charge de travail actuelle**

### 4. **Facteurs temporels**
- **Jour de la semaine** : productivité variable
- **Heure de planification** : matin vs après-midi
- **Proximité de deadline** : effet d'urgence
- **Saison/période** : vacances, fins de mois

## 🎯 Variable de sortie (Target)
- **Durée réelle** : temps effectivement passé sur la tâche (en heures)

## 📊 Algorithmes ML suggérés
1. **Random Forest** : robuste, explicable
2. **Gradient Boosting** : haute précision
3. **Neural Network** : patterns complexes
4. **Linear Regression** : baseline simple 