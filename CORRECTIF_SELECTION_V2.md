# Correctif de l'enchaînement libre — V2

Le clic physique sur les départements est désormais traité uniquement au relâchement du pointeur, et non à la fois par `pointerup` et `click`. Le `click` natif est conservé pour l'activation clavier (detail = 0), afin de préserver l'accessibilité.

Après validation d'une réponse en Exploration libre, la sélection d'un autre département non traité appelle `renderFree()`, réinitialise les champs et active le nouveau département. Les réponses précédentes sont conservées.

Vérification effectuée : `node --check app.js`. Le test réel en navigateur reste à réaliser.
