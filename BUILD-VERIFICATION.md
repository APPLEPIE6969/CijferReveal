# Releasecontrole 0.2.0

Gecontroleerd op 5 oktober 2026, vóór publicatie naar GitHub.

- TypeScript en ESLint: geslaagd.
- Vitest: **135 tests in 10 bestanden**, geslaagd.
- Playwright: **15 browserregressies**, geslaagd, met de echte Manifest V3-extensie en synthetische SOMtoday-responses.
- Productie- en developmentbuild: geslaagd.
- Manifest-, permissie-, ZIP- en productiecontrole: geslaagd. ZIP-bestanden zijn gelijk aan de productiebuild; geen tester, sourcemaps of developmentdiagnostiek in de release.
- `npm audit`: **0 bekende kwetsbaarheden**, inclusief ontwikkeldependencies.
- Geheimencontrole op werkbestanden en daadwerkelijk gestagede inhoud: geslaagd. Geen herkenbare ingebouwde credentials of persoonlijke bestandspaden. De twee aangetroffen documentatiepaden zijn verwijderd.
- Publicatie bevat geen lokale userscript-overrides, browsertraces, captures, `.env`-bestanden, sleutelbestanden of ongebruikte lokale muziek.

## Regressies voor verse installaties en nieuwe cijfers

- Een andere synthetische leerling, met een ander numeriek resultaat-ID, een examendossier, een schoolspecifiek kolomtype en afwijkende decimaal-/wegingnotatie, kan zijn gekoppelde cijfer openen op een verse installatie.
- Een nieuw cijfer dat pas na het laden binnenkomt, krijgt een openknop en blijft herkenbaar na herladen.
- Een geopend `*` dat later numeriek wordt, kan opnieuw worden geopend zonder reset. De vorige ster blijft in de inventaris.
- Numerieke revisies krijgen een nieuwe opening, met behoud van eerdere resultaatversies.
- Accounts krijgen gescheiden resultaatidentiteiten, wachtrijen en collecties; late ongescopete responses veranderen de actuele canonieke waarde niet.
- Onbekende of onvolledige kaartmarkup blijft afgeschermd en krijgt geen verouderde openactie.
- Openen, opgeslagen resultaten, reload, routewisselingen, mobiel formaat, keyboard, inventaris, popup en verminderde beweging blijven functioneren in de fixtures.

## Grenzen van de controle

Desktop Chromium Manifest V3 is de doelomgeving. Deze tests zijn geen live certificering van het account van een familielid, iedere schoolconfiguratie, Firefox/Safari of toekomstige SOMtoday-wijzigingen. Individuele unieke koppelingen worden ondersteund; gemiddelden, rapportwaarden en ambigue resultaten blijven afgeschermd. README.md beschrijft de installatie en deze grenzen.
