---
name: "Pack Opening voor SOMtoday"
version: "1.0-design"
status: "approved-for-implementation"
locale: "nl-NL"
product_type: "Chromium MV3 browser extension"
primary_surface: "https://leerling.somtoday.nl/cijfers"
companion_recon: "SOMtoday-Grade-Unboxing-Recon.md"

technology_decision:
  ui: "React + TypeScript"
  ui_motion: "Motion for React"
  reel_engine: "custom requestAnimationFrame engine"
  particles: "Canvas 2D when useful"
  audio: "user-provided local assets"
  remotion: false
  remote_assets: false

product_principles:
  - "Het moet voelen alsof SOMtoday zelf ineens een echte pack opening heeft."
  - "De normale SOMtoday-interface blijft herkenbaar; de magie begint pas bij een ongeopend cijfer."
  - "Een cijfer mag nooit vóór het bedoelde reveal-moment lekken."
  - "Het cijfer is vooraf bepaald door SOMtoday en wordt nooit gerandomiseerd."
  - "Alle zichtbare producttekst is Nederlands."
  - "Cijferresultaten bevatten geen commentaar of oordeel."
---

# Pack Opening voor SOMtoday — Design Specification

> Historische ontwerpspecificatie. Voor release 0.2.0 gelden de actuele README en broncode bij verschillen: individuele cijfer-versies zijn ook zonder numerieke baselinevalidatie openbaar als packs; ster-naar-cijfer en gewijzigde waarden krijgen een nieuwe opening, met behoud van eerdere inventarisversies. Deze notities bewijzen geen universele live compatibiliteit.

## 0. Doel van dit bestand

Dit bestand is de bron van waarheid voor productgedrag, visuele stijl, interactie, motion, audio-orkestratie en Nederlandse copy van **Pack Opening voor SOMtoday**.

Het companion-bestand `SOMtoday-Grade-Unboxing-Recon.md` is de bron van waarheid voor geverifieerde SOMtoday-internals:

- routes;
- API-resources en schemas;
- result-identiteit;
- DOM-structuur;
- selectors;
- accessibility-disclosures;
- gemiddelden en afgeleide waarden;
- pre-paint shielding;
- nog onbewezen numeric-result behavior.

### Source-of-truth volgorde

Als `design.md` en de reconnaissance botsen:

1. `SOMtoday-Grade-Unboxing-Recon.md` wint voor technische feiten over SOMtoday.
2. `design.md` wint voor bedoelde UX en visuele keuzes.
3. Ontbrekende selectors, API-velden of gedrag mogen nooit worden verzonnen.
4. Bij twijfel: fail closed en verberg de gevoelige resultaatsurface.

---

# 1. Product in één zin

**Pack Opening voor SOMtoday verandert een nieuw cijfer in een premium, ongeveer zes seconden durende, CS2-geïnspireerde case opening terwijl de normale SOMtoday-cijferpagina herkenbaar en bruikbaar blijft.**

De gewenste eerste reactie is:

> **“Holy shit, dit voelt als een echte pack opening.”**

Niet:

> “Dit is een flashy browser-extensie.”

---

# 2. Productnaam

Gebruikersnaam:

**Pack Opening voor SOMtoday**

Gebruik in productcopy de schrijfwijze `SOMtoday`.

Gebruik geen:

- Engelse productcopy;
- Valve- of Counter-Strike-branding;
- gekopieerde CS2 UI-assets;
- termen die suggereren dat het schoolcijfer wordt gegokt of gerold.

---

# 3. Niet-onderhandelbare productregels

1. Een nieuw eligible numeriek cijfer blijft verborgen totdat de gebruiker het opent.
2. Geen zichtbare tekst, ARIA-label, tooltip, detailweergave, gemiddelde of afgeleide surface mag het cijfer spoilen.
3. Het echte SOMtoday-resultaat is vooraf bepaald en wordt nooit gerandomiseerd.
4. De reel toont voorbeeldcijfers; de geselecteerde kaart toont altijd het echte resultaat, ook bij `*`.
5. Op verzoek mogen alle zichtbaar gekoppelde individuele cijfers bij eerste installatie als packs worden geopend.
6. Individuele `*`-resultaten zijn openbare packs met een neutrale ster-reveal; labels en aggregaten zijn geen packs.
7. Alle normale zichtbare UI is Nederlands.
8. Geluid staat standaard aan.
9. Productie-audio komt uitsluitend uit lokale assets die de gebruiker in de workspace aanlevert.
10. Als een audioasset ontbreekt, mag de agent geen willekeurig internetsoundje of gegenereerde productie-audio invullen.
11. Cijferresultaten bevatten geen grappen, commentaar of oordeel.
12. Voeg geen commentaar of oordeel toe aan cijferresultaten.
13. Buiten unopened/opening states blijft SOMtoday normaal ogen.
14. Na openen wordt het resultaat weer een normale SOMtoday-grade presentation.
15. `Collectie` bevat alleen packs die daadwerkelijk door de gebruiker geopend zijn.
16. Reduced motion moet de reveal-volgorde behouden.
17. Spoiler safety gaat altijd vóór motion/polish.

---

# 4. Twee visuele werelden

## 4.1 Normale SOMtoday-modus

De student gebruikt gewoon SOMtoday.

De extensie moet bijna onzichtbaar zijn zolang er niets te openen is.

Geen permanente:

- game HUD;
- neon achtergrond;
- rarity frames om oude cijfers;
- tweede cijferdashboard;
- full-page redesign.

Alleen een ongeopend cijfer krijgt een bijzondere toestand.

## 4.2 Pack-opening-modus

Na een bewuste klik op **Open cijfer** verandert de ervaring tijdelijk.

De bestaande SOMtoday-pagina:

- blijft zichtbaar op de achtergrond;
- wordt donkerder;
- krijgt achtergrondblur;
- wordt licht gedesatureerd;
- kan niet per ongeluk worden bediend tijdens de opening.

De gebruiker moet nog steeds voelen:

> “Ik zit in SOMtoday.”

---

# 5. Primaire user flow

```text
Open SOMtoday
    ↓
Ga naar Cijfers
    ↓
Bestaande veilige cijfers zien er normaal uit
    ↓
Nieuw eligible cijfer verschijnt
    ↓
Alleen cijfer + weging zijn concealed
    ↓
Vak / toets / datum blijven leesbaar
    ↓
Hover of keyboard focus
    ↓
Hele cijferkaart vervaagt/blurt vloeiend
    ↓
NIEUW CIJFER
[ Open cijfer ]
    ↓
Fullscreen opening
    ↓
Snelle mystery reel
    ↓
Lange vertraging
    ↓
Laatste nerveuze ticks
    ↓
Exacte mechanische stop
    ↓
Korte pauze
    ↓
Echte cijfer reveal
    ↓
Tier-afhankelijke impact
    ↓
[ Terug naar SOMtoday ]
of
[ Volgende openen ]
    ↓
Normale SOMtoday-card is weer veilig zichtbaar
```

---

# 6. De ongeopende SOMtoday-cijferkaart

## 6.1 Belangrijk uitgangspunt

De extensie maakt op `/cijfers` **geen nieuw kaartdesign**.

Gebruik de bestaande SOMtoday-resultaatkaart als visuele basis en injecteer alleen wat nodig is voor:

- veilige concealment;
- hover/focus interaction;
- de open-action.

De native layout, icon, vaknaam, subtitel, datum en spacing blijven behouden.

## 6.2 Resting state

Voor hover/focus:

### Blijft leesbaar

- vaknaam;
- vakicoon;
- toetsomschrijving/subtitel;
- datum;
- overige niet-spoilerende context.

### Wordt verborgen

- cijfer;
- weging.

Dus expliciet **niet** de hele kaart standaard blur-en.

De gebruiker ziet ongeveer:

```text
┌──────────────────────────────────────────┐
│ [icoon] Bedrijfseconomie                 │
│         29 sep • toets geldzaken         │
│                                          │
│                             ▒▒   ▒▒▒▒▒▒  │
└──────────────────────────────────────────┘
```

De concealing UI moet op exact dezelfde plek/maat blijven zodat de kaart niet springt.

## 6.3 Belangrijke security-vorm

De gebruiker wil visueel een blur-effect.

Dat betekent **niet** dat het echte cijfer als DOM/ARIA-tekst onder `filter: blur()` mag blijven staan.

Volg de recon:

- onveilige native value/ARIA owner blijft veilig concealed/sanitized;
- de zichtbare blur-placeholder is extension-owned en bevat geen echte waarde;
- weighting wordt op dezelfde manier veilig vervangen;
- layout blijft native.

Geen “blurred secret text” die via accessibility of DOM-presentatie nog lekt.

---

# 7. Hover en keyboard focus

## 7.1 Gedrag

Wanneer de pointer over een unopened card gaat, of wanneer de card/action keyboard focus krijgt:

1. de **hele kaart** blurt/verzacht vloeiend;
2. een donkere transparante interaction layer verschijnt;
3. gecentreerd verschijnt:

**NIEUW CIJFER**

**Open cijfer**

`Open cijfer` is de primaire action.

## 7.2 Timing

- hele-card blur: ~180–260 ms;
- zachte ease;
- geen bounce;
- tekst fade + kleine translate na start van blur;
- pointer leave draait dit soepel terug zolang opening niet gestart is.

## 7.3 Keyboard

- `Tab` bereikt de action;
- `Enter` opent;
- `Space` opent;
- duidelijke focusring;
- geen keyboard trap vóór de fullscreen dialog.

## 7.4 Spoilerregels

Voor reveal mag het echte cijfer niet in:

- buttoncopy;
- ARIA-label van de openactie;
- tooltip;
- dataset voor UI-output;
- zichtbare DOM-output.

---

# 8. Fullscreen takeover

## 8.1 Achtergrond

Bij openen:

- donker overlay;
- blur op achterliggende SOMtoday-page;
- lichte desaturatie;
- geen interactie met onderliggende page;
- geen harde cut naar een losstaande zwarte website.

## 8.2 Overlay

Extension-owned fullscreen layer:

- `position: fixed`;
- volledige viewport;
- hoogste extensie-z-index;
- eigen geprefixte CSS namespace;
- responsive;
- geïsoleerd van SOMtoday-styles.

---

# 9. Visuele richting

Kernwoorden:

**premium industrial / metallic / controlled cinematic**

Gebruik:

- near-black;
- graphite metal;
- subtiel glas;
- dunne edge highlights;
- controlled bloom;
- crisp center marker;
- microtexture/noise;
- depth zonder skeuomorfe overload.

Vermijd:

- RGB rainbow;
- mobile-game lootbox look;
- cartoon case;
- enorme glow om alles;
- militaire stencil fonts;
- gekopieerde Counter-Strike-case art;
- Valve-logo’s;
- CS2 rarity textures;
- ripped audio.

---

# 10. Basiskleuren

Gebruik CSS custom properties.

Startpunt:

```css
--po-bg-0: #07090D;
--po-bg-1: #0B0E14;
--po-bg-2: #11161E;
--po-surface-0: #141A23;
--po-surface-1: #1A212C;
--po-border-soft: rgba(255,255,255,.08);
--po-border-strong: rgba(255,255,255,.16);
--po-text-primary: #F5F7FA;
--po-text-secondary: #A9B1BD;
--po-text-muted: #6F7886;
--po-focus: #7CB4FF;
```

Deze kleuren zijn voor de extension-owned opening/collection UI.

De normale SOMtoday-card wordt niet permanent gerecolorized.

---

# 11. Grade tiers

De tier is uitsluitend een **visuele reactie ná de reveal**.

| Cijfer | Interne tier | Visuele richting |
|---:|---|---|
| `< 5,5` | crimson | diep, restrained rood |
| `5,5–6,4` | bronze | warm brons |
| `6,5–7,4` | steel | koel staal/zilver |
| `7,5–8,4` | gold | rijk goud |
| `8,5–9,4` | electric | koel elektrisch blauw |
| `9,5–10` | iridescent | violet/iridescent exceptional |

Interne tiernamen hoeven niet aan de leerling getoond te worden.

Geen user-facing labels als `LEGENDARISCH` tenzij later expliciet gekozen.

Het cijfer zelf is de hero.

---

# 12. Tier-intensiteit

De tier mag **pas na de stop** zichtbaar worden.

## `< 5,5`

- premium reveal;
- restrained crimson;
- subtiel particle accent;
- geen sirene;
- geen ridicule failure-effecten.

## `5,5–6,4`

- warm bronze;
- clean impact.

## `6,5–7,4`

- steel/silver;
- crisp, clean reveal.

## `7,5–8,4`

- gold;
- merkbaar rijkere bloom;
- sterkere impact.

## `8,5–9,4`

- electric blue;
- grotere light burst;
- meer gecontroleerde particles;
- zwaardere passende audio-accenten indien assets beschikbaar.

## `9,5–10`

Dit mag uitzonderlijk voelen:

- iridescent violet/blue;
- layered light;
- extra particle pass;
- langere shimmer tail;
- sterkste passende reveal/audio sting uit aangeleverde assets.

Het mag “holy shit” zijn zonder kitsch te worden.

---

# 13. Mystery reel

## 13.1 Cijfers op de reel

Na `Open Cijfer` toont de reel grote, leesbare voorbeeldcijfers. De target toont vanaf het begin het echte SOMtoday-resultaat. Een `*` blijft een ster, zonder numerieke vervanging.

## 13.2 Subject preview

De bestaande openactie op een native SOMtoday-element opent eerst een neutrale subjectkaart. De preview gebruikt een brede, compacte graphite kaart in SOMtoday-kleuren: grote links uitgelijnde vaknaam, echte toetsomschrijving en datum, een duidelijk verborgen `?` rechts en één brede `Open Cijfer`-actie onder een scheidingslijn. Geen stock-padlock, dubbele rand of centered icon-heading-button-compositie. Pointer tilt, beam, glare en gedeelde morph blijven behouden. Vak staat bovenaan, gevolgd door de toetsomschrijving en een knop `Open Cijfer`. Het cijfer blijft hier verborgen. De kaart deelt materiaal, beam, particles, verlichting, pointer tilt en glare met de finale kaart, zonder uitkomstkleur vooraf.

Klik of Enter bevestigt het openen. Na succesvolle opslag morpht de subjectkaart naar de centrale startkaart terwijl de reel rustig verschijnt. Tijdens het spinnen zijn er geen extra knoppen of praatteksten; alleen vak/toetscontext en de cijferkaarten.

---

# 14. Reel layout

- horizontale strip;
- duidelijke centrale verticale marker;
- voldoende cards buiten viewport;
- één reel-container die transformt;
- target card eindigt exact gecentreerd;
- responsive card size/spacing;
- geen zichtbaar einde van de track.

Marker:

- dunne luminous lijn;
- kleine pointer boven en eventueel onder;
- subtiele center glow;
- bij stop kort extra helder.

---

# 15. Gekozen framework / stack

Gebruik:

- **React**
- **TypeScript**
- **Motion for React**
- custom **`requestAnimationFrame`** reel engine
- **Canvas 2D** alleen waar het particles aantoonbaar beter maakt
- DOM/CSS/GPU-composited transforms voor overige visuals

Gebruik **geen Remotion**.

Remotion is bedoeld voor programmatic video rendering, terwijl dit een live interactieve browserervaring is.

## Motion for React beheert

- overlay enter/exit;
- backdrop transitions;
- card hover/focus;
- reveal typography;
- target-card expansion;
- tier lighting transitions;
- collection transitions.

## Custom reel engine beheert

- horizontale positie;
- snelheid;
- deceleratie;
- exacte endpoint;
- card-cross callbacks;
- stop timing.

---

# 16. Openingduur

Doel:

**ongeveer 6 seconden**

Aanbevolen canonical timing:

```text
0.00 – 0.28 s   backdrop/takeover
0.28 – 0.55 s   lane verschijnt, spanning begint
0.55 – 3.55 s   snelle reel
3.55 – 5.15 s   lange voelbare deceleratie
5.15 – 5.65 s   laatste nerveuze card crossings
5.65 – 5.90 s   exacte stop + korte stilte
5.90 – 6.45 s   final reveal begint
```

Na 6.45 s blijft de result view staan totdat de gebruiker doorgaat.

---

# 17. Pacing-keuze

Gebruik **bijna fysiek dezelfde soort pacing als een goede CS2 case opening**, maar volledig eigen visuals/audio.

Dus:

1. meteen snelheid;
2. lange vertraging;
3. laatste crossings worden individueel voelbaar;
4. spanning komt uit de slowdown;
5. exacte mechanische stop;
6. korte pauze;
7. reveal impact.

Niet méér cinematics toevoegen als dat de mechanische spanning ondermijnt.

---

# 18. Reel physics

Niet implementeren als één simpele:

```css
transition: transform 6s ease-out;
```

Vereisten:

- `requestAnimationFrame`;
- vloeiende versnelling en constante cruise, gevolgd door remmen en een korte terugveer;
- exact eindpunt uit geometrie;
- geen end snap;
- geen foutaccumulatie;
- card-cross events gebaseerd op echte marker crossings;
- geen outcome-randomness;
- de marker blijft tijdens de terugveer binnen de echte targetkaart; geen wisseling van resultaat.

De target is al bepaald vóór de animatie start.

---

# 19. Laatste 560 ms

De reel remt tot nabij de rand van de geselecteerde kaart, veert terug en komt onder de middenmarker tot rust. De daadwerkelijke target verandert nooit. De marker mag geen aangrenzend cijfer selecteren tijdens deze beweging.

Ticks worden ingepland op de echte marker-crossings van dezelfde motioncurve. Gebruik uitsluitend met FFmpeg geknipte fragmenten van de aangeleverde lokale audio. De source-opname blijft intact.

---

# 20. Reveal choreography

De echte grade is zichtbaar op de targetkaart tijdens de spin. Na de terugveer blijft die kaart 280 ms staan, vervolgens morpht hetzelfde object naar de grote resultkaart. Tierverlichting en particles verschijnen bij de finish. Geen tweede digit-reel of tweede onthulling.

Enter opent de preview. Na de finish gaat Enter naar de volgende subjectpreview, of terug naar SOMtoday als alles geopend is. Escape sluit de preview, finish of foutstatus; tijdens de spin wordt de opening afgemaakt. Tab blijft binnen de dialog. Bij een verborgen tab pauzeren reelclock en audio samen.

---

# 21. Final result view

Mag bevatten:

- vak;
- toetsomschrijving;
- datum indien passend;
- weging;
- groot cijfer.

Het cijfer is dominant.

Voorbeeld hiërarchie:

```text
WISKUNDE A

toets hoofdstuk 3

8,9

Weging 2x
```

Gebruik alleen metadata die de integration layer veilig en geverifieerd levert.

---

# 22. Audio

## 22.1 Assets

De gebruiker levert muziek en sound effects in de assets-folder.

De coding agent moet de aanwezige files inspecteren en semantisch koppelen.

Niet:

- downloaden;
- ripped CS2 audio gebruiken;
- productie-placeholderaudio genereren;
- filenames verzinnen die niet bestaan.

## 22.2 Semantische rollen

Mogelijke rollen:

- opening ambience/music;
- reel tick;
- heavy stop/clunk;
- reveal impact;
- tier accent;
- exceptional-result sting.

Exacte filenames komen uit de workspace.

## 22.3 Default

**Geluid staat standaard aan.**

Settings:

- geluid aan/uit;
- volume.

## 22.4 Sync

```text
card crossing → tick asset
exacte stop → stop/clunk asset
grade verschijnt → reveal asset
high tier → optionele passende accent/music asset
```

Ticks mogen niet op een los fixed interval lopen.

---

# 23. Multiple grades

Bij meerdere pending grades:

**3 NIEUWE CIJFERS**

Open handmatig één voor één.

Na result:

**1 VAN 3 GEOPEND**

**Volgende openen**

Niet automatisch de volgende zes-seconden-opening starten.

Na laatste:

**Alles geopend**

**Terug naar SOMtoday**

---

# 24. Queue regels

- deterministische volgorde;
- één grade per opening;
- persistence over reload;
- sluiten van overlay onthult geen volgende grade;
- alleen daadwerkelijk geopende item wordt `opened`;
- twee overige pending items blijven concealed.

---

# 25. Terug naar SOMtoday

Na afsluiten:

- overlay verdwijnt;
- background blur/darkening draait terug;
- de grade wordt veilig normaal zichtbaar;
- weighting wordt veilig normaal zichtbaar;
- oorspronkelijke SOMtoday-look keert terug.

Optioneel:

- 600–1200 ms subtiele tier-afterglow rondom value area;
- daarna volledig normaal.

Geen permanente rarity border.

---

# 26. Collectie-tab

## 26.1 Navigatie

Voeg visueel een nieuw top-level item toe naast de bestaande SOMtoday-tabs:

```text
Rooster
Studiewijzer
Cijfers
Collectie
Berichten
```

Positie: **na Cijfers, vóór Berichten**.

Label:

**Collectie**

Moet visueel overtuigend passen bij SOMtoday's tabbar zonder gegenereerde Angular-attributen te kopiëren.

## 26.2 Wat komt erin

Alleen packs die daadwerkelijk door de gebruiker via de extensie zijn geopend.

Niet:

- resultaten die niet uniek aan een zichtbare SOMtoday-kaart zijn gekoppeld;
- waardes die niet door de ondersteunde cijferparser gaan;
- unresolved revisies of data.

## 26.3 Inhoud

Newest first.

Per item:

- vak;
- toetsomschrijving;
- datum;
- weging;
- geopend cijfer;
- subtiele tier accent;
- eventueel datum/tijd waarop geopend.

Het is een stijlvolle archive/collection, geen casino inventory.

## 26.4 Empty state

**Nog geen geopende cijfers**

**Cijfers die je via een pack opening opent, verschijnen hier.**

---

# 27. Collectie visueel

Collectie mag duidelijk meer gestileerd zijn dan de native grade list.

Maar:

- SOMtoday-page spacing blijft herkenbaar;
- tier-kleur is accent, niet hele rainbow-card;
- geen weapon-skin tiles;
- metadata blijft leesbaar;
- grade blijft dominant maar niet absurd groot.

---

# 28. Extension popup

Kies een **minimal utility popup**.

Niet de hoofdexperience.

Suggested:

- `Pack Opening voor SOMtoday`
- aantal ongeopende cijfers;
- `Geluid` toggle;
- volume;
- reduced-motion instelling;
- `Instellingen`;
- development-only `Test opening`;
- reset/wis lokale data met confirmation.

Geen tweede collectie in popup.

---

# 29. Nederlandse copy

Voorkeurscopy:

- `Nieuw cijfer`
- `Open cijfer`
- `Nieuwe cijfers`
- `Volgende openen`
- `Terug naar SOMtoday`
- `Alles geopend`
- `Collectie`
- `Nog geen geopende cijfers`
- `Geluid`
- `Volume`
- `Verminder beweging`
- `Instellingen`
- `Cijfers controleren…`
- `Cijfer tijdelijk verborgen`
- `Spoilerbescherming niet actief`
- `Opnieuw proberen`

Niet half Nederlands / half Engels in productie.

---

# 30. Eligibility contract

De visual layer ontvangt classified state van de integration layer.

Nooit zelf raden op basis van:

```text
isCijfer === true
```

De recon bewijst dat `*` samen kan gaan met `isCijfer: true`.

Conceptueel:

```text
observed
  ↓
nonnumeric → geen pack
numeric
  ↓
baseline / pending / opened
```

De visual layer parseert geen willekeurige SOMtoday-result strings.

---

# 31. Placeholder → numeric transition

Een bestaand `*` result kan mogelijk later numeric worden.

Daarom:

- “ID al gezien” betekent niet automatisch “nooit pack”;
- eligibility/version transition kan relevant zijn;
- integration state bepaalt `pending`;
- UI krijgt alleen veilige status door.

Geen aanname dat elke pack altijd een volledig nieuwe ID krijgt.

---

# 32. Eerste installatie / baseline

Bij first setup:

- bestaande zichtbaar gekoppelde individuele cijfers → pending en handmatig openbaar;
- de getoonde uitkomst blijft exact de bestaande SOMtoday-waarde;
- ongeldige, niet-ondersteunde of ambigue koppelingen blijven verborgen;
- gewijzigde numeric revisies worden niet stilzwijgend heropend;
- Collectie start leeg totdat packs worden geopend.

Rustige status indien nodig:

**Cijfers controleren…**

Geen onboarding-cinematic.

---

# 33. Spoiler Shield — designcontract

Voor pending grade:

- numeric value niet zichtbaar;
- weighting op de primaire recent card niet zichtbaar;
- aggregate ARIA gesanitized;
- tooltip kan niet lekken;
- detailweergave kan niet lekken;
- overview kan niet lekken;
- subject view kan niet lekken;
- affected averages blijven concealed totdat veilig.

Bij uncertainty:

**conceal**.

---

# 34. Gemiddelden

Een gemiddelde kan indirect een nieuw cijfer verraden.

Daarom mag tijdelijk worden verborgen:

- vakgemiddelde;
- periodegemiddelde;
- rapportgemiddelde;
- rapportcijfer;
- subject-summary values.

Visueel sober, bijvoorbeeld:

```text
Gemiddelde
•••
```

Nooit een oud/geschat fake gemiddelde tonen.

---

# 35. Loading / unresolved

Wanneer een gevoelige surface bestaat maar classification/storage nog niet klaar is:

- gevoelige value blijft concealed;
- geen fake pack claim;
- rustige neutrale state.

Copy indien nodig:

**Cijfers controleren…**

Geen spinner op ieder individueel card tenzij echt nodig.

---

# 36. Failure UX

Bij onveilige/ambigue classificatie:

**Cijfer tijdelijk verborgen**

**Opnieuw proberen**

Bij bredere protection failure:

**Spoilerbescherming niet actief**

Nooit doen alsof protection werkt wanneer dat niet bewezen is.

---

# 37. Accessibility

- volledige keyboard support;
- duidelijke focusring;
- fullscreen reveal als semantische dialog;
- focus naar opening;
- focus terug naar originating card;
- geen verborgen cijfer in ARIA vóór reveal;
- geen oplossing via visuele blur alleen.

Bij daadwerkelijke reveal mag één gecontroleerde live announcement plaatsvinden, bijvoorbeeld:

**Wiskunde A. Cijfer 8,3.**

Decoratieve motion/particles worden niet aangekondigd.

---

# 38. Reduced motion

Respecteer:

- `prefers-reduced-motion`;
- extension setting.

Reduced flow:

```text
overlay
↓
korte mystery state
↓
fade
↓
result reveal
```

Geen:

- lange horizontal spin;
- camera shake;
- grote particle sweep;
- parallax.

Sound blijft apart instelbaar.

---

# 39. Responsive

Ondersteun:

- desktop;
- smalle browservensters;
- mobile-like viewport widths in desktop Chromium.

Reel:

- minder zichtbare cards bij smalle viewport;
- center marker blijft exact;
- target alignment blijft deterministisch;
- geen horizontal page overflow.

---

# 40. Typography

## Native SOMtoday integration

Gebruik/inherit SOMtoday-compatible typography.

Geen gamefont in bestaande cijfercards.

## Pack overlay

Gebruik lokale/system sans serif.

Preferred stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
             BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Als Inter niet lokaal gebundeld is: system stack, geen remote font fetch.

---

# 41. Grade typography

De grade is de grootste tekst in final reveal.

- tabular numerals;
- zeer hoog contrast;
- controlled tracking;
- geen fake 3D chrome text;
- tier-lighting erachter, nooit ten koste van leesbaarheid.

---

# 42. Particles

Canvas 2D wanneer nuttig.

Regels:

- bounded count;
- geen zware physics dependency;
- tier-afhankelijk;
- korte lifetime;
- nooit grade bedekken;
- reduced/disabled bij reduced motion.

9,5–10 krijgt sterkste behandeling.

---

# 43. Lighting

Belangrijker dan gimmicks.

Mogelijke lagen:

- marker bloom;
- reel edge falloff;
- target edge-light;
- final radial wash;
- tier backlight;
- korte specular streak.

Geen full-screen white flash.

---

# 44. Texture

Zeer subtiel toegestaan:

- noise;
- brushed-metal indruk;
- micro scratches;
- faint grid/film grain.

Geen gedownloade copyrighted game texture nodig.

---

# 45. Geen fake randomness

Randomness mag alleen voor:

- particle positions;
- niet-semantische cosmetic variation;
- harmless texture noise.

Nooit voor:

- grade;
- tier;
- outcome;
- pack eligibility;
- selected result;
- persisted state.

---

# 46. Audio ↔ motion

Audio-events volgen echte events:

```text
marker crossing → tick
stop → clunk
reveal → impact
exceptional tier → extra matching accent
```

Geen generic track die timing loslaat van motion tenzij het asset daarvoor ontworpen is.

---

# 47. Cancel/close gedrag

Tijdens actieve reel:

- background click annuleert niet;
- geen abort die native grade ineens blootlegt;
- `Escape` mag niet unsafe terugvallen.

Na reveal:

- normaal sluiten toegestaan.

---

# 48. Opened persistence

Na succesvolle reveal:

- opened state persisten vóór unsafe/native exposure;
- reload opent pack niet opnieuw;
- SPA navigation opent pack niet opnieuw;
- browserrestart opent pack niet opnieuw;
- Collectie-item blijft bestaan.

---

# 49. Collectie-semantiek

Collectie betekent:

> **individuele packs die jij persoonlijk hebt geopend, ook bestaande cijfers bij first install**

Niet:

> alle historische cijfers in SOMtoday.

Dus:

- baseline niet importeren;
- alleen bij succesvolle pack reveal toevoegen;
- changed-grade versioning later expliciet ontwerpen;
- oude collection entry niet stil herschrijven zonder policy.

---

# 50. Changed grades

Nog niet volledig bewezen door recon.

Toekomstige neutrale copy:

**Cijfer gewijzigd**

Niet `Nieuw cijfer` als het technisch om een wijziging gaat.

Geen speculative changed-grade UX bouwen voordat gedrag bewezen is.

---

# 51. Development reveal simulator

Bouw development-only simulator zodat motion/audio kan worden geperfectioneerd zonder op een echt cijfer te wachten.

Fixtures minimaal:

- `4,8`
- `6,3`
- `7,8`
- `8,9`
- `9,7`

Simulator kan ondersteunen:

- vak;
- omschrijving;
- cijfer;
- weging;
- queue size;
- reduced motion;
- mute/volume;
- replay.

Geen production state vervuilen.

---

# 52. Performance

Doel:

- smooth 60 fps op moderne desktop;
- geen continue idle animations;
- één reel-container transform;
- transforms/opacity waar mogelijk;
- bounded particles;
- geen 100ms full-page polling;
- geen zware rendering dependency naast gekozen stack.

---

# 53. CSS-isolatie

Prefix extension-owned styles met bijvoorbeeld:

`po-`

Voorbeelden:

- `.po-opening-overlay`
- `.po-reel`
- `.po-reel-card`
- `.po-result-reveal`
- `.po-collection`

Geen generieke globale `.card`, `.button`, `.title` selectors.

---

# 54. Native card integration — exacte designregel

Op `/cijfers`:

**geen custom replacement cards.**

Gebruik de bestaande kaart als visuele container en injecteer alleen:

- veilige concealment voor cijfer + weging;
- hover/focus blur overlay;
- `NIEUW CIJFER`;
- `Open cijfer`.

Preserve:

- icon;
- vak;
- toets/subtitle;
- datum;
- spacing;
- card geometry.

De implementation mag intern extension-owned safe fragments gebruiken waar nodig voor spoiler safety, maar het eindresultaat moet visueel één bestaande SOMtoday-card blijven.

---

# 55. Primary card states

## Safe / normal

Geen extension decoration.

## Pending / resting

- vak/test/datum visible;
- cijfer concealed;
- weging concealed.

## Pending / hover/focus

- hele card blur;
- dark overlay;
- `NIEUW CIJFER`;
- `Open cijfer`.

## Opening

- kaart blijft veilig concealed onder overlay.

## Opened

- normale SOMtoday-presentatie;
- optionele korte afterglow;
- daarna geen permanente styling.

---

# 56. Geen permanente gamification van Cijfers

Niet doen:

- rarity borders om alle oude grades;
- permanente tier backgrounds;
- “epic/legendary” badges;
- confetti bij reload;
- game-HUD op cijferpage.

Opening is speciaal omdat de rest normaal blijft.

---

# 57. Collectie vs Cijfers

`Cijfers` antwoordt:

> “Wat zijn mijn cijfers?”

`Collectie` antwoordt:

> “Welke cijferpacks heb ik geopend?”

Niet dupliceren tot twee grade-management pages.

---

# 58. Edge states

## Geen pending grades

Gewone pagina. Geen banner nodig.

## Result niet veilig classificeerbaar

**Cijfer tijdelijk verborgen**

## Collectie leeg

**Nog geen geopende cijfers**

## Audioasset ontbreekt

- geen remote/generator fallback;
- visual reveal gaat door;
- non-sensitive developer warning toegestaan.

## Motion library faalt

Safe simplified reveal, geen blokkade.

---

# 59. Eerste echte numerieke grade

De reconnaissance eindstatus is:

**READY_FOR_FIRST_NUMERIC_GRADE**

De eerste echte numeric grade is een validation event, geen redesign moment.

Check dan:

- model;
- self identity;
- numeric parser;
- eligibility transition;
- card concealment;
- overview concealment;
- subject concealment;
- mobile detail;
- ARIA;
- averages;
- opening;
- opened persistence.

---

# 60. Belangrijkste recon-feiten die implementatie moet respecteren

Lees `SOMtoday-Grade-Unboxing-Recon.md` volledig.

Onder andere:

- `links[rel="self"].id` is provisionally verified result identity voor huidige records;
- huidige self IDs zijn stabiel over reload/navigation/projections;
- `isCijfer: true` is niet genoeg voor eligibility;
- `*` is nonnumeric en geen pack;
- recent feed is bounded en niet de complete historische baseline;
- `/cijfers`, `/cijfers/overzicht`, `/cijfers/vakgemiddelden`, `/cijfers/vakresultaten`, mobile details, tooltips en ARIA-surfaces zijn in kaart gebracht;
- native accessibility labels kunnen results lekken;
- static fail-closed pre-paint shielding is essentieel;
- gemiddelden zijn server-driven/afgeleid en kunnen indirect spoilen;
- numeric behavior moet nog bij eerste echte grade gevalideerd worden.

Geen naive DOM-only scraper bouwen.

---

# 61. Privacy

Geen:

- analytics;
- telemetry;
- cloud sync;
- eigen account;
- grade upload;
- tracking pixels;
- remote JS;
- third-party grade backend.

Credentials/tokens/cookies horen nooit in logs of storage van deze extensie.

---

# 62. Settings

V1 klein houden.

## Geluid

- Aan/uit
- Volume

## Beweging

- Systeeminstelling volgen
- Verminder beweging

## Gegevens

- Lokale collectie wissen
- Extensie opnieuw instellen

Reset vereist confirmation.

---

# 63. Copy tone

Nederlands, kort, rustig, confident.

Goed:

**Nieuw cijfer**

**Open cijfer**

Niet:

**Gefeliciteerd! Er staat een spectaculaire nieuwe cijferbeloning voor je klaar!**

---

# 64. Originaliteit / IP

We gebruiken de emotionele pacing van een CS-style opening.

We kopiëren niet:

- Valve-logo’s;
- Counter-Strike-logo’s;
- case artwork;
- weapon skin frames;
- rarity textures;
- sounds;
- music;
- proprietary fonts;
- exacte UI chrome.

Alles origineel.

---

# 65. Acceptance test — één cijfer

1. Student opent SOMtoday.
2. Gaat naar `Cijfers`.
3. Bestaande safe grades zien er normaal uit.
4. Eén nieuwe eligible numeric grade is pending.
5. Vak/test/datum zijn leesbaar.
6. Cijfer en weging zijn verborgen.
7. ARIA lekt niets.
8. Hover blurt hele card.
9. `NIEUW CIJFER` + `Open cijfer` verschijnen.
10. Student klikt.
11. SOMtoday darkens/blurs achter overlay.
12. Subjectkaart verschijnt; `Open Cijfer` of Enter start de morph en reel.
13. Reel decelereert tot ~6 seconden.
14. Voorbeeldcijfers en het echte targetresultaat zijn zichtbaar op de reel.
15. Target stopt exact onder marker.
16. De target bevat het echte cijfer, nooit een numerieke vervanging van `*`.
17. Korte pauze.
18. Tier visual activeert.
19. De target morpht naar de resultkaart zonder tweede cijferanimatie.
20. Aangeleverde audio is gesynchroniseerd.
21. Student sluit/gaat terug.
22. Normale grade + weighting zijn nu zichtbaar.
23. Reload opent pack niet opnieuw.
24. Pack staat in `Collectie`.

---

# 66. Acceptance test — meerdere grades

1. Drie pending grades.
2. Geen enkele value lekt.
3. Gebruiker opent eerste.
4. Result blijft staan.
5. `Volgende openen` beschikbaar.
6. Tweede/derde blijven concealed.
7. Elke reveal wordt apart gepersist.
8. Collection-entry verschijnt pas na daadwerkelijke reveal.

---

# 67. Acceptance test — laag cijfer

Voor een grade onder 5,5:

- zelfde premium core flow;
- crimson final treatment;
- geen roast of commentaar bij het cijfer;
- het cijfer verschijnt zonder commentaar;
- grade duidelijk leesbaar.

---

# 68. Acceptance test — 9,5–10

- geen tier leak vóór stop;
- iridescent treatment pas na stop;
- sterkste controlled particles/light;
- passende high-tier audioasset indien aanwezig;
- merkbaar specialer dan 7,0;
- niet tacky.

---

# 69. Acceptance test — reduced motion

- spoiler safety identiek;
- korte overlay;
- mystery state;
- fade naar result;
- geen lange reel;
- geen shake;
- minimale particles;
- reveal-volgorde blijft hetzelfde.

---

# 70. Acceptance test — accessibility

Voor opening:

- screen reader hoort geen cijfer;
- op primaire recent card hoort screen reader ook geen concealed weighting;
- `Open cijfer` is correct gelabeld;
- tooltip lekt niet.

Bij reveal:

- resultaat één keer aangekondigd.

Na reveal:

- normale veilige semantics terug.

---

# 71. Acceptance test — first install

1. Extensie wordt geïnstalleerd bij bestaande history.
2. Zichtbare individueel gekoppelde numerieke cijfers krijgen een openactie.
3. Onzichtbare of ambigue data blijft gemaskeerd.
4. `*` blijft individueel openbaar als neutrale pack.
5. Collectie blijft leeg tot de gebruiker een resultaat opent.
6. SOMtoday blijft bruikbaar.

---

# 72. Anti-patterns

Nooit:

- hele cijferpagina permanent dark maken;
- SOMtoday namaken;
- fake grade dashboard bouwen;
- een verkeerd cijfer op de geselecteerde reelkaart;
- slotmachine imagery;
- lage grades belachelijk maken;
- tierkleur vóór reveal tonen;
- werkelijk cijfer alleen CSS-blurren en dat “veilig” noemen;
- ARIA met echte result laten staan;
- reel als simpele CSS ease-out bouwen;
- audio vóór user gesture autoplayen;
- permanent rarity styling op opened cards;
- remote game assets laden;
- selectors/API fields verzinnen.

---

# 73. Handoff-contract voor coding agents

Een agent die implementeert vanuit deze workspace moet:

1. `design.md` volledig lezen.
2. `SOMtoday-Grade-Unboxing-Recon.md` volledig lezen.
3. Recon als enige authority voor SOMtoday-internals gebruiken.
4. UX bouwen volgens dit design.
5. Spoiler safety nooit verzwakken voor eenvoud.
6. React + TypeScript + Motion for React gebruiken.
7. Reel met custom `requestAnimationFrame` bouwen.
8. Alleen lokale aangeleverde audio/music gebruiken.
9. Alle production UI Nederlands houden.
10. Normale SOMtoday buiten pending/opening intact houden.
11. Reveal eerst volledig tegen fixtures perfectioneren.
12. Eerste real numeric grade valideren volgens recon, niet gokken.
13. `Collectie` alleen met daadwerkelijk geopende packs vullen.
14. Na opening native/SOMtoday-look herstellen.
15. De ervaring laten voelen als een echte premium pack opening.

---

# 74. Final design principle

De extensie slaagt wanneer een leerling naar de normale SOMtoday-cijferpagina gaat, een vertrouwde kaart ziet waarbij alleen **cijfer en weging** geheimzinnig verborgen zijn, erover hovert, waarna de hele kaart zacht blurt en toont:

**NIEUW CIJFER**

**Open cijfer**

Na de native openactie verschijnt eerst de subjectkaart. Na `Open Cijfer` volgen een vloeiende morph, snelle reel, zware slowdown, korte terugveer binnen de echte targetkaart en een finish waarin dezelfde kaart groot wordt.

De extensie faalt als:

- het cijfer ook maar één frame eerder lekt;
- SOMtoday buiten de opening niet meer als SOMtoday voelt;
- de animation als goedkope slotmachine voelt;
- de uitkomst random lijkt;
- cijferresultaten bevatten een roast of commentaar;
- of de reveal minder spannend voelt dan simpelweg de pagina refreshen.

**Spoiler-safe first. Native SOMtoday second. Real pack-opening tension third. Spectacle only after the stop.**
