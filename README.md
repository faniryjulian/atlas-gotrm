# Atlas GOTRM V0.6 — Tableau de bord pédagogique

Basé sur la V0.5.4 stable. La V0.5.4 reste intacte.

## Installation
1. Faire une copie de sauvegarde du dossier de la V0.5.4.
2. Décompresser ces trois fichiers dans le dossier utilisé par le serveur Python.
3. Lancer `py -m http.server 8000` depuis ce dossier.
4. Ouvrir http://localhost:8000/index.html?v=0.6 puis actualiser avec Ctrl+Shift+R.

## Fonctionnalités
- Accès au tableau de bord depuis le bandeau supérieur.
- Six indicateurs de progression, réussite par compétence, graphique des 12 dernières sessions, 13 régions, priorités de révision.
- Lecture des mêmes clés localStorage que la V0.5.4 ; aucune migration ni suppression.
- Les anciennes sessions ne détaillent pas la réussite par compétence : cette section utilise le grimoire RPG existant.
