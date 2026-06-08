# Space Arcade — Chauny

Site vitrine statique pour **Space Arcade**, salle de jeux rétro-futuriste à Chauny (02). Proposition visuelle pré-MVP : présentation de l'activité, ambiance néon/synthwave et démonstration interactive, sans backend.

## Démo en ligne

> URL GitHub Pages : `https://devredious.github.io/space-arcade/`

## Contenu

| Page | Description |
|------|-------------|
| **Accueil** | Hero, activités (bornes, flippers, bar, snack), anniversaires, événements, horaires |
| **Galerie** | Carrousel et mosaïque photo (placeholders en attendant les visuels pro) |
| **Contact** | Coordonnées, horaires, formulaire de démonstration |

## Fonctionnalités

- Statut **OUVERT / FERMÉ** calculé en direct selon les horaires
- Animations au défilement et thème rétro années 80–90
- Mini-jeu arcade **SPACE DEFENDER** (canvas, clavier et tactile)
- Carrousel automatique sur la galerie
- Mise en page responsive

## Stack

HTML5 · CSS3 · JavaScript vanilla — aucune dépendance npm, aucun build.

## Structure du projet

```
space-arcade/
├── index.html      # Accueil
├── galerie.html    # Galerie photos
├── contact.html    # Contact
├── styles.css      # Styles partagés
├── app.js          # Horaires, nav, carrousel, formulaire, mini-jeu
├── screenshots/    # Captures de prévisualisation
└── .nojekyll       # Compatibilité GitHub Pages
```

## Développement local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Déploiement GitHub Pages

Le site est servi depuis la branche `main` à la racine du dépôt. Fichier `.nojekyll` présent pour désactiver le traitement Jekyll.

## Contact (démo)

- **Adresse** : 4 Rue Aristide Briand, 02300 Chauny
- **E-mail** : spacearcadechauny@gmail.com

---

© 2026 Space Arcade · Chauny — *Game over ? Insert coin.*
