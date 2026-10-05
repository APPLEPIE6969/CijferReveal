# Implementatienotities

> Historische implementatienotities. README.md, CHANGELOG.md en de huidige broncode beschrijven release 0.2.0; eerdere beperkingen voor nieuw gepubliceerde cijfers en revisies zijn daarin aangepast.

## Architectuur

MV3 met origin-brede document_start CSS en ISOLATED content IIFE, MAIN responseobserver IIFE, React/Motion in gesloten Shadow DOM voor de ervaring, en een kleine serviceworker als seriële opslagwriter. Vite bundelt alle runtimecode lokaal; geen response-body-webRequest, iframe, backend, remote fonts of dynamische code.

MAIN wrapping bewaart de originele fetch-Promise, arguments, XHR responseType en callbacks. Alleen allowlisted same-origin GET, succesvolle responses inclusief 206; fetch-clone en afgeronde XHR. Lezen/projecteren begint meteen zodat XHR-reuse niet later een andere response oplevert. Maximaal 32 vroege projecties wachten op de salt-handshake; 2000 records per observation. Geen headers/body/cookie/tokeninspectie. Responsefamilies volgen exact de recontemplates. Publication/exam-context zijn geallowlist maar leveren geen packs uit onbekende schemas.

De bridge is een publiek page-transport en heeft **geen cryptografische page-authenticatie**. Origin/source checks, begrenzingen, expliciete veldreconstructie en schema/identity checks vormen de inputgrens; de site is al eigenaar van zijn data. De lokale salt wordt voor account-scoped hashing doorgegeven, niet als geheim gebruikt. Raw self-resultidentiteiten bestaan uitsluitend tijdelijk in responseprojectie/isolated memory. Geen raw account/student-identiteiten gaan door de bridge. Accountscope wordt in MAIN gehasht uit het allowlisted studentpad. Overzicht/plaatsing/context is niet automatisch een accountscope; matching vereist een al scoped self-record. Missende correlatie blijft verborgen.

## State en baseline

Schema 2: lokale salt, gehashte records/versionen, eligibility lifecycle, laatst opgeloste lifecycle, coverage, settings en immutable geopende collectie. v1→v2-migratie; onbekende/malformed versies geven een fout, geen silent reset. Serviceworker serialiseert read-modify-write over tabs en popup. Openen controleert scope/key/version, schrijft vóór het tonen. De collectie blijft bestaan bij latere numeric-revisies.

PARSER_VERSION 1: conservatieve Nederlandse hele string, 1–10, maximaal één decimaal; puntnotatie niet ondersteund. Dit is uitsluitend fixture-capaciteit. LIVE_PROFILE heeft empty allowlists en beide validationbooleans uit. Baselinebeleid vraagt geverifieerde rijke coverage vóór arming; recent is nooit voldoende. De huidige overview+subject signalen zijn alleen een technische haak: de volledige relevante contextdekking moet daadwerkelijk worden aangetoond voordat `baselineCoverageValidated` wordt gezet. Late niet-gescopeerde overzichtsrecords blijven concealed. Revisies worden unresolved; placeholder→numeric kan onder een gevalideerd profiel wel pending worden.

## Shield en DOM

De oorspronkelijke recente-resultaatelementen blijven zichtbaar en in de DOM; hun native `.root`, titel, vakicoon, metadata, weging en cijfermarkup blijven intact. De extensie plaatst een dunne wrapper om het bestaande element en een aparte effectlaag ernaast. Onopgeloste en pending waarden maskeren alleen de originele `.cijfer`-tekst en tonen een vette `?` op dezelfde plek; geopende resultaten, ook `*`, tonen hun originele cijfer-span. Een pending cijfer krijgt de openactie buiten het inert native element. Overviewcellen en rapportwrappers blijven statisch verborgen. Disposal herstelt oorspronkelijke ARIA- en inertwaarden.

Join vereist unieke normalized subject, omschrijving, geformatteerde invoerdatum, weging en huidige waardecontext; identiteit blijft de canonical self-link. Datumformatters zijn conservatieve kandidaten. Ambiguity/geen matching is unresolved; geen DOM-volgorde/Angular internals. Gerichte grade-root observer, shell child-lifecycle discovery, body-direct-child portal observer, Navigation API/popstate signals; cleanup op rootdetach/pagehide en refresh bij BFCache pageshow. Geen intervalscan. Developmentdiagnostics registreren eerst document_start met nog lege owner-tree; de CSS-marker wordt zodra de body bestaat gemeten, vóór de eerste owner-mount. Een niet-berekenbare document-rootstyle vóór DOM-opbouw wordt niet als actieve stylesheet geclaimd. Het report vereist CSS-readiness vóór de eerste concealed mount. Adapterwrites worden genegeerd zodat er geen observerloop ontstaat.

Averages/report/overview blijven fail-closed: serverdata en associaties zijn bekend, exacte numeric dependencies niet. Geen fake/oud gemiddelde. `body:has(sl-cijfers) hmy-tooltip.hmy-tooltip` is een expliciete route-beperkte tradeoff door ontbreken van een grade-only tooltipowner.

Collectie wordt als native-styled button na publiek `a[href="/cijfers"]` geplaatst wanneer label `Cijfers` klopt. Geen Angular-routerregistratie of URL-mutatie. De vaste main-area view behoudt de native topnav; bij openen gaat focus naar de sluitactie, covered branches worden inert met behoud/herstel van eerdere inertwaarden, en sluiten herstelt focus naar de Collectie-button. echte shellmetingen/positie moeten geverifieerd worden. Alleen geopende scope-items worden getoond.

## Motion en audio

Audioanalyse met bundled ffmpeg via imageio-ffmpeg en numpy RMS/transients. Stream-copy + map_metadata -1, verificatie met mutagen; oude lange namen verwijderd. Beide outputs 44,1kHz stereo. `case-opening.mp3`: 7,915102s; strongest final transient circa 6,485s, lange rustige staart vóór onset rond 6,30–6,40s. Meerdere eerdere transients zijn laag in RMS; `choreography.ts` bewaart gemeten approximate crossinganchors. `high-grade-accent.mp3`: 16,979592s, veel luider; playbackgain 0,08×volume, passage 3,5s (8,5+) / 6s (9,5+). Er wordt niet gere-encodeerd of gesynthetiseerd.

De reel volgt monotone Hermite-interpolatie door de echte audio-ticktimestamps. De beweging behoudt continue snelheid bij de landmarks en eindigt op exact target; één translate3d-track en gecachte ResizeObserver-geometrie voorkomen layoutreads per frame. Start rond 0,55s, stop 6,230s, 250ms rust, daarna storagecommit + reveal circa 6,480s (storage/RAF-latency kan enkele ms toevoegen). De audio-contextclock stuurt de reel wanneer geluid beschikbaar is; performanceclock is de stille fallback. Geen tierklasse of resultaatcomponent vóór reveal. Audioaccent pas erna. Motion verzorgt overlay/reveal/collection; CSS hover 220ms; Canvas maximaal 90 deeltjes, korte lifetime, buiten de cijferzone. Reduced motion: 650ms mystery + 250ms rust, geen reel/particles, dezelfde commitgrens.

## Bewijsgrenzen

Automated fixturetest met echte MV3-injectie toont CSS vóór async owner-mount, AX-concealment, SPA/back/forward, mobile detail/tooltip/overview, openen, opslag en reload. Unit/componenttests bewijzen alleen de eigen softwarecontracten. Echte numeric-only schema/identity/owners, API-publicatie, volledige historie en gemiddeldeafhankelijkheden zijn geen bewezen feiten. Zie FIRST-NUMERIC-GRADE-VALIDATION.md voor het gerichte vervolg; recon hoeft niet herhaald te worden.

## Toegevoegde kaarteffecten

Op verzoek: border-beam 1.4.1 lokaal gebundeld rond elke mystery-card, mono, strength 0,7 en dark theme. IntersectionObserver activeert alleen zichtbare/nabije cards; de flexgeometry blijft in een eigen wrapper zodat de library-styles geen reelmeting veranderen. Alle cards gebruiken dezelfde vooraf neutrale beam, zonder grade/tierinformatie.

Na de bestaande reveal/commitgrens krijgt de resultaatkaart pointer/touch-tilt en cursorvolgende glare. De vlakke hit-area blijft onveranderd; maximaal zes graden per as, retour 1000ms en follow 400ms. Reduced motion schakelt tilt en glare uit. De cijferweergave krijgt een verticale digit-counter (1400ms per kolom, 90ms stagger) die uitsluitend ná reveal mount en exact op het opgeslagen cijfer eindigt. SVG Gaussian blur is alleen verticaal en daalt naar nul. Decoratieve strips zijn aria-hidden; de cijfercontainer heeft het echte accessible label en de bestaande eenmalige aankondiging blijft intact. Reduced motion toont het cijfer direct. RAF wordt bij unmount afgebroken.

Shadow DOM: twee gedeelde typed properties (`--po-beam-angle`, `--po-beam-opacity`) worden lokaal geregistreerd; de library-keyframes verwijzen ernaar via de officiële css-prop. Zo blijven rotatie en fade soepel zonder steeds nieuwe globale registraties per card/opening te maken. De originele fade-endcallbacks en active/paused-status blijven werken.


## Sterretjes openen

Op verzoek zijn individuele `*`-resultaten nu pending packs, ook zonder numerieke arming. Legacy `observed-nonnumeric` records worden bij herobservatie opgewaardeerd. De reveal en Collectie bewaren `value: '*'` met `grade: null`; neutrale stijl, geen numerieke digitreels/particles/high-grade accent. Een geopende ster blijft geopend bij reload; een later gevalideerd numeriek resultaat krijgt een eigen pack zodra coverage armed is. Labels, aggregaten en onduidelijke DOM/API-correlaties blijven verborgen. De beschermde oorspronkelijke specificaties zijn niet gewijzigd; dit is een expliciete latere beleidswijziging door de gebruiker.

De live inspectie op 4 oktober toonde daarnaast dat de resultaatresponses vanaf `https://api.somtoday.nl` komen. De routeadapter accepteert nu deze exacte HTTPS-origin uitsluitend vanuit de SOMtoday-frontend, met dezelfde resultaatpad-allowlist. De observer leest uitsluitend de responses die de pagina zelf al ophaalt: geen extra requests, headers/credentials of hostpermissions. De twee-sterren MV3-regression gebruikt deze cross-origin API-route.


## Helium live sterretjesfix

De echte response gebruikt numerieke `links[rel=self].id`-waarden. Positieve veilige integers worden nu expliciet als string genormaliseerd vóór account-scoped hashing; onveilige integers, fracties en ambiguïteit worden afgewezen. De twee-sterren MV3-fixture gebruikt deze echte ID-representatie. De lokale Helium-kopie is bijgewerkt en de bestaande extensie is herladen. Op de echte pagina verschenen daarna beide Open cijfer-acties. Geen ruwe account-/resultaatidentiteiten zijn vastgelegd in deze notities.


## Folio-opening refinement

Op verzoek is de mystery reel hertekend als een grafietkleurige SOMtoday-resultaatfolio met een veilige vaknaam op alleen de doelkaart, een vaste focuskader en minder nadrukkelijke passerende folio’s. De kaart blijft volledig grade-vrij. De audio-reel volgt nu monotone Hermite-interpolatie door de opgenomen ticktimestamps en exact naar de stop. Tijdens de korte stilstand krijgt het doelobject licht en schaalaccent. Met `AnimatePresence` faden de stilstaande folio en de uitkomende resultaatkaart over elkaar; de resultaatkaart groeit uit het middelpunt, met één beheerste grade-impact. Subject en toetsomschrijving blijven zichtbaar tijdens de animatie. De tekst “Dit moment is van jou” is verwijderd. Reduced motion toont dezelfde folio statisch en behoudt de onthulling.
