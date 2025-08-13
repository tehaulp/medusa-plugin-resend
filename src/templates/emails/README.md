# Plugin Email Templates for Subscribers

Ce plugin gère l'envoi d'emails personnalisés aux abonnés via des workflows configurables. Il inclut des templates d'emails, des loaders pour la gestion des données, et des providers pour l'intégration avec différents services.

## Structure du projet

- **src/templates/emails/**  
    Contient les templates d'emails au format Markdown ou HTML.  
    Modifiez ces fichiers pour personnaliser le contenu des messages envoyés.

- **src/workflows/**  
    Définit les workflows d'envoi d'emails (ex : inscription, notification, etc.).  
    Chaque workflow peut être configuré pour déclencher des templates spécifiques.

- **src/loaders/**  
    Charge les données nécessaires à la personnalisation des emails (ex : informations sur l'abonné).

- **src/providers/**  
    Fournit l'intégration avec des services d'envoi d'emails (SMTP, API externes, etc.).

## Installation

1. Installez les dépendances :
     ```bash
     npm install
     ```
2. Configurez les providers dans `src/providers/`.
3. Ajoutez ou modifiez les templates dans `src/templates/emails/`.
4. Définissez vos workflows dans `src/workflows/`.

## Utilisation

- Utilisez les loaders pour récupérer les données des abonnés.
- Déclenchez les workflows pour envoyer les emails selon les événements.
- Les templates sont automatiquement remplis avec les données des loaders.

## Personnalisation

- Ajoutez de nouveaux templates dans `src/templates/emails/`.
- Créez des workflows personnalisés dans `src/workflows/`.
- Intégrez de nouveaux providers selon vos besoins.

## Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue sur le dépôt du projet.
