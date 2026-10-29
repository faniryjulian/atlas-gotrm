# Atlas GOTRM v1.0 — Activer la synchronisation

## 1. Créer le projet
Créer un projet sur https://supabase.com, puis ouvrir **SQL Editor** et exécuter `supabase-schema.sql`.

## 2. Activer les comptes
Dans Authentication > Providers > Email, activer les comptes email et la confirmation par email. Configurer **Site URL** et les URLs de redirection autorisées avec l’URL HTTPS réelle du site (ex. GitHub Pages). Pour tester en local, utiliser un serveur HTTP local plutôt que `file://`.

## 3. Configurer le site
Dans Project Settings > API, récupérer **Project URL** et la clé **publishable** (ou `anon` héritée). Dans `supabase-config.js`, remplacer les deux chaînes vides. Ne jamais publier la clé `service_role` / `secret`.

## 4. Publier
Déployer les fichiers du ZIP sur un hébergement HTTPS. Vérifier que le CDN jsDelivr n’est pas bloqué. Sans configuration, le mode invité reste fonctionnel.

## 5. Tester
1. Jouer en invité et exporter une sauvegarde JSON.
2. Créer un compte, confirmer l’email, se connecter.
3. Cliquer sur **Envoyer ma progression locale**.
4. Sur un autre navigateur, se connecter et choisir **Récupérer ma progression cloud**.
5. Vérifier que la progression et le pseudonyme correspondent.
6. Tester les conflits : modifier la progression sur deux appareils puis comparer les sauvegardes avant tout envoi.

## Fonctionnement et limites
- Synchronisation **manuelle** dans cette version, pour éviter d’écraser silencieusement les données. Il faut envoyer sa progression après chaque session et la récupérer sur l’autre appareil avant de jouer.
- Les comptes et la synchronisation nécessitent Internet ; le mode invité fonctionne hors connexion si la carte est disponible.
- Les données locales ne sont jamais effacées lors de la déconnexion.
- Une sauvegarde cloud existante peut être remplacée uniquement après confirmation. Le serveur utilise une révision pour refuser les écritures concurrentes.
- Avant une mise en production publique : rédiger politique de confidentialité, prévoir suppression/export des données, politique de conservation et tests de sécurité. Aucun écran de suppression de compte n’est fourni dans cette version.
