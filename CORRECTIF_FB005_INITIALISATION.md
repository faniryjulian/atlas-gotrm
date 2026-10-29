# Correctif FB-005 — Initialisation

Cause : `freeRegionSelect` appelait `$()` avant la déclaration `const $`, ce qui provoquait une ReferenceError et interrompait l’exécution du script avant l’initialisation de l’interface.

Correction : déclarer `$` avant son premier appel. Aucun changement du stockage local.

Tests à effectuer : chargement de l’accueil, paramètres Exploration libre, disparition du quota, quatre modes, lancement de session, carte et encyclopédie.
