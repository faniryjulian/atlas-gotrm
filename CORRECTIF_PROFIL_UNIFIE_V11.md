# Atlas GOTRM v1.1 — Profil unifié

- Une seule zone visuelle de profil : identité et sauvegarde locale au-dessus, authentification et synchronisation juste en dessous.
- Le statut « invité » devient « connecté » après authentification.
- Le bouton « Créer un compte (bientôt) » est remplacé par un bouton qui dirige vers le formulaire réel.
- Le pseudo et les sauvegardes existantes sont conservés.
- La synchronisation reste **manuelle** pour éviter les conflits silencieux.

## Tests recommandés
1. Déconnecté : profil invité, bouton Créer un compte et formulaire visibles.
2. Connecté : profil connecté, actions de sauvegarde cloud visibles.
3. Déconnexion : retour à l'affichage invité sans perte des données locales.
4. Modification du pseudo, navigation entre pages, export et import sur un deuxième navigateur.
