# Eén cijfer uit twee dossiers

De oude code gaf elk dossierrecord een eigen opslag-ID. Als twee records bij één zichtbare kaart pasten, bleef de kaart terecht geblokkeerd. Er ontbrak een manier om bewezen koppelingen vóór die controle samen te voegen.

## Wanneer samenvoegen?

De gegevens moeten dezelfde leerlingcontext, vak-ID, resultaatkolom-ID, lichting (als aanwezig) en poging hebben. Die kolom-ID komt uit `additionalObjects.resultaatkolom`. De huidige SOMtoday-code gebruikt deze kolom-ID en de poging ook om recente records samen te voegen.

Ook de cijfergegevens moeten overeenkomen: waarde, weging, datum en kloktijd, vaknaam, toetsomschrijving, periode, toetscode, kolomtype en cijferflags. Gelijke getallen met een punt of komma en gelijke wegingnotaties tellen als dezelfde waarde. Twee verschillende record-ID's binnen hetzelfde dossier worden niet samengevoegd.

Zonder expliciete gedeelde identiteit doen we geen samenvoeging. Alleen gelijke tekst op de kaart of een gelijke toetscode is onvoldoende. De ongewijzigde debug-userscript met twee verschillende ID's en zonder kolom-ID blijft dus geblokkeerd.

## Waar gebeurt het?

`src/state/logical-results.ts` koppelt de records in de opslagworker, vóór DOM-matching. Het bewaart gehashte koppelingen van de ruwe sleutels naar één logische sleutel. Eén versie van die sleutel heeft één openstatus en één inventarisitem. Openen markeert alle bewezen koppelingen; reset verwijdert al hun openmarkeringen.

De content bridge gebruikt deze sleutels voor DOM-matching. Hij maakt geen eigen koppeling op basis van zichtbare tekst. Verschillende of tegenstrijdige records houden verschillende sleutels en blijven bij een onduidelijke kaart geblokkeerd.

## Bestaande gebruikers

Oude opslag krijgt een lege koppelingslijst. Er wordt niets gegokt of gewist. Bij opnieuw ontvangen gegevens wordt een oude ruwe sleutel alleen omgezet als dezelfde ruwe identiteit én versie zijn herkend en de nieuwe gegevens de koppeling bewijzen. Dubbele inventarisitems met die bewezen logische sleutel en versie worden samengevoegd. Oudere historie waarvoor dat bewijs ontbreekt blijft behouden.

## Bewijs en grenzen

- De huidige officiële SOMtoday-frontend leest de kolom-ID uit de aanvullende resultaatgegevens en groepeert recente items op kolom en poging.
- De bewaarde productie-opnames bevatten voortgangsrecords en tijdzone-loze datums. Ze bevatten geen bewezen voortgang/examen-paar en bewaren geen kolom-ID. Ze bevestigen de oorzaak bij de TikTok-gebruiker dus niet.
- De positieve test is een model met expliciet gedeelde kolomidentiteit. De ongewijzigde userscript is een negatieve test voor de ambiguïteit.
- `tests/logical-results.test.ts` controleert sleutels, status, migratie, latere koppelingen, reset, conflicten en herladen.
- `tests/e2e/extension.spec.mjs` test de echte po/1-bridge, één native kaart, pack opening, opslag, inventaris en herladen in Chromium.

Datums en herkansingen zijn apart onderzocht; de tijdzonetests gebruiken voorbeeldgegevens en zijn geen bewijs voor de gemelde gebruiker.
