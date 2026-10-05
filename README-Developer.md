# Developer build 0.2.3

Deze versie heeft een extra knop **Debug** rechtsonder op SOMtoday.

## Installeren

1. Download `zzz-developer-debug-build-0.2.3.zip` bij release 0.2.3.
2. Pak het ZIP-bestand uit in een nieuwe map.
3. Open `chrome://extensions` of `edge://extensions`.
4. Zet **Ontwikkelaarsmodus** aan.
5. Kies **Uitgepakte extensie laden** en selecteer de uitgepakte map.
6. Open SOMtoday en kies rechtsonder **Debug**. Met **Kopieer debugrapport** kopieer je de gegevens.

Gebruik deze versie alleen om een probleem te onderzoeken. In het rapport staan kaartgegevens en redenen voor koppelen of afwijzen. Cijferwaarden, cookies, tokens en account-ID's worden niet getoond. Controleer het rapport zelf voordat je het deelt.

## Zelf opnieuw bouwen

Voer `npm run build:developer` uit. Dit maakt telkens een nieuwe, aparte map `dist-developer-0.2.3-*`; de normale buildmap, release-ZIP en eerdere developer builds worden niet overschreven.
