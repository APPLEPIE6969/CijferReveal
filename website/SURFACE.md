# Linkpagina

Deze notitie beschrijft alleen de publieke linkpagina in `website/index.html`. De pagina gebruikt een LittleLink-achtige, codegerichte vorm om bezoekers naar het CijferReveal-project te leiden. Ze hoort bij de bestaande CijferReveal-wereld; dit document wijzigt of vervangt de extensieontwerpkeuzes in [design.md](../design.md) niet.

## Richting

De bevestigde sfeer is **donker en rustig**: grafiet als basis, gedempt blauw als accent en lichte tekst met voldoende contrast. Een kleine `CR`-markering, een korte kop en één duidelijke projectlink houden de pagina stil en doelgericht. De serifkop geeft een bescheiden redactionele noot binnen de verder systeemtypografische vorm.

## Inhoud en interactie

- Toon de kop “Cijfers, één voor één.” en de korte uitleg over de SOMtoday-pack opening.
- Bied precies één link aan: [Bekijk het project op GitHub](https://github.com/js664/CijferReveal). Open die in een nieuw tabblad met veilige `rel`-attributen.
- Houd de overige projectcontext als gewone tekst; voeg geen tweede bestemming of concurrerende oproep toe.
- Behoud zichtbare toetsenbordfocus, een korte hoverreactie en ondersteuning voor `prefers-reduced-motion`.

## Schermgedrag

Centreer één compacte kaart in het venster op desktop. Op smalle schermen blijft de kaart binnen de viewport en worden buitenruimte, binnenmarges en tekstmaat teruggebracht. Houd de kop leesbaar en de GitHub-link gemakkelijk aanraakbaar.

## Publicatie

GitHub Pages publiceert de inhoud van `website/` via `.github/workflows/deploy-pages.yml`. De live pagina staat op https://js664.github.io/CijferReveal/.
