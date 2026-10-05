# CijferReveal voor SOMtoday

Onthul je SOMtoday-cijfers met een pack opening: een vakkaart, een grote cijferrol met geluid en een resultaatkaart. Geopende cijfers komen in je **Inventaris**. De normale SOMtoday-navigatie blijft beschikbaar.

**Het resultaat staat vooraf vast.** De rol bevat voorbeeldcijfers; hij landt altijd op het gekoppelde echte resultaat, ook als dat `*` is. De extensie verandert geen cijfers bij SOMtoday en plaatst geen opmerkingen of oordeel bij je resultaat.

## Installeren

Je hebt geen Node.js of programmeerkennis nodig om de release te installeren.

1. Download **pack-opening-voor-somtoday.zip** bij de [nieuwste release](https://github.com/js664/CijferReveal/releases/latest). Gebruik de release-ZIP, niet GitHubs knop *Download ZIP* voor de broncode.
2. Pak de ZIP volledig uit in een vaste map. In die map moeten onder andere `manifest.json`, `content.js`, `worker.js` en de map `assets` staan. Bewaar deze map zolang je de extensie gebruikt.
3. Open de extensiepagina van je browser:

   | Browser | Adres |
   | --- | --- |
   | Chrome / Chromium | `chrome://extensions` |
   | Microsoft Edge | `edge://extensions` |
   | Brave | `brave://extensions` |
   | Helium | `helium://extensions` — probeer `chrome://extensions` als dat adres niet werkt |

4. Schakel **Ontwikkelaarsmodus** in.
5. Kies **Uitgepakte extensie laden** (*Load unpacked*) en selecteer de uitgepakte map waarin `manifest.json` staat.
6. **Herlaad alle reeds geopende SOMtoday-tabs.** De detectie begint bij het laden van de pagina; alleen de extensie laden of een SPA-tab wisselen is niet genoeg.
7. Open [SOMtoday](https://leerling.somtoday.nl/), log normaal in en ga naar **Cijfers**.

Deze laadstappen volgen de officiële instructies voor [Chrome](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world) en [Edge](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading).

### Bijwerken

Pak de nieuwe release uit over dezelfde extensiemap, klik op het herlaadicoon van CijferReveal op de extensiepagina en herlaad SOMtoday. Verwijder de extensie niet om bij te werken: je lokale inventaris en instellingen kunnen dan verloren gaan.

## Gebruiken

- Een ongeopend, gekoppeld cijfer toont **?** op zijn normale plek. Beweeg over de kaart of navigeer met Tab naar **Open cijfer**.
- Eerst verschijnt een vakkaart. Klik op **Open Cijfer** of druk op **Enter** om de rol te starten.
- Het echte cijfer staat op de winnende rolkaart en verschijnt vervolgens op de resultaatkaart. Een `*` wordt als `*` onthuld.
- **Enter** gaat na de onthulling naar de volgende vakkaart wanneer er nog cijfers klaarstaan. **Escape** sluit de vakkaart of het resultaat.
- **Inventaris** toont je geopende resultaten met zoeken, filters en sortering.
- Via het extensie-icoon stel je geluid, volume en verminderde beweging in. De systeemvoorkeur voor verminderde beweging wordt ook gerespecteerd.

Bij een verse installatie zijn ook bestaande, zichtbaar gekoppelde individuele cijfers te openen. Nieuwe resultaten worden automatisch herkend wanneer SOMtoday ze normaal ophaalt. Een `*` die later een cijfer wordt, of een bijgewerkt cijfer, krijgt een nieuwe opening. Eerdere geopende versies blijven bewaard in je inventaris.

## Werkt er geen openknop?

1. Controleer of de extensie ingeschakeld is en toegang tot `leerling.somtoday.nl` heeft.
2. Herlaad de extensie én de SOMtoday-pagina. Log zo nodig opnieuw in via SOMtoday zelf.
3. Kijk op **Cijfers** of open de individuele resultaten van het betreffende vak. De extensie verwerkt normaal opgehaalde cijferresponses; hij vraagt geen cijfers op met eigen inloggegevens.
4. Zie je **Cijfer nog niet gekoppeld**? Klik op **Pagina opnieuw laden**. Deze knop herlaadt daadwerkelijk SOMtoday.
5. Blijft het probleem bestaan, meld dan je browser/versie, extensieversie, cijferpagina en de fouttekst via [Issues](https://github.com/js664/CijferReveal/issues). Deel geen tokens, cookies, leerling-ID's of onbewerkte netwerkexports. Maak eventuele schermafbeeldingen anoniem.

Een onduidelijke koppeling wordt niet gegokt: twee identieke toetskaarten kunnen extra context vereisen. Je hoeft voor een detectieprobleem niet meteen je inventaris te wissen.

## Ondersteuning en grenzen

- Gericht op **desktopbrowsers op basis van Chromium**, met Chromium 111 of nieuwer en Manifest V3. De pakketcode bevat geen persoonlijk account, school-ID of browserprofiel.
- Chrome/Chromium, Edge, Brave en Helium kunnen uitgepakte Chromium-extensies laden. Op beheerde schoollaptops kan een beheerder dit blokkeren.
- Deze release is geen Firefox-, Safari- of mobiele-browserextensie.
- Individuele recente cijfers en vakresultaatkaarten worden gekoppeld aan normale SOMtoday-responses. Zowel voortgangs- als examendossierresponses worden herkend.
- Punt- en kommanotatie, cijfers met één of twee decimalen, verschillende wegingnotaties, sterretjes, dynamische resultaten en meerdere accounts zijn meegenomen in de regressietests.
- Overzichtstabellen, gemiddelden en rapportwaarden zijn geen packs en blijven afgeschermd. Niet-ondersteunde of dubbelzinnige kaarten blijven verborgen.
- Tests gebruiken synthetische SOMtoday-responses en de echte MV3-extensie in Chromium. Dat bewijst geen werking voor iedere school of toekomstige wijziging van SOMtoday.

## Privacy

Geen backend, accountkoppeling, analytics, cloudsync of ingebouwde client secrets. Instellingen en geopende resultaten staan lokaal in `chrome.storage.local` en worden niet naar de ontwikkelaar gestuurd.

De extensie observeert uitsluitend ondersteunde cijferresponses die SOMtoday zelf ophaalt via GET. Zij leest geen requestheaders, cookies, toegangstokens, wachtwoorden of leerlingprofielen. Alleen noodzakelijke cijfermetadata wordt verwerkt; instellingen en resultaten blijven lokaal. Account- en resultaatidentiteiten worden met een willekeurige lokale salt gehasht. Dat is **geen versleuteling** van de opgeslagen cijfers.

De browserpermissies zijn beperkt tot lokale opslag en de SOMtoday-leerlingwebsite. Geluid wordt lokaal meegeleverd en begint pas na je klik of toetsdruk.

## Zelf bouwen

Gebruik Node.js **22.12 of nieuwer** en npm. De build werkt op Windows, macOS en Linux; er is geen PowerShell nodig om de ZIP te maken.

```sh
git clone https://github.com/js664/CijferReveal.git
cd CijferReveal
npm ci
npm run build
```

Laad de map `dist` als uitgepakte extensie. Dezelfde build maakt `pack-opening-voor-somtoday.zip`, met `manifest.json` direct in de ZIP-root.

### Ontwikkelen en controleren

```sh
npm run check:secrets
npm run typecheck
npm run lint
npm test
npm run build
npm run build:dev
npm run validate
npx playwright install chromium
npm run test:e2e
npm audit
```

`npm run dev` biedt een geïsoleerde preview op `http://127.0.0.1:5173/tester.html`. De tester gebruikt fictieve cijfers en benadert geen echt SOMtoday-account. GitHub Actions voert de geheimencontrole, builds en regressietests opnieuw uit.

De geheimencontrole blokkeert herkenbare credentials en persoonlijke bestandspaden zonder hun waarden in logs af te drukken. Lokale `.env`-bestanden, sleutels, netwerkexports, browsertraces, testcaptures en het losse lokale test-userscript worden niet gepubliceerd.

Wil je de controle ook vóór iedere commit uitvoeren? Activeer de meegeleverde hook met `git config core.hooksPath .githooks`. Die controleert de daadwerkelijk gestagede inhoud.

---

Een onafhankelijk project, niet verbonden met of goedgekeurd door SOMtoday. Bewaar inloggegevens uitsluitend in de normale SOMtoday-inlogomgeving.
