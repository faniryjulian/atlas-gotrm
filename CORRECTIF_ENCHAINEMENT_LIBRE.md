# Correctif — Enchaînement direct en Exploration libre

Après validation d'une réponse, un clic bref sur un **autre département non encore traité** démarre immédiatement l'exercice suivant et sélectionne ce département. Le bouton « Choisir un autre département » reste disponible, sans être obligatoire.

- Les résultats déjà enregistrés sont conservés.
- Cliquer sur un département déjà traité ne crée pas de doublon.
- Le mode Quiz France entière conserve son fonctionnement séquentiel.
- Quand le quota de réponses est atteint, la sélection suivante conduit aux résultats.

Vérification effectuée : syntaxe JavaScript avec `node --check`. Tests navigateur à réaliser.
