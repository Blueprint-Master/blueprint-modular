"""
Exemple d'app BPM — à lancer avec : bpm run app.py
(Depuis la racine du repo après pip install -e .)
"""
import bpm

bpm.title("Blueprint Modular")
bpm.write("Briques prêtes. Vous écrivez la logique.")
bpm.metric("Valeur", 142500, delta=3200)
bpm.metric("Autre", 99)
if bpm.button("Cliquez ici"):
    bpm.write("Vous avez cliqué !")
bpm.divider()
bpm.panel("Info", "Ce panneau est rendu par bpm.panel().", variant="info")
