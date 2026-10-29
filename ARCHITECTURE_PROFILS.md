# Atlas GOTRM — architecture des profils

## Implémenté dans cette version
- Profil invité avec pseudonyme local, sans compte ni mot de passe.
- Statistiques pédagogiques et RPG existantes conservées dans les mêmes clés localStorage.
- Export JSON de sauvegarde (sans import automatique pour éviter les écrasements accidentels).
- Tableau de bord clarifié : XP restant, explorés, maîtrisés, succès et détail des compétences.
- Lecture tolérante aux données JSON corrompues pour l’historique et les erreurs.

## Étape suivante : authentification et synchronisation
1. Choisir un fournisseur d’authentification (ex. Supabase Auth) et configurer le projet serveur.
2. Créer `profiles(user_id, nickname, created_at)` et `progress(user_id, data, updated_at, revision)` avec RLS basée sur `auth.uid()`.
3. Migrer le profil invité **après confirmation explicite** : copie locale vers serveur, sans supprimer la sauvegarde locale.
4. Prévoir conflits multi-appareils, versions de schéma, récupération des erreurs réseau et suppression des données.
5. Stocker les secrets uniquement côté serveur; ne jamais stocker les mots de passe dans localStorage.
6. Définir politique de confidentialité, durée de conservation et droits RGPD avant la mise en ligne.

**Attention :** le bouton « Créer un compte » est désactivé tant qu’aucun backend n’est connecté. Cette archive n’offre pas encore de synchronisation réelle.
