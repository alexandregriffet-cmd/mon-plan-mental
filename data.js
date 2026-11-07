var MOM = ["Avant le match", "Pendant", "Après le match", "Au quotidien"];

var DIMS = [
  { id: "act", n: "Activation", e: "", c: "#FFBD59" },
  { id: "att", n: "Attention", e: "", c: "#4FC3C7" },
  { id: "reg", n: "Régulation émotionnelle", e: "", c: "#5B9BFF" },
  { id: "con", n: "Confiance", e: "", c: "#FF7A6B" },
  { id: "mot", n: "Motivation", e: "", c: "#FF9F43" },
  { id: "cnc", n: "Concentration", e: "", c: "#A98BFF" },
  { id: "res", n: "Résilience", e: "", c: "#5fd18a" },
  { id: "lea", n: "Leadership", e: "", c: "#F5D76E" }
];

var PMPC = {
  act: [
    ["Échauffement mental en 5 étapes", "Compose une routine de 5 étapes avant le match : respirer, bouger, visualiser, mot clé, objectif. Fais-la dans le même ordre à chaque fois.", 0],
    ["Visualisation d'activation", "Ferme les yeux. Vois des images de puissance, de vitesse, d'intensité. Sens ton corps s'allumer.", 0],
    ["Respiration dynamique", "3 respirations rapides et profondes, puis ancre tes pieds dans le sol. Ton énergie monte d'un cran.", 1],
    ["Protocole de réactivation", "Quand ton énergie baisse en match : redresse-toi, accélère ta respiration, relance par une action simple.", 1]
  ],
  att: [
    ["Pleine conscience 10 minutes", "10 minutes par jour, assis : tu portes ton attention sur ta respiration et tu y reviens chaque fois que tu t'égares.", 3],
    ["Geste de recentrage", "Choisis un geste ou un mot à utiliser après chaque erreur. Toujours le même.", 1],
    ["Focus progressif", "À l'entraînement, tiens ton focus sur une tâche 1 minute, puis 2, puis 3.", 3],
    ["Réactivation entre deux actions", "Entre deux actions : une expiration et un regard sur un point précis. Ton attention repart à zéro.", 1]
  ],
  reg: [
    ["Cohérence cardiaque", "5 minutes, 6 respirations par minute (inspire 5 s, expire 5 s). Matin et soir.", 3],
    ["Vocabulaire émotionnel", "Nomme précisément ce que tu ressens (agacé, déçu, tendu...). Nommer, c'est déjà dompter.", 3],
    ["Reset mental", "Nommer, accepter, relancer : 3 mots pour ranger une émotion et revenir au jeu.", 1],
    ["Récupération émotionnelle", "Après le match, 10 minutes pour décompresser : marche, musique, respiration lente.", 2]
  ],
  con: [
    ["Journal des réussites", "Chaque soir, note 1 réussite du jour. Ce sont tes preuves de compétence.", 3],
    ["Dialogue intérieur", "Repère une pensée parasite (« je vais rater ») et réécris-la en pensée utile (« je me concentre sur mon geste »).", 3],
    ["Rite de confiance", "Crée 3 gestes d'avant-match qui te mettent en confiance : musique, tenue, mot à toi-même.", 0],
    ["Visualisation de réussite", "5 minutes chaque matin : vois-toi réussir tes gestes clés.", 3]
  ],
  mot: [
    ["Mes valeurs en sport", "Écris 3 raisons profondes pour lesquelles tu fais du sport. Garde-les sous les yeux.", 3],
    ["Mon projet sportif", "Définis où tu veux être dans 1 an, au-delà des résultats : qui tu veux devenir.", 3],
    ["Mini-objectifs", "Découpe ton grand objectif en petites étapes. Célèbre chaque étape franchie.", 3],
    ["Mes sources de plaisir", "Repère ce qui te fait kiffer dans ton sport et mets-en un peu à chaque séance.", 3]
  ],
  cnc: [
    ["Concentration progressive", "À l'entraînement, allonge la durée sans décrocher : 2, 4, 6 minutes.", 3],
    ["Conditions de match", "Entraîne-toi avec du bruit, du public ou de la fatigue pour que ton focus tienne en vrai.", 3],
    ["Relaxation profonde", "5 minutes allongé, tu relâches chaque partie du corps. Un corps calme, un focus net.", 3],
    ["Routine pré-action", "3 gestes toujours identiques avant ton geste clé. Ton corps comprend qu'il est temps.", 1]
  ],
  res: [
    ["Mes ressources intérieures", "Liste 3 souvenirs de réussite et 3 valeurs qui te tiennent debout. Relis-les quand ça va mal.", 2],
    ["L'échec est une information", "Après une défaite, écris : qu'est-ce que ça m'apprend ? Et non : qu'est-ce que ça dit de moi ?", 2],
    ["Rebond en 3 étapes", "1. J'accepte. 2. J'en tire une leçon. 3. Je choisis ma prochaine action.", 2],
    ["Mon réseau de soutien", "Identifie 3 personnes vers qui te tourner quand ça va mal, et appelles-en une.", 3]
  ],
  lea: [
    ["Leader par l'exemple", "Aujourd'hui, sois le premier à l'effort et fais exactement ce que tu demandes aux autres.", 3],
    ["Parler assertif", "Dis une chose utile au groupe, clairement et calmement, au prochain entraînement.", 3],
    ["Connaître mes coéquipiers", "Découvre ce qui motive 2 coéquipiers. Un bon leader sait comment aider chacun.", 3],
    ["Rôle de référence", "Prends un petit rôle (échauffement, accueil d'un nouveau). Monte en responsabilité peu à peu.", 3]
  ]
};

var SCN = {
  act: { q: "Tu démarres le match à 50 % : jambes lourdes, tête ailleurs.", o: [
    ["J'attends que ça vienne tout seul.", 1, 4, "Attendre te laisse en retard."],
    ["Je bouge, j'accélère ma respiration et je relance par une action simple.", 8, 15, "Exactement. Tu rallumes la machine toi-même."],
    ["Je m'énerve contre moi-même.", 2, 5, "La colère brûle de l'énergie sans la diriger."] ] },
  att: { q: "Un bruit dans les tribunes te distrait, puis tu rates ta passe.", o: [
    ["Je repense à la passe pendant 5 minutes.", 0, 3, "Tu restes collé au passé."],
    ["Je reviens à mon mot clé et à l'action en cours.", 8, 15, "Recentrage rapide : c'est la clé de l'attention."],
    ["Je cherche d'où venait le bruit.", 2, 5, "Tu nourris la distraction."] ] },
  reg: { q: "L'arbitre prend une décision injuste contre toi.", o: [
    ["Je proteste jusqu'à ce qu'il change d'avis.", 0, 3, "Tu perds énergie et lucidité."],
    ["Je nomme ma colère, j'expire et je reviens à l'action suivante.", 8, 15, "Nommer, accepter, relancer. Parfait."],
    ["Je ne dis rien mais je rumine.", 3, 6, "Ruminer garde l'injustice dans ta tête."] ] },
  con: { q: "Le coach te donne le tir décisif. Dans ta tête : « et si je rate ? »", o: [
    ["Je passe la balle pour éviter la responsabilité.", 1, 4, "Tu t'effaces au moment clé."],
    ["Je remplace par « je fais mon geste habituel » et je respire.", 8, 15, "Tu recadres ta pensée en pensée utile."],
    ["Je me dis que de toute façon je n'ai rien à perdre.", 3, 6, "Mieux que rien, mais la confiance se construit sur du concret."] ] },
  mot: { q: "Fin de saison, pas d'enjeu. L'entraînement te pèse.", o: [
    ["Je viens à moitié, de toute façon ça ne compte plus.", 1, 4, "Tu perds ton fil."],
    ["Je me rappelle pourquoi je joue et je me fixe un mini-objectif pour la séance.", 8, 15, "Tu nourris ta motivation de l'intérieur."],
    ["J'attends que le coach me motive.", 2, 5, "La motivation durable ne vient pas des autres."] ] },
  cnc: { q: "Dernières minutes d'un match long, ta concentration se délite.", o: [
    ["Je fais ma routine pré-action avant chaque geste.", 8, 15, "Ta routine ramène ton focus."],
    ["Je serre les dents et j'espère tenir.", 2, 5, "La volonté seule s'use vite."],
    ["Je regarde le chrono en boucle.", 0, 3, "Le chrono ne joue pas à ta place."] ] },
  res: { q: "Tu perds 3 matchs de suite. Ta confiance chute.", o: [
    ["Je me dis que je ne suis pas à la hauteur.", 0, 3, "Tu transformes l'échec en identité."],
    ["J'accepte, je note ce que ça m'apprend et je choisis ma prochaine action.", 8, 15, "L'échec devient une information."],
    ["Je coupe tout et j'attends que ça passe.", 2, 5, "Le temps seul ne répare pas."] ] },
  lea: { q: "L'équipe est menée et se tait. Personne ne parle.", o: [
    ["J'attends que le capitaine réagisse.", 2, 5, "Tu peux faire bouger les choses."],
    ["Je prends la parole calmement et je donne l'exemple dans l'effort.", 8, 15, "Voix posée et exemple : le leadership qui marche."],
    ["Je crie sur les autres pour les secouer.", 1, 4, "Ça mobilise rarement, ça crispe."] ] }
};

var PROS = [
  { n: "Architecte", e: "", t: "Rigueur, organisation, excellence. Tu prépares tout.",
    b: ["Reconnaissance du travail accompli", "Structure et organisation claires", "Être valorisé pour ta rigueur"],
    s: ["Tu t'enfonces dans les détails", "Tu veux tout contrôler, même les autres", "Tu as l'impression de ne jamais être assez bon"],
    c: [["Routine précise", "Construis des routines de préparation précises et répétables avant chaque compétition.", 0], ["Check-list mentale", "Une check-list courte libère ta tête pendant le match.", 0], ["L'erreur est une donnée", "Traite l'erreur comme une donnée d'apprentissage, pas comme un échec personnel.", 2], ["Pause de récupération", "Planifie un temps de récupération mentale : tu t'épuises souvent en silence.", 3]] },
  { n: "Connecteur", e: "", t: "Relations, émotions, chaleur. Tu es le ciment de l'équipe.",
    b: ["Être reconnu comme personne, pas seulement comme sportif", "Harmonie dans ton environnement", "Te sentir accepté tel que tu es"],
    s: ["Tu dis oui à tout pour plaire", "Tu t'adaptes trop et tu perds tes repères", "Tu te sens utilisé et incompris, tu te retires"],
    c: [["Rituel d'équipe", "Crée un rituel d'équipe qui nourrit ton besoin de lien.", 0], ["Dire mon besoin", "Exprime un besoin directement, sans attendre qu'on le devine.", 3], ["Dire non sans casser le lien", "Entraîne-toi à dire non ou à exprimer un désaccord calmement.", 3], ["Recentrage en solo", "Prépare une routine de recentrage qui ne dépend pas des autres.", 0]] },
  { n: "Guerrier", e: "", t: "Valeurs, convictions, engagement. Tu ne lâches jamais.",
    b: ["Tes convictions respectées", "Être consulté, avoir ton avis pris en compte", "Une cause qui a du sens, au-delà du résultat"],
    s: ["Tu imposes tes opinions, tu n'écoutes plus", "Tu te bats pour tes idées au détriment du reste", "Colère profonde, sentiment de trahison"],
    c: [["Un sens à chaque séance", "Relie chaque entraînement à une cause plus grande que le résultat.", 3], ["Combat utile ou épuisant", "Avant de t'engager, demande : ce combat vaut-il mon énergie ?", 1], ["Écouter une autre valeur", "Écoute un coéquipier qui pense autrement, sans répondre tout de suite.", 3], ["Protéger mon énergie", "Choisis quand ne pas te battre : c'est aussi de la force.", 3]] },
  { n: "Visionnaire", e: "", t: "Vie intérieure riche, imagination, concentration profonde.",
    b: ["Du temps et de l'espace pour toi", "De la solitude créatrice", "Être invité à agir, pas poussé"],
    s: ["Tu attends sans agir, tu te retires", "Tu te coupes des autres", "Tu ne prends plus aucune initiative"],
    c: [["Visualisation d'avant-match", "Ta force : visualise chaque action clé avant le match.", 0], ["Temps de solitude", "Prévois un temps seul dans ta préparation quotidienne.", 3], ["Consigne à moi-même", "Quand tu dois agir, donne-toi une consigne directe : « Go, première action ».", 1], ["Dire mes intuitions", "Partage ce que tu perçois dans le jeu. Ça a de la valeur.", 3]] },
  { n: "Créatif", e: "", t: "Spontané, inventif, tourné vers le jeu et la nouveauté.",
    b: ["Du contact ludique, du fun", "De la nouveauté et de la variété", "Être reconnu pour ton originalité"],
    s: ["Tu évites ce qui t'ennuie, tu procrastines", "Tu fais des erreurs pour éviter les contraintes", "Tu rejettes la faute sur les autres, tu te désengages"],
    c: [["Varier les séances", "Change la forme de tes entraînements pour garder la stimulation.", 3], ["Jouer pour de vrai", "Cherche le fun dans la compétition : tu performes mieux quand tu joues.", 1], ["Finir ce que je commence", "Choisis une tâche répétitive et va jusqu'au bout, pour t'entraîner à tenir.", 3], ["Mon entourage", "Entoure-toi de coéquipiers et d'un coach qui apprécient ton énergie créative.", 3]] },
  { n: "Compétiteur", e: "", t: "Action, défi, victoire. Tu montes en régime quand tout est en jeu.",
    b: ["De l'action et du défi", "Liberté d'initiative", "Prouver ta valeur face aux meilleurs"],
    s: ["Tu utilises les autres pour arriver à tes fins", "Tu testes les limites et prends trop de risques", "Tu blesses sans t'en rendre compte, tu deviens cynique"],
    c: [["La pression est un avantage", "Rappelle-toi que tu performes sous pression. Utilise-le.", 1], ["Courage ou imprudence", "Avant un gros risque, demande : courage utile ou imprudence ?", 1], ["Investir dans l'équipe", "Fais une action pour un coéquipier cette semaine : ton individualisme peut t'isoler.", 3], ["Se régénérer", "Programme une vraie pause : tu peux t'oublier dans la quête.", 2]] }
];

var EMOS = [
  { n: "Combatif", e: "", t: "Tu transformes la pression en carburant. Intense et direct.",
    c: [["Canaliser mon énergie", "Dirige ton énergie combative au lieu de la supprimer : un but précis pour chaque action.", 1], ["Désactivation après match", "Après la compétition : respiration lente, marche, nature. Ton système nerveux doit redescendre.", 2], ["Colère utile ou inutile", "Avant de réagir : cette colère m'aide-t-elle ou me coûte-t-elle ?", 1]] },
  { n: "Expressif", e: "", t: "Tu performes mieux quand le lien est bon avec les autres.",
    c: [["Ancrage intérieur", "Trouve une image ou un mot qui te calme, indépendant de l'ambiance du groupe.", 0], ["Protéger mon espace", "Quand l'ambiance est lourde, fais une pause pour te recentrer.", 1], ["Ma sensibilité est une force", "Note une situation où ta sensibilité t'a aidé à lire le jeu.", 3]] },
  { n: "Analytique", e: "", t: "Tu régules tes émotions par la réflexion.",
    c: [["Tolérer l'incertitude", "Dans une situation floue, accepte de ne pas tout comprendre et agis quand même.", 1], ["Soupape d'expression", "Trouve une façon d'évacuer : sport, création, parole.", 3], ["Lâcher prise", "Joue un moment sans objectif, juste pour le plaisir de jouer.", 3]] },
  { n: "Absorbant", e: "", t: "Tu ressens plus fort et plus finement que les autres.",
    c: [["Décontamination après match", "Après le match, isole-toi 10 minutes pour te vider des émotions des autres.", 2], ["Temps de silence", "Prévois du silence ou de la nature avant la compétition.", 0], ["Mon environnement", "Réduis les stimuli parasites avant de jouer : bruit, écrans, foule.", 0]] }
];

var CMPS = [
  { n: "Émergent", c: "#FFD60A", t: "Tu découvres les outils mentaux. C'est un point de départ.", p: "Respiration, première routine, reset après erreur" },
  { n: "Développant", c: "#FF9F0A", t: "Tu as des outils mais tu les utilises de façon irrégulière.", p: "Automatiser tes outils sous pression" },
  { n: "Compétent", c: "#4A8CFF", t: "Ton outillage fonctionne. Ton enjeu : être prêt pour toutes les situations.", p: "Résilience sous pression maximale" },
  { n: "Avancé", c: "#B05CFF", t: "Tes compétences sont automatisées. Ton enjeu : élever le collectif.", p: "Leadership mental et protocoles affinés" },
  { n: "Expert", c: "#B07A4F", t: "Tu maîtrises. Ton enjeu : transmettre et affiner.", p: "Rôle de mentor mental" }
];

var CARDS = [];
function buildCards() {
  var i, j, c;
  for (i = 0; i < DIMS.length; i++) {
    for (j = 0; j < PMPC[DIMS[i].id].length; j++) { c = PMPC[DIMS[i].id][j]; CARDS.push({ id: "d" + i + "_" + j, src: "dim", key: DIMS[i].id, t: c[0], h: c[1], m: c[2] }); }
  }
  for (i = 0; i < PROS.length; i++) {
    for (j = 0; j < PROS[i].c.length; j++) { c = PROS[i].c[j]; CARDS.push({ id: "p" + i + "_" + j, src: "pro", key: i, t: c[0], h: c[1], m: c[2] }); }
  }
  for (i = 0; i < EMOS.length; i++) {
    for (j = 0; j < EMOS[i].c.length; j++) { c = EMOS[i].c[j]; CARDS.push({ id: "e" + i + "_" + j, src: "emo", key: i, t: c[0], h: c[1], m: c[2] }); }
  }
}
buildCards();
