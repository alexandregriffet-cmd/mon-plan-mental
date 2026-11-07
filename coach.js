/* Contenu "coach mental" : questions, défis, phrases. Source : Workbook Ados A4P Mental. ES5. */
var MODS = [
  { n: "Se connaître", d: "att", qs: [
    ["Quel objectif concret veux-tu atteindre cette saison, et pour quelle date ?", "Un objectif, ce sont les pas : précis, mesurable, avec une date. Écris-le avec un chiffre."],
    ["Qu'est-ce que tu auras gagné ou obtenu une fois cet objectif atteint ?", "Le but, c'est le trophée : ce que tu obtiens ou reçois. Il t'attire, mais il ne dépend pas que de toi."],
    ["Qui es-tu déjà quand tu agis au mieux ? Termine la phrase : « Je suis quelqu'un qui… »", "La finalité, c'est ton identité : « Je suis persévérant. » Dis-la au présent, pas au futur."],
    ["Quelles pensées reviennent le plus souvent dans ta tête en ce moment, et qu'est-ce qu'elles provoquent chez toi ?", "Ton cerveau cherche à confirmer ce que tu penses. Tes pensées dominantes programment ton attention."]
  ] },
  { n: "Stress et émotions", d: "reg", qs: [
    ["Qu'est-ce qui te stresse le plus en ce moment ?", "Nommer, c'est déjà reprendre la main. Dis « je ressens du stress » plutôt que « je suis stressé »."],
    ["Comment ton corps te prévient-il quand le stress monte ?", "Les repérer tôt, c'est ton signal pour respirer en 4-6 avant que ça monte."],
    ["Quelle stratégie vas-tu tester dès demain pour mieux gérer ce stress, et comment ?", "Routine express : respire en 4-6, redresse-toi, regarde droit devant, dis-toi « Je suis prêt »."],
    ["Que voulait te dire la dernière émotion forte que tu as ressentie ?", "La peur dit « protège-toi », la colère « fais respecter tes limites », la tristesse « accueille et lâche », la joie « continue »."]
  ] },
  { n: "Énergie et récupération", d: "act", qs: [
    ["Comment décrirais-tu ton sommeil en ce moment, et que changerais-tu pour mieux récupérer ?", "Le sommeil est ton premier outil de performance. Une routine du soir calme t'aide à mieux t'endormir."],
    ["Quels aliments ou habitudes te donnent de l'énergie, et lesquels t'en prennent ?", "Observe sans te juger : ton corps te donne déjà la réponse."],
    ["Quelle activité physique te recharge le plus, et comment pourrais-tu en faire plus souvent ?", "Des micro-rituels qui rechargent, avant d'être épuisé, valent mieux qu'un gros effort tardif."],
    ["Comment récupères-tu après un gros effort, et qu'est-ce qui pourrait être mieux ?", "La récupération conditionne ta progression. Ne la zappe pas."]
  ] },
  { n: "Confiance en soi", d: "con", qs: [
    ["Comment expliquerais-tu la différence entre l'estime de toi et la confiance en toi ?", "L'estime, c'est la valeur que tu te donnes ; la confiance, c'est la foi en ton action."],
    ["Dans quels domaines te sens-tu le plus solide, et qu'est-ce qui te manque dans les autres ?", "La confiance vient après l'action, pas avant. Commence petit, accumule des micro-victoires."],
    ["Quelles qualités t'aident quand c'est difficile, et comment les as-tu déjà utilisées ?", "Rituel des 3 reconnaissances : trois choses dont tu es fier, trois progrès, trois qualités incarnées."],
    ["Quelle est ta plus grande réussite à ce jour, et qu'as-tu fait pour y arriver ?", "Parle à ton cerveau comme à ton meilleur ami. Garde un carnet de réussites."]
  ] },
  { n: "Motivation et persévérance", d: "mot", qs: [
    ["Qu'est-ce qui te motive le plus dans ta pratique : ce que tu gagnes ou le plaisir de progresser ? Explique pourquoi.", "Le plaisir d'apprendre tient plus longtemps que la récompense. Reconnecte-toi à ton pourquoi."],
    ["Quelle a été ta plus grande petite victoire cette semaine, et comment l'as-tu obtenue ?", "Note une micro-victoire chaque soir : elle nourrit la confiance et la motivation."],
    ["Qu'est-ce qui t'aide à ne pas abandonner quand c'est dur ?", "Motivation qui baisse : respire en 4-6, rappelle-toi ton pourquoi, visualise-toi en train d'avancer."],
    ["Pour qui ou pour quoi continues-tu quand c'est difficile ?", "Ton pourquoi est ton moteur intérieur. Écris-le en une phrase clé."]
  ] },
  { n: "Concentration", d: "cnc", qs: [
    ["Quelles sont tes trois plus grandes distractions, et que pourrais-tu mettre en place contre chacune ?", "Les distractions ne sont pas tes ennemies : elles t'apprennent à te recentrer."],
    ["Que se passe-t-il dans ta tête et dans ton travail quand tu fais plusieurs choses à la fois ?", "Ton attention est un muscle : une seule tâche à la fois, par blocs courts."],
    ["Quel rituel simple pourrais-tu installer pour mieux te concentrer, et quand le ferais-tu ?", "Recentrage en 2 minutes : pose ton stylo, respire en 4-6, fixe un point, dis « Je choisis où je mets mon attention »."],
    ["À quel moment de la journée ton attention est-elle la meilleure, et qu'est-ce qui l'explique ?", "Planifie selon ton rythme naturel, pas contre lui."]
  ] },
  { n: "Temps et organisation", d: "att", qs: [
    ["Quelles sont tes trois tâches les plus importantes cette semaine, et pourquoi celles-là ?", "Tu ne gères pas le temps, tu gères ton énergie et ton attention. Trois priorités suffisent."],
    ["Quelle tâche repousses-tu toujours, et qu'est-ce qui te freine ?", "Commence par la plus petite action réalisable maintenant. Le démarrage est l'étape la plus dure."],
    ["Quel petit pas peux-tu faire aujourd'hui pour avancer, et à quel moment ?", "Rituel des 10 minutes chaque soir : relis ton agenda, note 3 priorités, choisis ton heure de départ."],
    ["Qu'est-ce qui te fait perdre le plus de temps, et comment pourrais-tu le réduire ?", "Revenir à l'essentiel à chaque instant, c'est le secret de l'organisation."]
  ] },
  { n: "Communication positive", d: "lea", qs: [
    ["Comment décrirais-tu ta façon d'écouter les autres quand ils te parlent ?", "Écoute pour comprendre, pas pour répondre. Le silence est un outil."],
    ["Comment pourrais-tu reformuler une critique que tu fais souvent, en commençant par « je » plutôt que par « tu » ?", "Méthode OSBD : un fait observé, ce que tu ressens, ce dont tu as besoin, ce que tu demandes."],
    ["Comment pourrais-tu apporter plus de paroles positives autour de toi cette semaine ?", "Chaque jour, une personne, une phrase positive : merci, bravo, j'ai aimé ce moment."],
    ["Quel retour franc et bienveillant dois-tu donner à quelqu'un, et comment le formulerais-tu ?", "Un feedback constructif : un point positif, un point à améliorer, une demande claire."]
  ] },
  { n: "Performer sous pression", d: "res", qs: [
    ["Dans quelles situations ressens-tu le plus de pression, et comment réagis-tu ?", "La pression révèle ton niveau de préparation, elle ne le crée pas. Le stress est une énergie à orienter."],
    ["Quel serait ton rituel minute (un mot, un geste, une respiration), et comment l'utiliserais-tu ?", "Un rituel minute court et répétable te recentre avant toute performance importante."],
    ["Que fais-tu, que penses-tu et que ressens-tu quand tu te sens vraiment en contrôle ?", "La vraie performance, c'est la maîtrise tranquille du moment."],
    ["Quel plan B mental te donnerais-tu si ça se passait mal, et que te dirais-tu ?", "Méthodes STOP, 3C, pré-performance : tu as de quoi revenir dans le présent."]
  ] },
  { n: "Le Jour J", d: "act", qs: [
    ["Qu'est-ce que tu veux ressentir le Jour J, et que peux-tu faire dès maintenant pour y arriver ?", "Le Jour J, tu ne deviens pas quelqu'un d'autre : tu révèles ce que tu as construit."],
    ["Quelle pensée veux-tu nourrir juste avant de commencer, et pourquoi celle-là ?", "Routine d'activation : respire, bouge, visualise ton premier geste, affirme-toi, souris."],
    ["Après ton moment clé, quelles réussites, quelles ressources et quels réglages veux-tu noter ?", "Débrief 3R : Réussites, Ressources, Réglages. Tu progresses, sans te critiquer."],
    ["Comment décrirais-tu ton scénario parfait, avec une image, un geste et une émotion ?", "Ton cerveau ne fait pas la différence entre ce que tu imagines et ce que tu vis."]
  ] }
];

var DEFIS = [
  { t: "Posture de confiance", s: 30, x: "Debout, redresse-toi, relâche les épaules, ancre tes pieds au sol, regarde droit devant. Respire calmement." },
  { t: "Reset de 60 secondes", s: 60, x: "Stop. Respire en 4-6. Fixe un point devant toi. Répète : « Je choisis où je mets mon attention. »" },
  { t: "Zéro écran", s: 60, x: "Pose ton téléphone, ferme tout le reste. Reste 60 secondes sur une seule chose, sans bouger." },
  { t: "Trois fiertés", s: 45, x: "Dis à voix haute trois choses dont tu es fier cette semaine." },
  { t: "Visualisation éclair", s: 45, x: "Ferme les yeux. Une image, un geste, une émotion : ton premier geste réussi lors de ta prochaine échéance." },
  { t: "Rituel minute", s: 60, x: "Invente ton rituel : un mot, un geste, une respiration. Fais-le une fois, tout de suite." }
];

var PHRASES = [
  "Le mental ne se subit pas, il s'entraîne.",
  "Je choisis d'agir en cohérence avec ma finalité.",
  "Je choisis où je mets mon attention.",
  "Je suis prêt. Je fais confiance à mon travail.",
  "La confiance vient du travail, le calme vient de la préparation."
];

var CHANCES = [
  "Coup de pouce du coach : ton prochain lancer compte deux cases de plus.",
  "Tu as bien avancé. Ton prochain lancer compte deux cases de plus."
];
