/* Les zones sensibles et ce qu'elles interdisent.
   =============================================

   Deux couches, et elles s'ajoutent sans jamais s'écraser :

   - une **condition chronique**, déclarée une fois dans les réglages et prise
     en compte à chaque séance — la pubalgie pour l'usage qui a motivé ce
     fichier ;
   - un **état du jour**, coché avant de lancer le chrono et valable pour cette
     séance seulement.

   Ce que l'app fait d'une zone : remplacer les exercices qui la sollicitent
   par un autre, en gardant le nombre de la ligne. Le volume de la séance ne
   bouge donc pas, et la durée non plus.

   **Ce tableau est un arbitrage de mouvement, pas une prescription
   médicale.** Il applique des principes généraux — ne pas charger une
   cervicale en flexion, ne pas faire sauter un genou douloureux, ne pas ouvrir
   brusquement une hanche en cours de pubalgie — et il doit être relu par le
   kiné avant de passer pour autre chose. La même réserve vaut déjà pour les
   séquences d'étirement, et pour la même raison.

   Deux conséquences que le tableau ne cache pas :

   - **le genou fait disparaître le schéma squat.** Aucun substitut ne le
     préserve : sans flexion de genou chargée il n'y a pas de squat, et la
     grille de couverture le dira franchement plutôt que de faire semblant ;
   - **le burpee sans saut est aussi sans pompe.** C'est le seul cran du
     catalogue qui retire le saut, et il retire la pompe avec. On remplace donc
     un peu plus que la douleur ne l'exige, faute d'un cran intermédiaire.

   `null` en valeur voudrait dire « à éviter, et rien ne le remplace » : la
   ligne resterait, signalée. Aucune entrée n'est dans ce cas aujourd'hui, mais
   le moteur sait le traiter — c'est ce qui arrivera le jour où une zone
   touchera un mouvement sans équivalent. */

export const ZONES = [
  { id:"cervicales", label:"Cervicales", detail:"On retire la flexion de nuque chargée et l'appui tête en bas." },
  { id:"genoux",     label:"Genoux",     detail:"On retire les sauts, les fentes et la flexion profonde chargée." },
  { id:"pubalgie",   label:"Pubalgie",   detail:"On retire les passages de jambe latéraux et les ouvertures de hanche brusques." },
  { id:"autre",      label:"Autre",      detail:"Rien de substitué : l'app ne sait pas où tu as mal. À toi d'adapter." },
];

export const ZONE_IDS = ZONES.map((z) => z.id);

/* L'ordre de lecture des zones quand plusieurs sont actives. Il ne sert qu'à
   rendre le résultat prévisible : le substitut trouvé est ensuite repassé au
   crible de toutes les zones, donc aucune n'est oubliée par cet ordre. */
export const EVITE = {
  cervicales: {
    situps: "crunchsInverses",
    vups: "relevesJambesSol",
    hollowHold: "planche",
    pompesPiquees: "pompes",
  },
  genoux: {
    /* Le jump squat ne descend pas d'un cran vers le squat : le squat est
       écarté lui aussi. Une table qui renverrait vers un exercice qu'elle
       interdit se lirait mal, même si le moteur sait enchaîner — l'entraide
       entre zones est faite pour ça, pas l'intérieur d'une zone. */
    jumpSquats: "hipThrusts",
    airSquats: "hipThrusts",
    fentesArriere: "sdtUneJambe",
    fentesMarchees: "sdtUneJambe",
    fentesCroisees: "sdtUneJambe",
    sautsMogul: "mountainClimbers",
    burpees: "burpeesSansSautNiPompe",
    burpeesLongueur: "burpeesSansSautNiPompe",
    burpeesGenouDiagonal: "burpeesSansSautNiPompe",
  },
  pubalgie: {
    swingsLateraux: "bearCrawlThread",
    sweeps: "bearCrawlThread",
    hollowToSweep: "bearCrawlThread",
    fentesCroisees: "fentesArriere",
    sautsMogul: "mountainClimbers",
    jumpSquats: "airSquats",
    burpeesGenouDiagonal: "burpees",
  },
  autre: {},
};
