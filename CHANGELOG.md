# Wijzigingen

## 0.2.0 — 5 oktober 2026

- Bestaande en nieuwe individueel gekoppelde cijfers kunnen worden geopend zonder persoonlijke validatieprofielen of volledige historie.
- Een `*` dat later een cijfer wordt, en gewijzigde cijferwaarden, krijgen een nieuwe opening. De eerder geopende versie blijft bewaard.
- Detectie uitgebreid naar vakresultaatkaarten en examendossierresponses.
- Ondersteuning voor punt/komma, één of twee decimalen, verschillende wegingnotaties en lege toetsomschrijvingen bij een unieke metadata-koppeling.
- Accountwisselingen houden wachtrij en inventaris gescheiden. Een late response zonder accountscope kan het actuele gekoppelde resultaat niet overschrijven.
- Onbekende of tijdelijk onvolledige kaarttemplates blijven afgeschermd; hun oude openactie wordt ingetrokken.
- De cijferrol volgt de klok van het originele geluid, vertraagt vloeiend op de laatste ticks en veert terug naar de echte winnende kaart bij de onthulling.
- ZIP-build werkt zonder PowerShell; de release bevat alleen de productie-extensie.
- Nederlandse installatie-, update- en probleemoplossingsinstructies toegevoegd.
- Geheimencontrole toegevoegd, persoonlijke documentatiepaden verwijderd en lokale test-/profielbestanden uitgesloten van publicatie.
- GitHub Actions controleert broncode, geheimen, builds en browserregressies.

Getest met synthetische SOMtoday-responses. Ondersteuning is gericht op desktop Chromium Manifest V3; niet iedere schoolomgeving of toekomstige SOMtoday-versie is daarmee live gecertificeerd.
