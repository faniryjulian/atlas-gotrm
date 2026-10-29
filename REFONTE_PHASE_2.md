# Atlas GOTRM V0.8.0 — Phase 2, refonte des modes (premier lot)

## Livré
- Un seul sélecteur visible pour les quatre modes : Exploration libre, Quiz France entière, Défi régional, Campagne RPG.
- Les anciens paramètres internes sont synchronisés automatiquement avec le mode choisi.
- Le choix d’une carte régionale depuis un mode national bascule explicitement en Défi régional.
- Le filtre visuel de région est verrouillé pendant une session pour éviter un décalage avec le territoire joué.
- Le nombre de questions est désactivé en exploration libre, où il n’a pas le même sens.

## Important : limites de ce lot
- Les règles historiques de progression RPG ne sont pas encore modifiées (FB-001).
- Le Défi régional utilise encore le moteur de quiz existant : la validation stricte de session complète sera implémentée au lot suivant.
- Les interactions mobiles (FB-003) et la recherche (FB-004) restent à faire.
- Aucun test navigateur sur appareil réel n’a été exécuté.

## Vérifications recommandées
1. Changer les quatre modes, vérifier les champs visibles et la région sélectionnée.
2. Lancer chaque mode avec une carte chargée et revenir à l’accueil.
3. Vérifier que le mode national ne conserve pas la région précédente.
4. Vérifier que la campagne ne propose pas de région verrouillée.
5. Vérifier le fonctionnement sur GitHub Pages et sur mobile.
