# Correctif v1.0.1 — Mode invité et authentification

- Utilise `auth.getSession()` au démarrage, afin de ne pas traiter une absence normale de session comme une erreur.
- Préserve le mode invité et les données locales.
- Récupère `updated_at` après la première insertion cloud pour permettre les synchronisations suivantes.
- Test manuel nécessaire : invité, inscription, confirmation, connexion, envoi et récupération.
