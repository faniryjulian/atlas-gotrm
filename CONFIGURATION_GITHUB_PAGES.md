# Atlas GOTRM — Supabase + GitHub Pages

- URL du site : https://faniryjulian.github.io/atlas-gotrm/
- URL Supabase : https://tlmkoxucthmnvxvnlrkn.supabase.co
- Clé utilisée : publishable uniquement.
- Table utilisée : `public.player_progress` (`user_id`, `payload`, `updated_at`).
- Les trois politiques RLS doivent limiter SELECT/INSERT/UPDATE à `auth.uid() = user_id`.

## Déploiement
Copier les fichiers de ce dossier **à la racine** du dépôt `faniryjulian/atlas-gotrm`, branche `main`, en conservant les fichiers existants si nécessaire. GitHub Pages publie depuis `main / (root)`.

## Tests
1. Ouvrir le site en navigation privée et créer un compte avec une adresse de test.
2. Confirmer l'email, puis se connecter.
3. Jouer une session, comparer les sauvegardes, et envoyer la progression locale.
4. Sur un second navigateur, se connecter, puis récupérer la progression cloud.
5. Vérifier dans Supabase que la ligne `player_progress` est liée au bon `user_id`.

**Attention :** synchronisation manuelle. Une sauvegarde locale peut être remplacée lors d'un téléchargement cloud : exporter d'abord ses données. Ne jamais mettre de clé secrète dans le dépôt.
