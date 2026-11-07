# Mon Plan Mental : mode club

Jeu de course de pions pour clubs et jeunes sportifs. Le coach anime et valide, chaque joueur joue sur son téléphone avec un code à 4 lettres.

## Contenu

- `index.html` : accueil (rejoindre une partie, espace coach, jeu solo)
- `solo.html` : version solo, sans compte ni serveur
- `app.js`, `api.js`, `data.js` : le jeu, l'accès Supabase, les contenus A4P
- `style.css` : design sobre et premium (marine, or, Georgia, sans police externe), partagé par le club et le solo
- `config.js` : les deux valeurs Supabase à renseigner
- `supabase.sql` : tables, règles de sécurité et fonctions
- `dev/mock-api.js` : faux serveur local pour tester (voir plus bas)

## Mise en ligne

1. **Supabase** : créer un projet, puis SQL Editor, coller `supabase.sql`, Run.
2. **Accès coach** : Authentication > Users > Add user, avec e-mail et mot de passe, case "Auto Confirm User" cochée. Puis Authentication > Sign In / Providers : désactiver "Allow new users to sign up" pour que seuls les comptes que tu crées puissent se connecter. Tu es l'administrateur : toi seul crées les accès coach.
3. **config.js** : coller l'URL du projet et la clé `anon` (Project Settings > API).
4. **GitHub** : pousser ce dossier dans un dépôt privé.
5. **Vercel** : importer le dépôt. Pas de build : Framework "Other", dossier racine tel quel.

## Déroulé d'une partie

1. Le coach se connecte, crée une partie : un code à 4 lettres s'affiche.
2. Les joueurs entrent le code et leur prénom, puis saisissent leurs résultats (PMP, CMP, profil, type émotionnel).
3. Le coach lance la partie. À chaque tour : dé (1 à 3 cases), mise en situation sur la dimension de la case, choix d'une carte outil, défi réalisé, validation par le coach (+20 points).
4. Le coach lance le tour suivant quand il veut, et termine la partie pour afficher le podium.

Le plateau est un spirale montante en 3D de 50 cases (départ en bas, sommet en haut, pivot à la case 25), pions à initiale animés case par case

## Sécurité

- Les joueurs n'ont aucun accès direct aux tables : ils passent par 3 fonctions (rejoindre, sauvegarder, lire l'état de la partie).
- Un joueur n'est reconnu que par son jeton, stocké sur son téléphone.
- Un coach ne voit que ses propres parties.

## Tester sans serveur

Ouvrir `index.html?mock=1` dans deux onglets du même navigateur : un onglet coach (n'importe quel e-mail et mot de passe) et un onglet joueur. Les données restent dans le navigateur.


## Mode solo et cartes du coach

- `solo.html` + `solo.js` : jeu solo complet, sans compte ni base de données (sauvegarde dans le navigateur).
- `board.js` : plateau en spirale montante (50 cases), partagé par le solo et le club.
- `coach.js` : contenu issu du Workbook Ados A4P Mental (10 modules, 4 questions chacun, défis, phrases clés). Pour modifier une question, éditer ce fichier.
- À chaque étape, une carte avec une question du coach ; la réponse est écrite (ou dite à voix haute), puis le mot du coach et un outil tiré du profil du joueur, à garder dans son plan.
- Cases ludiques : Défi minute (chrono), Mise en situation, Coup de pouce (+2 au prochain lancer), Souffle (respiration 4-6 guidée), Phrase clé.
- À la case 25, arrêt obligatoire : le Pivot (mi-parcours). Le dé est un cube 3D qui roule, de 1 à 6 (constante DIE dans board.js). En fin de partie, le plan complet (outils et réponses) se copie ou s'imprime.

## Plateau animé

- Le plateau pivote pour garder le pion au premier plan, et se tourne aussi au doigt (glisser horizontalement).
- Matière : tuiles épaisses, ruban de parcours coloré par phase, disque en relief, pilier lumineux, faisceau doré au sommet, gerbe d'étincelles à l'arrivée.
- Le dé roule, rebondit, puis le pion avance case par case une fois le dé posé.


## Fiche de synthèse
Le plan s'ouvre sur « Mes 3 actions prioritaires » : les 3 dimensions les plus basses du test, chacune avec une action concrète, la réponse écrite du joueur au coach et les outils adaptés (cartes gagnées en priorité). Elle est aussi incluse au début du texte copié (`synth()`, `synthHtml()`, `synthText()` dans solo.js).

## Version club : question du coach
Après la mise en situation, chaque joueur répond à une question ouverte du coach (coach.js, liée à la dimension de la case), reçoit le mot du coach puis choisit son outil. Les réponses apparaissent dans « Mon programme » et dans le texte copié. Aucun changement SQL (le flag est dans `state`).

La fiche de synthèse « Mes 3 actions prioritaires » est aussi présente dans la version club (vue programme et texte copié).

## Plateau
Le fond est l image brain.webp (cerveau lumineux). Le pion est un athlète dont l équipement dépend du sport saisi (rugby, foot, basket, hand, volley, tennis, natation, vélo, judo, boxe, golf, athlétisme). En club, le sport est demandé à l entrée et partagé via game_public (voir supabase.sql).
