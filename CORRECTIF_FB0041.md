# FB-004.1 — Parcours recherche → fiche historique

- Sélection d'un résultat ou d'un département sur la carte : fermeture du panneau de recherche, affichage d'un résumé et d'un bouton « Nouvelle recherche ».
- Ouverture immédiate de la fiche historique existante, puis défilement vers celle-ci (prise en compte du mode réduit d'animations).
- Les filtres de recherche sont réinitialisés après la sélection afin que le département reste visible dans la liste et sur la carte.
- La saisie seule ne ferme jamais la recherche.
- Aucun historique de jeu, XP ou donnée de progression n'est modifié.

Validation statique : `node --check app.js`. Tests navigateur et mobile à réaliser.
