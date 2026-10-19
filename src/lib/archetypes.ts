import type { ArchetypeId, ReturnType } from "@/lib/types";

export interface Motivation {
  verbinding: number;
  autonomie: number;
  competentie: number;
}

export interface DecisionStyle {
  initiative: "initiatiefnemend" | "terughoudend";
  orientation: "taakgericht" | "mensgericht";
}

export interface DmuRoles {
  beslisser: boolean;
  beinvloeder: boolean;
  gebruiker: boolean;
}

export interface Objection {
  objection: string;
  rebuttal: string;
}

export interface Methodology {
  approach: string;
  openingStrategy: string;
  qualificationCriteria: string[];
  objections: Objection[];
  valuePitch: string;
  pitchReturnTypes: ReturnType[];
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  slug: ArchetypeId;
  description: string;
  companyType: string;
  motivation: Motivation;
  returnSpectrum: { primary: ReturnType; secondary: ReturnType };
  decisionStyle: DecisionStyle;
  dmu: DmuRoles;
  quote: string;
  strategicFit: string[];
  societalAmbition: string[];
  methodology: Methodology;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "calculerende-rationalist",
    slug: "calculerende-rationalist",
    name: "De Calculerende Rationalist",
    description:
      "Beslist op cijfers, niet op gevoel. Sponsoring is voor deze partij een marketing- of salesinvestering die zich moet terugverdienen, net als elk ander kanaal in de begroting.",
    companyType: "B2B, fintech, SaaS",
    motivation: { verbinding: 10, autonomie: 90, competentie: 80 },
    returnSpectrum: { primary: "ROI", secondary: "ROO" },
    decisionStyle: { initiative: "initiatiefnemend", orientation: "taakgericht" },
    dmu: { beslisser: true, beinvloeder: true, gebruiker: false },
    quote: "Laat me zien wat het oplevert, dan praten we verder.",
    strategicFit: [
      "Groeiende B2B-organisaties met een duidelijk gedefinieerde salesfunnel",
      "Marketingteams die per kanaal op resultaat worden afgerekend",
      "Bedrijven die net een investeerdersronde of budgetcyclus zijn gestart",
    ],
    societalAmbition: [
      "Zichtbaarheid bij een goed gedefinieerde doelgroep, niet bij het brede publiek",
      "Meetbare naamsbekendheid onder besluitvormers in de eigen sector",
    ],
    methodology: {
      approach:
        "Behandel dit gesprek als een zakelijke propositie, niet als een sponsorvraag. Kom voorbereid met cijfers: bereik, demografie van het publiek, vergelijkbare cases met concrete resultaten. Praat in de taal van een investeringsvoorstel — kosten, verwacht rendement, terugverdientijd — en niet in de taal van clubliefde of goede sier.",
      openingStrategy:
        "Open met een concrete vraag over hun huidige marketingkanalen en de KPI's waarop ze worden afgerekend (leads, naamsbekendheid, werkgeversmerk). Sluit de sponsorpropositie daar direct op aan in plaats van een standaardverhaal over de club te houden.",
      qualificationCriteria: [
        "Heeft een marketing- of salesbudget met ruimte voor nieuwe kanalen",
        "Kan resultaat uit eerdere sponsoring of vergelijkbare investeringen benoemen (of het ontbreken daarvan)",
        "Beslisser is aanwezig of snel bereikbaar — geen lange interne goedkeuringsketen",
        "Doelgroep van het bedrijf overlapt aantoonbaar met het publiek van de club",
      ],
      objections: [
        {
          objection: "We meten sponsoring niet, dus we weten niet of het iets oplevert.",
          rebuttal:
            "Precies daarom leveren wij vooraf een meetplan mee: welke KPI's volgen we (bereik, leads, vermeldingen), en spreken we na het eerste kwartaal een tussentijdse evaluatie af. Zo wordt dit geen zwarte doos, maar een kanaal met dezelfde verantwoording als de rest van hun mix.",
        },
        {
          objection: "Sponsoring is voor ons geen prioriteit dit jaar.",
          rebuttal:
            "Vraag door naar wélk kanaal nu wél prioriteit heeft en waarom — vaak blijkt de echte reden een gebrek aan meetbaarheid te zijn, niet een gebrek aan budget. Bied aan om te starten met een klein, tijdgebonden pakket dat als test dient voordat er een jaarcontract volgt.",
        },
      ],
      valuePitch:
        "Positioneer sponsoring als een extra marketingkanaal met een eigen dashboard: bereikcijfers, een lijst gegenereerde contacten via de netwerkmomenten, en een vergelijking met de kosten per lead van hun bestaande kanalen. Rond af met een concreet getal: verwachte kosten per zichtbaar contactmoment.",
      pitchReturnTypes: ["ROI", "ROO"],
    },
  },
  {
    id: "lokale-held",
    slug: "lokale-held",
    name: "De Lokale Held",
    description:
      "Een ondernemer die middenin de Enschedese binnenstad staat en de club steunt omdat het zíjn club is, zijn buurt, zijn klanten. Sponsoring is hier persoonlijk, niet strategisch.",
    companyType: "MKB, retail, horeca — Enschede binnenstad",
    motivation: { verbinding: 80, autonomie: 60, competentie: 20 },
    returnSpectrum: { primary: "ROKI", secondary: "ROK" },
    decisionStyle: { initiative: "terughoudend", orientation: "mensgericht" },
    dmu: { beslisser: true, beinvloeder: true, gebruiker: true },
    quote: "Ik doe dit voor de club, niet voor een rapportage.",
    strategicFit: [
      "Zelfstandige ondernemers en familiebedrijven met een fysieke zaak in de stad",
      "Bedrijven waarvan de klantenkring grotendeels lokaal is",
      "Ondernemers die zelf al persoonlijk bij de club of het verenigingsleven betrokken zijn",
    ],
    societalAmbition: [
      "Zichtbaar onderdeel zijn van de lokale gemeenschap",
      "Iets teruggeven aan de stad waar de zaak zijn bestaan aan dankt",
    ],
    methodology: {
      approach:
        "Ga langs, drink een kop koffie, en laat het gesprek vooral over de club en de stad gaan voordat het over geld gaat. Een koud telefoontje of een strak beslisdocument werkt averechts — deze ondernemer wil het gevoel hebben dat hij met een mens praat, niet met een verkoopproces.",
      openingStrategy:
        "Begin met een persoonlijke aanknoping: een gedeelde kennis, een eerdere editie die de ondernemer heeft bezocht, of de eigen geschiedenis van de zaak in de stad. Kom pas laat in het gesprek met een concreet pakket.",
      qualificationCriteria: [
        "Heeft een fysieke, lokaal zichtbare vestiging in of rond Enschede",
        "Toont uit zichzelf betrokkenheid bij de stad of de club in het gesprek",
        "Budget is beperkt maar de beslissing kan door één persoon direct genomen worden",
        "Eerdere lokale sponsoring of donaties zijn traceerbaar (verenigingen, evenementen, scholen)",
      ],
      objections: [
        {
          objection: "Ik heb geen budget voor een groot sponsorpakket.",
          rebuttal:
            "Bied een instappakket aan dat past bij een kleinere onderneming — een naamsvermelding, een plek op de website, een aantal toegangskaarten. Benadruk dat het om de verbinding gaat, niet om het formaat van het pakket.",
        },
        {
          objection: "Wat levert het mij nou concreet op?",
          rebuttal:
            "Vertaal het niet naar cijfers, maar naar zichtbaarheid dicht bij huis: de zaak genoemd worden op momenten dat buurtgenoten en vaste klanten meekijken, en het gevoel dat de ondernemer bijdraagt aan iets dat verder reikt dan de eigen winkel.",
        },
      ],
      valuePitch:
        "Schets het pakket als een manier om zichtbaar onderdeel te zijn van iets dat de hele stad raakt — niet als marketinginstrument, maar als statement: deze zaak hoort bij Enschede en draagt daaraan bij.",
      pitchReturnTypes: ["ROKI", "ROK"],
    },
  },
  {
    id: "netwerker-relatiebeheerder",
    slug: "netwerker-relatiebeheerder",
    name: "De Netwerker / Relatiebeheerder",
    description:
      "Doet zaken via mensen, niet via formulieren. Sponsoring is voor deze partij vooral een verlengstuk van het eigen netwerk — de skybox, de borrel, het informele contact met andere ondernemers.",
    companyType: "Bouw, logistiek, traditionele dienstverlening",
    motivation: { verbinding: 100, autonomie: 20, competentie: 20 },
    returnSpectrum: { primary: "ROI", secondary: "ROO" },
    decisionStyle: { initiative: "initiatiefnemend", orientation: "mensgericht" },
    dmu: { beslisser: false, beinvloeder: true, gebruiker: true },
    quote: "Ik zit liever aan tafel met een klant dan achter een dashboard.",
    strategicFit: [
      "Familiebedrijven en MKB in bouw, logistiek en zakelijke dienstverlening",
      "Ondernemingen die groeien via mond-tot-mondreclame en aanbevelingen",
      "Bedrijven met een actieve directeur die zelf netwerkt",
    ],
    societalAmbition: [
      "Onderdeel zijn van het Twentse ondernemersnetwerk",
      "Nieuwe zakelijke contacten opdoen in een ontspannen setting",
    ],
    methodology: {
      approach:
        "Zet in op persoonlijk contact en herhaalde ontmoetingen — deze contactpersoon beslist zelden na één gesprek, maar bouwt vertrouwen op via meerdere informele momenten. Nodig uit voor een wedstrijd voordat er over een contract wordt gesproken.",
      openingStrategy:
        "Vraag wie er al in hun netwerk zit die ook sponsor is of was — de 'gunfactor' van bekende namen in het sponsorbestand is voor deze contactpersoon vaak overtuigender dan een cijfermatige onderbouwing.",
      qualificationCriteria: [
        "Contactpersoon is zichtbaar actief in lokale ondernemersnetwerken of -verenigingen",
        "Bedrijf werkt al samen met, of levert aan, andere sponsoren van de club",
        "Contactpersoon heeft invloed op de beslissing, ook als hij niet de formele beslisser is",
        "Er is ruimte voor een informeel vervolgmoment (borrel, wedstrijdbezoek) voordat er wordt getekend",
      ],
      objections: [
        {
          objection: "Ik moet dit eerst met de directeur/eigenaar bespreken.",
          rebuttal:
            "Bied aan om de directeur persoonlijk uit te nodigen voor een wedstrijd of netwerkmoment in plaats van te wachten op een intern akkoord — de beslissing valt sneller aan tafel dan via een interne memo.",
        },
        {
          objection: "We zijn al ergens anders bij aangesloten.",
          rebuttal:
            "Vraag naar wat die andere samenwerking oplevert aan contacten, en positioneer deze sponsoring als aanvullend netwerk in plaats van vervanging — met name als de bestaande contacten van de club overlappen met hun eigen sector.",
        },
      ],
      valuePitch:
        "Leg de nadruk op wie er nog meer aan tafel zit: welke andere ondernemers, welke potentiële klanten of leveranciers, en welke informele momenten er per seizoen zijn om die contacten te onderhouden.",
      pitchReturnTypes: ["ROI", "ROO"],
    },
  },
  {
    id: "stadstrots-aanjager",
    slug: "stadstrots-aanjager",
    name: "De Stadstrots-Aanjager",
    description:
      "Een gevestigde, vaak grotere organisatie die sponsoring ziet als onderdeel van haar maatschappelijke rol in de regio — dichter bij reputatiemanagement en 'license to operate' dan bij directe verkoop.",
    companyType: "Corporate, familiebedrijf",
    motivation: { verbinding: 100, autonomie: 20, competentie: 50 },
    returnSpectrum: { primary: "ROE", secondary: "ROCI" },
    decisionStyle: { initiative: "terughoudend", orientation: "taakgericht" },
    dmu: { beslisser: true, beinvloeder: true, gebruiker: true },
    quote: "Wij zijn onderdeel van deze regio, en dat laten we ook zien.",
    strategicFit: [
      "Grotere, gevestigde werkgevers met een lange geschiedenis in de regio",
      "Organisaties met een actief maatschappelijk verantwoord ondernemen (CSR/ESG)-beleid",
      "Bedrijven die afhankelijk zijn van draagvlak en reputatie in de regio waarin ze opereren",
    ],
    societalAmbition: [
      "Bijdragen aan de leefbaarheid en trots van de regio Twente",
      "Reputatie versterken als betrokken, verantwoordelijke werkgever",
    ],
    methodology: {
      approach:
        "Kom met een gestructureerd voorstel dat past binnen een formeel goedkeuringstraject — verwacht meerdere gesprekspartners (marketing, directie, soms CSR-verantwoordelijke) en een langere doorlooptijd. Koppel de sponsoring expliciet aan hun maatschappelijke verantwoordelijkheid, niet aan directe salesdoelen.",
      openingStrategy:
        "Open met de rol die het bedrijf al speelt in de regio (werkgelegenheid, geschiedenis, betrokkenheid) en leg uit hoe sponsoring van de club die rol zichtbaar en tastbaar maakt voor de bredere gemeenschap.",
      qualificationCriteria: [
        "Heeft een vastgelegd MVO/CSR-beleid of duurzaamheidsverslag",
        "Is een van de grotere werkgevers in de regio Twente",
        "Reputatie en publieke perceptie zijn een expliciet aandachtspunt in hun communicatie",
        "Besluitvorming verloopt via een formeel traject met meerdere stakeholders",
      ],
      objections: [
        {
          objection: "Dit moet eerst langs onze directie en/of raad van bestuur.",
          rebuttal:
            "Lever een kant-en-klaar onderbouwingsdocument aan dat intern gebruikt kan worden richting directie — met de maatschappelijke insteek, verwachte zichtbaarheid en een vergelijking met wat andere regionale grootbedrijven doen.",
        },
        {
          objection: "We willen niet dat dit als 'kopen van goodwill' wordt gezien.",
          rebuttal:
            "Stel voor om de samenwerking te koppelen aan een concreet maatschappelijk initiatief van de club (jeugdwerk, toegankelijkheid, lokale evenementen) in plaats van alleen naamsvermelding — zo wordt de bijdrage inhoudelijk te verantwoorden.",
        },
      ],
      valuePitch:
        "Positioneer de samenwerking als een investering in het 'license to operate' van het bedrijf in de regio: zichtbare betrokkenheid bij de club versterkt het beeld van een organisatie die om haar omgeving geeft, wat weer bijdraagt aan draagvlak bij werknemers, klanten en de lokale overheid.",
      pitchReturnTypes: ["ROE", "ROCI"],
    },
  },
  {
    id: "talentenjager",
    slug: "talentenjager",
    name: "De Talentenjager",
    description:
      "Ziet sponsoring vooral als employer branding: een manier om zichtbaar te zijn bij jong talent, studenten en young professionals in een krappe arbeidsmarkt.",
    companyType: "Tech, engineering, UT-spin-off, Kennispark",
    motivation: { verbinding: 70, autonomie: 40, competentie: 100 },
    returnSpectrum: { primary: "ROA", secondary: "ROK" },
    decisionStyle: { initiative: "initiatiefnemend", orientation: "taakgericht" },
    dmu: { beslisser: true, beinvloeder: true, gebruiker: false },
    quote: "Wij hebben mensen nodig, en die vinden we niet via een vacaturesite alleen.",
    strategicFit: [
      "Technologiebedrijven en engineeringfirma's met een structureel wervingsvraagstuk",
      "Spin-offs van de Universiteit Twente en bedrijven op Kennispark",
      "Organisaties die actief concurreren om schaars technisch personeel",
    ],
    societalAmbition: [
      "Zichtbaar zijn als aantrekkelijke werkgever voor studenten en starters",
      "Bijdragen aan het behouden van talent in de regio Twente",
    ],
    methodology: {
      approach:
        "Koppel het gesprek direct aan hun recruitmentuitdaging: hoeveel vacatures staan er open, hoe lang duurt het vullen daarvan, en welke kanalen gebruiken ze nu. Sponsoring wordt hier verkocht als recruitmentkanaal, niet als marketinguiting.",
      openingStrategy:
        "Vraag naar hun huidige wervingscampagnes en de rol van de Universiteit Twente en Saxion daarin — sluit vervolgens aan met hoe zichtbaarheid rond de club die studenten en young professionals bereikt.",
      qualificationCriteria: [
        "Heeft doorlopend openstaande technische of hoogopgeleide vacatures",
        "Werft actief onder studenten van UT of Saxion (stages, traineeships, afstudeerplekken)",
        "Beslisser (vaak HR- of directielid) is direct betrokken bij het wervingsbudget",
        "Is gevoelig voor naamsbekendheid bij een jong, hoogopgeleid publiek",
      ],
      objections: [
        {
          objection: "Ons wervingsbudget zit al vol bij LinkedIn en vacaturesites.",
          rebuttal:
            "Benoem dat sponsoring een ander soort zichtbaarheid biedt: herhaalde, informele blootstelling aan het merk bij een jong publiek, wat de kosten per sollicitatie op de lange termijn juist kan verlagen — vraag of ze bereid zijn een klein deel als test te verschuiven.",
        },
        {
          objection: "We weten niet of studenten hierdoor echt bij ons solliciteren.",
          rebuttal:
            "Stel voor om een concreet, meetbaar recruitmentmoment aan het pakket te koppelen (bijvoorbeeld een stand op een wedstrijddag of een gezamenlijke traineeship-vermelding), zodat het effect direct herleidbaar is.",
        },
      ],
      valuePitch:
        "Presenteer het pakket als een verlengstuk van hun employer branding: zichtbaarheid bij precies de doelgroep die ze via traditionele vacaturekanalen moeilijk bereiken, gecombineerd met een tastbaar recruitmentmoment tijdens het seizoen.",
      pitchReturnTypes: ["ROA", "ROK"],
    },
  },
  {
    id: "vinkjes-zetter",
    slug: "vinkjes-zetter",
    name: "De Vinkjes-Zetter",
    description:
      "Sponsort niet uit overtuiging, maar omdat het moet: een verplichting vanuit een gemeentelijke aanbesteding (SROI) of een compliance-eis. Het gesprek gaat over aantoonbaarheid en het juiste papierwerk, niet over enthousiasme.",
    companyType: "Landelijke toeleverancier, afval, infra",
    motivation: { verbinding: 10, autonomie: 10, competentie: 10 },
    returnSpectrum: { primary: "ROI", secondary: "ROO" },
    decisionStyle: { initiative: "terughoudend", orientation: "taakgericht" },
    dmu: { beslisser: true, beinvloeder: true, gebruiker: false },
    quote: "Zolang het maar aantoonbaar aan de eisen voldoet, is het goed.",
    strategicFit: [
      "Landelijke toeleveranciers en aannemers met gemeentelijke contracten in de regio",
      "Bedrijven in afvalverwerking, infrastructuur en openbare werken",
      "Organisaties met een SROI- of social return-verplichting vanuit een aanbesteding",
    ],
    societalAmbition: [
      "Voldoen aan contractuele social-return-verplichtingen",
      "Aantoonbaar maken van maatschappelijke bijdrage richting de opdrachtgever (vaak de gemeente)",
    ],
    methodology: {
      approach:
        "Behandel dit als een compliance-vraagstuk: wat moet er precies aangetoond worden, aan wie, en in welk format. Vermijd een enthousiast verkoopverhaal — deze contactpersoon wil een oplossing voor een verplichting, geen sponsorbeleving.",
      openingStrategy:
        "Vraag direct naar de herkomst van het social-return-budget (welke aanbesteding, welk percentage, welke rapportageperiode) zodat het pakket precies op die eisen kan worden afgestemd.",
      qualificationCriteria: [
        "Heeft een lopend contract met een social-return- of SROI-verplichting",
        "Moet periodiek rapporteren aan een gemeente of andere opdrachtgever",
        "Budget voor social return is vaak al gereserveerd en moet nog worden besteed",
        "Contactpersoon is verantwoordelijk voor compliance/inkoop, niet voor marketing",
      ],
      objections: [
        {
          objection: "We moeten kunnen aantonen dat dit als social return meetelt.",
          rebuttal:
            "Lever een standaard verantwoordingsdocument aan (uren, activiteiten, doelgroep) dat direct in hun rapportage aan de gemeente kan worden verwerkt, zodat de aantoonbaarheid geen extra werk kost.",
        },
        {
          objection: "We hebben hier geen tijd of interesse in, het moet gewoon geregeld worden.",
          rebuttal:
            "Bied een kant-en-klaar, minimaal-inspanning pakket aan met een vast bedrag en een vaste rapportagecyclus, zodat het voor hen een afvinkbare verplichting blijft zonder verdere afstemming.",
        },
      ],
      valuePitch:
        "Benadruk de eenvoud en aantoonbaarheid: een vast pakket met een duidelijk auditspoor (facturen, activiteitenoverzicht, verantwoordingsrapport) dat naadloos aansluit op hun social-return-verplichting, zonder dat er extra inspanning van hun kant nodig is.",
      pitchReturnTypes: ["ROI", "ROO"],
    },
  },
];

export function archetypeById(id: ArchetypeId | null | undefined): Archetype | undefined {
  if (!id) return undefined;
  return ARCHETYPES.find((a) => a.id === id);
}

const MOTIVATION_WEIGHTED_HANDLES: Record<string, keyof Motivation> = {
  "h-verbinding": "verbinding",
  "h-rendement": "competentie",
  "h-uitvoerbaarheid": "autonomie",
};

/**
 * Weighs a raw 0-100 handle score by how strongly the archetype is
 * motivated along the dimension that handle maps to (verbinding,
 * competentie or autonomie). Handles outside that map are returned as-is —
 * not every criterion is meant to be archetype-weighted.
 */
export function archetypeScoreForMotivation(
  archetype: Archetype,
  handleId: string,
  score: number,
): number {
  const dimension = MOTIVATION_WEIGHTED_HANDLES[handleId];
  if (!dimension) return score;
  const motivationValue = archetype.motivation[dimension];
  return Math.round(score * (0.5 + 0.5 * (motivationValue / 100)));
}

/** The weighted total a given archetype would produce for one set of handle
 * scores — the same calculation assessment-section.tsx shows per sponsor,
 * generalized so every archetype's fit can be compared against the same
 * actual scores. */
export function weightedTotalForArchetype(
  archetype: Archetype | undefined,
  handles: { id: string; weight: number }[],
  scoreByHandleId: Map<string, number>,
): number | null {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const handle of handles) {
    const existing = scoreByHandleId.get(handle.id);
    if (existing === undefined) continue;
    const value = archetype ? archetypeScoreForMotivation(archetype, handle.id, existing) : existing;
    weightedSum += value * handle.weight;
    weightTotal += handle.weight;
  }
  return weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 10) / 10 : null;
}

/**
 * Ranks every archetype by how well it fits a sponsor's ACTUAL handvatten
 * scores (highest weighted total first) — a data-driven suggestion for
 * "which archetype does this sponsor's behaviour actually match", rather
 * than a guess from sparse profile fields. Needs at least one scored
 * handle to produce a meaningful ranking.
 */
export function suggestArchetypes(
  handles: { id: string; weight: number }[],
  scoreByHandleId: Map<string, number>,
): { archetype: Archetype; total: number }[] {
  return ARCHETYPES.map((archetype) => ({
    archetype,
    total: weightedTotalForArchetype(archetype, handles, scoreByHandleId) ?? 0,
  })).sort((a, b) => b.total - a.total);
}
