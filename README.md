# Vibly - Proof of Concept

Ce projet est une version démo "proof of concept" réalisée en quelques heures pour tester une nouvelle stack technique pour l'application Vibly.

## 🚨 Important

**Ceci est uniquement un projet de test et non une version de production.** Certaines fonctionnalités ont été implémentées pour tester la nouvelle stack technique, notamment :
- Publication d'annonces
- Gestion des événements
- Création de compte
- Système de chat
- Gestion des associations

## 🏗 Architecture Modulaire

La version de production sera structurée de manière plus modulaire et compartimentée :

- **Modules Autonomes** :
  - Chaque fonctionnalité majeure sera un module indépendant
  - Communication entre modules via des interfaces bien définies
  - Possibilité de déployer et mettre à jour les modules séparément

- **Structure du Projet** :
  ```
  src/
  ├── modules/
  │   ├── auth/           # Module d'authentification
  │   ├── events/         # Module de gestion des événements
  │   ├── associations/   # Module des associations
  │   ├── chat/          # Module de messagerie
  │   └── offers/        # Module des offres
  ├── shared/            # Code partagé entre les modules
  │   ├── components/    # Composants réutilisables
  │   ├── hooks/         # Hooks personnalisés
  │   ├── utils/         # Fonctions utilitaires
  │   └── types/         # Types et interfaces
  └── core/              # Fonctionnalités core de l'application
  ```


## 🛠 Stack Technique

- **Frontend**:
  - React 18
  - Vite
  - TailwindCSS
  - Zustand (State Management)
  - React Query (Data Fetching)
  - React Hook Form (Form Management)

- **Backend**:
  - Supabase (BaaS)
  - PostgreSQL

## ⚠️ Éléments Manquants pour la Production

Les éléments suivants n'ont pas été implémentés dans cette version de test et sont nécessaires pour une version de production :

1. **Migrations SQL**
   - Système de versioning des schémas de base de données
   - Scripts de migration pour les mises à jour

2. **Règles RLS (Row Level Security)**
   - Politiques de sécurité au niveau des lignes dans Supabase
   - Gestion fine des permissions

3. **Fonctions de Sécurité**
   - Validation côté serveur
   - Protection contre les attaques CSRF
   - Rate limiting
   - Autentification plus robuste

4. **Tests**
   - Tests unitaires
   - Tests d'intégration
   - Tests de performance
   - Tests de sécurité

5. **Database Functions**
   - Fonctions stockées pour l'optimisation
   - Triggers pour la cohérence des données
   - Vues matérialisées

6. **Documentation**
   - Documentation technique
   - Documentation API

7. **Edge Functions**
   - Fonctions serverless pour les appels API externes
   - Gestion des webhooks
   - Tâches asynchrones

8. **Environnements**
   - Séparation base de données production/local
   - Variables d'environnement
   - Configuration multi-environnements

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## 📝 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build pour la production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run format` - Formate le code avec Prettier

## 🔒 Sécurité

Cette version de test ne contient pas toutes les mesures de sécurité nécessaires pour une application en production. Ne pas utiliser en production sans avoir implémenté les éléments manquants listés ci-dessus.

