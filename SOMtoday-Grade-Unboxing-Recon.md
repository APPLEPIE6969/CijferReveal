# SOMtoday Grade Unboxing Recon

> Historical investigation notes, with identifiers redacted. The current Dutch README and implementation describe release 0.2.0. Early exclusions of individual stars/numeric revisions do not represent the current opening policy; unknown aggregates and ambiguous identities still remain concealed.

## Executive status

Read-only reconnaissance performed on 2026-10-04 in the authenticated Chrome tab. No extension was built. No forms were submitted, authenticated requests manually replayed, or SOMtoday data changed. Temporary diagnostic CSS, a DOM observer, and navigation listeners were removed; the viewport was reset and the tab restored to `/cijfers`.

**PROVEN:** the two current `*` records have distinct, stable self identities; the overview projection preserves them; recent results, subject results, overview values, averages, mobile detail dialogs, ARIA names, and an overview tooltip are mapped. Temporary CSS concealed current value surfaces while navigation remained visible, including accessibility checks.

**STRONGLY SUPPORTED:** a static, fail-closed MV3 stylesheet can conceal these selectors before Angular renders them. This follows Chrome's documented injection ordering, the empty initial application root, and tested selector behavior. An actual installed extension was not tested.

**UNKNOWN UNTIL FIRST NUMERIC GRADE:** numeric response semantics, publication behavior, live changes and deletion, numeric conditional UI, and actual changes to averages.

The report contains no student IDs, result IDs, account names, credentials, or actual average values. A few early tool outputs inadvertently included profile text and identifier-bearing paths; they are excluded here. Subsequent inspections used structural summaries.

## Proven application structure

- Angular SPA, with initial HTML containing `<sl-root></sl-root>` and no result components. Components are created by client-side rendering.
- Persistent application shell: `sl-root` → `sl-home`. Grade route subtree: `sl-cijfers`.
- Observed routes: `/cijfers`, `/cijfers/overzicht`, `/cijfers/vakgemiddelden`, and `/cijfers/vakresultaten`. Subject selection uses route query context; dynamic context must be redacted from logging.
- `/rooster` is the timetable/home surface inspected. No separate dashboard was exposed by the inspected primary navigation or menu.
- Desktop recent-result expansion is inline. At a 390 × 844 viewport, expansion creates a body-level `sl-modal` containing a dialog and `sl-resultaat-item-detail.in-modal`.
- Do not depend on generated `_ngcontent-*`, `_nghost-*`, or `ng-tns-*` identifiers.

## Proven API resources

Only normal page-generated responses were inspected. Paths below are templates, with every dynamic segment redacted.

| Resource path template | Observed purpose / shape |
|---|---|
| `/rest/v1/geldendvoortgangsdossierresultaten/leerling/{student}` | Recent progression results; `{ items: [...] }`; two current records; HTTP 206 observed |
| `/rest/v1/geldendexamendossierresultaten/leerling/{student}` | Recent exam results; `{ items: [] }` in this account |
| `/rest/v1/geldendvoortgangsdossierresultaten/leerling/cijferoverzicht/{context}` | Overview object with `vakResultaten` and `cijferperioden` |
| `/rest/v1/geldendvoortgangsdossierresultaten/vakresultaten/{student}/vak/{subject}/lichting/{cohort}` | Subject list; individual and report-value records in `items` |
| `/rest/v1/geldendexamendossierresultaten/vakresultaten/{student}/vak/{subject}/lichting/{cohort}` | Subject exam list; empty in the inspected subject |
| `/rest/v1/vakkeuzes/plaatsing/{placement}/vakgemiddelden` | Server-provided subject-summary object with `gemiddelden` |
| `/rest/v1/geldendexamendossierresultaten/leerling/context/{context}` | Exam-context resource; schema not used to claim a populated exam-grade surface |
| `/rest/v1/resultaatpublicatiemomenten/volgende/leerling/{student}` | Next-publication notice; does not prove actual publication delivery |

Shipped recent-feed code applies result-column type filters, sorts descending by `geldendResultaatCijferInvoer`, and requests `Range: items=0-30`. Treat it as a bounded recent feed, not a complete historical baseline. Normal route re-entry can reuse cached state and need not issue another GET.

## Result schema

Current main-resource `$type`: `resultaten.RGeldendVoortgangsdossierResultaat`.

Observed fields:

```text
$type, links[], permissions, additionalObjects, periode,
formattedResultaat, formattedEerstePoging, volgnummer, type,
toetscode, omschrijving, weging, bijzonderheid,
datumInvoerEerstePoging, isLabel, isCijfer, herkansing, toetssoort
```

`additionalObjects` contains structural metadata keys `resultaatkolom`, `vaknaam`, `lichtinguuid`, `vakuuid`, and `naamalternatiefniveau`. Do not confuse a result-column identity with the result-record self identity.

Both records have `formattedResultaat: "*"` and `isCijfer: true`. Their DOM describes them as not made. **Neither qualifies for an unboxing.** No normal numeric record was available.

Overview records omit `$type` in the observed projection but retain `links` and the result fields. Requiring a top-level `$type` on every surface would reject this valid projection.

Shipped mapping code also references optional fields for numeric values, sufficiency, remarks, alternate levels, and retakes. Their presence in code does not prove their actual response shape in this account.

## Canonical result identity

For each current result:

- Exactly one `links` entry has `rel === "self"`.
- Its `type` equals the main record's `$type`.
- Result A vs Result B: **DIFFERENT**.
- Both overview projections preserve the main-resource self identity.
- The inspected subject result for A preserves its main-resource identity.

The shipped API-to-model identity helper explicitly returns the ID of `links.find(link => link.rel === "self")`, with a fallback to `rel === "koppeling"`. The result mapper assigns that helper's return value to model `id`. This provides semantic evidence beyond the mere presence of a link.

**`links[rel="self"].id = PROVISIONALLY VERIFIED RESULT IDENTITY`**

Provisionally refers to numeric-result behavior, lifetime, and uniqueness beyond the observed records. Do not silently adopt the fallback relation for a numeric record without validation. Namespace persisted identities by account context and resource/dossier family unless cross-family uniqueness is established; never log raw identities.

## Identity stability tests

| Test | Result A | Result B |
|---|---|---|
| Full reload, fresh main GET | SAME | SAME |
| Navigate to `/rooster`, return to `/cijfers`, then obtain fresh normal GET by reload | SAME | SAME |
| SPA grade-route navigation and overview projection comparison | SAME | SAME |
| Browser back/forward cycle, return to `/cijfers`, then fresh normal GET by reload | SAME | SAME |
| Repeated normal main-resource GET observations | SAME | SAME |
| Main-resource identity vs overview identity | SAME | SAME |

Important measurement limit: fresh GETs after the away/back and history cycles establish identity after those cycles. They do not constitute direct extraction of Angular's cached component input at every intermediate click. SPA DOM correspondence was checked separately; caching can suppress intervening requests. The previous reconnaissance also reported equality across a reload.

## API → DOM correlation

Observed chain:

```text
API record
  → mapper: id from self link, subject metadata, description/date/weight/value
  → Angular result / latest-result view model
  → sl-laatste-resultaat-item or sl-vakresultaat-item
  → resultItem input on sl-resultaat-item
  → .root[role="text"][aria-label] and .cijfer
```

The shipped recent component takes a `laatsteResultaat` signal input and converts it through `toResultaatItem`; the subject component takes `resultaat`. Both supply `resultaatItem` to the shared child. The recent transformation retains an underlying `geldendResultaten` collection: do not assume every card always represents exactly one canonical record, especially for attempts or grouped results.

For the current two records, description, subject name after case normalization, input date as rendered, weight, and placeholder value provide an unambiguous join. Descriptions matched the DOM; one subject needed case normalization. These fields are educational metadata, not public data; use them transiently rather than logging them.

No canonical ID was found in the inspected hosts' DOM attributes. Tracking attributes describe UI actions, not record identity. Hosts retain non-enumerable `__ngContext__` numeric references; `window.ng` is unavailable. The live component object could not be retrieved through a public Angular debug API. Source inspection proves inputs/model mapping, but it does not justify depending on private Angular indexes in production.

Strongest practical mechanism: obtain canonical records from allowlisted normal responses, retain model relationships, and join the current DOM using a unique metadata tuple. Require exactly one match. Ambiguous matches remain concealed. Never make DOM order, grade value, description alone, or a generated Angular attribute the identity.

## Recent-result surface

Route `/cijfers`:

```text
sl-cijfers
  sl-laatsteresultaten
    sl-laatste-resultaat-item[role="button"][aria-expanded]
      sl-resultaat-item
        .root[role="text"][aria-label]
          .details → .titel, .subtitel
          .wegingcijfer → .weging, .cijfer > span
      sl-resultaat-item-detail (after desktop expansion)
```

The individual value appears in visible `.cijfer` text and the `.root` aggregate ARIA name. Current recent hosts do not have their own value-bearing ARIA name; subject hosts do. Results appear asynchronously after the route subtree is mounted.

Desktop details currently show test type, weighting, attempt status and a subject-list action. Current desktop expansions did not repeat the value. Mobile detail does repeat it; shield the detail component regardless of route or parent.

## Grade-overview surface

Route `/cijfers/overzicht`, parent `sl-cijfer-overzicht`, with progression child `sl-cijfer-overzicht-voortgang`:

- Native table, subject rows, individual values in `td.cijfer`.
- Derived period/report columns use `td.cijfer.gemiddelde`.
- Visible values and cell `aria-label` can both disclose result information.
- A result-cell label describes the current placeholder as not made, followed by description, weighting, and period.
- Derived labels distinguish period average, report average and report grade, including missed-test information.
- The inspected table has 119 `.cijfer` cells; 12 cells displayed `*` on restoration.
- Responsive styling can make cells `display: block`; the same selector continues to match.
- A subject cell with `role="link"` navigates to `/cijfers/vakresultaten`.

Projection schema:

```text
overview
  cijferperioden[]
  vakResultaten[]
    vakkeuze
    perioden[]
      periode
      resultaten[]
      rapportGemiddelde?
      rapportCijfer?
      periodeGemiddelde?  (supported by shipped mapper; absent in inspected periods)
```

Both placeholders are represented in `perioden[].resultaten[]`. This is a projection with the same self links, not only aggregate data. Aggregate records also have links: do not create packs for all self-linked objects. Distinguish individual test records from derived column types.

## Subject-average surface

Route `/cijfers/vakgemiddelden`:

```text
sl-vakgemiddelden
  sl-vakgemiddelde-item[role="button"]
    sl-vakgemiddelde-item-cijfer[aria-label]
      .gemiddelde
        span.cijfer
```

Current value hosts carry `aria-label="Rapportcijfer *"`. Hiding the inner span does not hide that host's accessible name. The same component structure was observed at desktop and mobile sizes. Hosts and values are populated asynchronously.

Server response: `gemiddelden[]`, each with `vakkeuze` and optional result summaries such as `voortgangsdossierResultaat`. The shipped component also supports exam/alternate-level summaries; no populated numeric exam summary is claimed here.

## Other spoiler surfaces

| Confirmed surface | Structure / value location | Accessibility / attributes | Arrival |
|---|---|---|---|
| Subject individual result, `/cijfers/vakresultaten` | `sl-vakresultaten` → `sl-voortgangsresultaten` → `sl-vakresultaat-item` → `sl-resultaat-item .cijfer` | Both subject host and shared `.root` have value-bearing ARIA labels | Async |
| Subject report values, same route | `.gemiddelde-wrapper` containing `.cijfer` | Wrapper labels such as `Rapportgemiddelde: *` and `Rapportcijfer: *` | Async; eight wrappers in inspected subject |
| Mobile recent detail, `/cijfers` | Body-level `sl-modal` → `[role="dialog"]` → `sl-resultaat-item-detail.in-modal .cijfer` | Dialog and detail host had no aggregate value name in the inspected state | After click |
| Overview hover tooltip | Body-level `hmy-tooltip.hmy-tooltip[visible]`, text directly on host | No role, title, ARIA association or result ID on inspected tooltip | After pointer hover |

Observed tooltip text described a test as not made, with description and weighting. Shipped overview tooltip code supplies status/description/weight; it does not interpolate the normal numeric value. It remains a derived-status disclosure surface. The overview ARIA pipe does interpolate the formatted result.

`/rooster` had no grade components or grade previews in the inspected state. `/berichten/postvak-in` was inspected without opening messages; no native grade component was observed. Navigation badges represented unread messages, not grades. The available menu exposed study material, absence, school information, settings, ideas/support and logout; no separate grade notification/dashboard area was exposed.

Arbitrary teacher-authored message text can contain grades. This is outside the structured grade adapter and was not read or classified. Individual messages were not opened because doing so could change read state. No assertion is made that every possible message preview, future push notification, or external notification is spoiler-free.

Exam, retake, alternate-level and composite-test components appear in shipped code. Their conditional populated numeric DOM is not a confirmed current surface and must not be invented from absent data.

## Accessibility spoiler surfaces

Sanitize or replace these owners before allowing an unopened native surface into the accessibility tree:

- `sl-resultaat-item .root[aria-label]` on recent and subject rows.
- `sl-vakresultaat-item[aria-label]` itself.
- `sl-cijfer-overzicht td.cijfer[aria-label]`, including averages/report grades.
- `sl-vakgemiddelde-item-cijfer[aria-label]` itself.
- `sl-vakresultaten .gemiddelde-wrapper[aria-label]`.
- Mobile detail `.cijfer` text and any result-bearing remarks/attempts rendered later.
- Body-level tooltip text and any future associated accessible description.

No `title`, `aria-labelledby`, or `aria-describedby` disclosure was found in the inspected result states. Subject view scan: zero of those three attributes. Expanded detail focus-trap anchors used `cdk-visually-hidden` but contained no text. Do not remove every ARIA attribute: the inspected weighting label and close/back controls are useful and contain no result value.

Actual accessibility checks using Chrome's full AX tree:

- Overview shielded: zero non-ignored accessible names containing `*`; after restoration: 34.
- Mobile recent/detail shielded: zero such names.
- Loaded subject result and eight report wrappers shielded: zero such names.

These prove the current placeholder disclosures were removed from the inspected AX names. They are not exhaustive numeric screen-reader validation. `opacity: 0`, color masking, or hiding only a value child does not solve aggregate accessible names. Host-level `display: none` or hidden accessibility-owning cells/wrappers is the safe early state.

## SPA lifecycle

Normal tab clicks perform SPA navigation. Diagnostic Navigation API events observed `navigationType: "push"`. Browser history traversal restored the expected grade routes. `sl-cijfers` unmounted on navigation to `/rooster`; route children remounted, while cached API state could be reused.

Use route changes as adapter reconciliation signals, not as the trigger that installs the shield. A persistent stylesheet must already be active throughout the document.

Recommended detection: document-start route listener via the Navigation API where supported, plus `popstate` and a narrow History API fallback if needed. The latter is a recommendation, not a tested interception in this reconnaissance. Observe a stable shell's direct child changes to find grade route roots; attach route-specific child-list observers to result lists, overview tables, and subject-average lists. A separate lightweight body-child observer can detect `sl-modal` and `hmy-tooltip` portals. Process added matching subtrees and relevant label/value mutations in batches; disconnect observers when their route root is detached. No periodic whole-document scan is needed.

## Pre-paint lifecycle

1. **Initial DOM:** the observed main document has an empty `sl-root` and no `sl-cijfers` or result components.
2. **Early stylesheet:** Chrome documents that manifest content-script CSS is injected before DOM construction/display; `document_start` JavaScript runs after that CSS and before page scripts. See [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
3. **Angular mount:** client code creates route components; result elements then appear asynchronously. A diagnostic observer saw new recent hosts already computing to `display: none` with the stylesheet active.
4. **Rendering:** an already-active selector matches newly created elements during style resolution. Its concealment requires no API response, identity classification, or MutationObserver callback. This is the basis for avoiding a visible-frame race.
5. **Classification:** adapter work occurs while the native surface stays concealed. Only validated safe presentation is allowed afterward.

Tests used a temporary CDP stylesheet active before subsequent SPA mounts, not an installed extension. It concealed current recent hosts, overview cells, subject summaries, loaded subject results/report wrappers, and mobile detail. Overview concealment survived browser back/forward and a 390 × 844 viewport change. Navigation remained visible. Removing the stylesheet restored native values and accessible names.

**Tool limit:** `Page.addScriptToEvaluateOnNewDocument` was rejected as unsupported. Therefore an instrumented document-start lifecycle and hard-reload early-css integration were not executed. Initial HTML inspection, source inspection, live CSS/AX tests and Chrome's documented ordering establish a credible architecture; they do not amount to an end-to-end zero-frame extension certification.

Persist the stylesheet across SPA navigation, history traversal, and responsive changes. Do not gate default concealment on a class added asynchronously, route polling, storage readiness, service-worker messages, or whether the API has already reported a new result. A match limited to `/cijfers*` documents is insufficient if the SPA initially loads `/rooster` and later navigates to grades; match the SOMtoday origin, scope selectors to result components.

CSS does not rewrite DOM strings or attributes. It can exclude hidden owners from rendering/accessibility, as tested; the adapter must provide sanitized visible/accessible replacements. If revealing a native owner, sanitize all aggregate labels first.

Safe restoration of current content by removing CSS was tested. A reusable per-element "opened" class is not an unconditional future safety guarantee: Angular can update/reuse that element for a changed or different result. Prefer keeping native result owners concealed and rendering extension-owned presentations from classified records. Native reveal requires an identity/version-bound design that revokes exposure before any changed value can render. That behavior must be validated separately; do not claim a delayed hide/classify observer alone solves it.

## Candidate early-concealment selectors

Diagnostic rules used, all removed afterward:

```css
sl-laatste-resultaat-item,
sl-vakresultaat-item,
sl-resultaat-item-detail,
sl-vakgemiddelde-item-cijfer {
  display: none !important;
}

sl-cijfer-overzicht td.cijfer,
sl-cijfer-overzicht td.cijfer *,
sl-vakresultaten .gemiddelde-wrapper,
sl-vakresultaten .gemiddelde-wrapper * {
  visibility: hidden !important;
}
```

| Candidate | Coverage and implications |
|---|---|
| `sl-laatste-resultaat-item` | Whole recent card, visible value and aggregate ARIA owner; removes card interaction until replacement; unrelated navigation retained |
| `sl-vakresultaat-item` | Whole subject result, including host ARIA; shared child-only hiding is insufficient |
| `sl-resultaat-item-detail` | Inline and body-level mobile details, including separate repeated value; keep modal close controls usable |
| `sl-vakgemiddelde-item-cijfer` | Summary value and its ARIA owner; subject label/row navigation remain |
| `sl-cijfer-overzicht td.cijfer` plus descendants | Individual and aggregate cells; table layout remains, accessible cell names suppressed; generated-class independent |
| `sl-vakresultaten .gemiddelde-wrapper` plus descendants | Subject report values and wrapper ARIA owners; period/subject headings remain |
| `sl-resultaat-item` | Useful component-wide backup for shared native result renderers; does not cover parent host ARIA by itself |
| `hmy-tooltip.hmy-tooltip` | Matches observed body-level tooltip; no stable grade-only owner attribute was found. A blanket static tooltip shield affects unrelated tooltips too; treat this as an explicit small-surface tradeoff, not a grade-specific selector |

All component/semantic-class selectors match again when Angular replaces nodes. Descendant visibility rules prevent a descendant's own visible styling from defeating inherited hiding. Confirm future cascade behavior, sufficiency icons, animations and alternate templates in implementation.

Reject `.cijfer` alone as a complete solution: it misses ancestor ARIA, and global use could affect unrelated future UI. Do not use `body { visibility: hidden }`.

## Average/derived-value behavior

| Average/value family | Evidence | Classification |
|---|---|---|
| Subject-summary report value | `/vakkeuzes/plaatsing/{placement}/vakgemiddelden`, `gemiddelden[].voortgangsdossierResultaat.formattedResultaat`; rendered by summary component | **A: server-delivered**, current schema proven |
| Subject report average/report grade | Subject result endpoint contains report-column result records; overview `perioden[].rapportGemiddelde` / `.rapportCijfer` also supplied by server | **A: server-delivered**, current placeholders proven |
| Overview period average | Shipped mapper reads `periodeGemiddelde` directly from response, without arithmetic in that mapping | **A strongly supported**; field absent in inspected current periods, so populated server value not proven |
| Exam/SE/other conditional averages | Source supports server summary fields, but no populated numeric state was inspected | Actual current numeric behavior **D: cannot determine** |

Client code transforms server models, formats labels and applies sufficiency styling; this does not demonstrate client-side numerical averaging. No observed surface required a client-side arithmetic calculation. This is not proof that the application never calculates any other derived value.

Even the current missed-test state propagates to report summaries across several periods. Therefore do not hide only an individual new value or only the current-period average. Until dependency rules are proven, conceal all report/period summaries for the affected subject and cohort/context, including later-period cumulative values, overview rows, subject detail wrappers and subject-summary cards. If dependencies or subject matching are uncertain, retain the broader grade-average shield.

Releasing an average requires every contributing numeric result to be baseline/opened and the summary snapshot to correspond to the classified data. Numeric update timing, server caching, cumulative period dependencies, alternate levels, cross-subject imports and exam relationships remain unproven.

## What is proven

- Both current `*` values are nonnumeric placeholders despite `isCijfer: true`.
- Single self link per main record, type equality, distinct identities, repeated fresh-GET equality, and same identities in overview projection.
- The shipped identity helper uses self ID and result mapper retains it.
- Current DOM structures, async population, SPA route changes, home unmount and mobile detail portal.
- Current aggregate accessibility disclosures and tested removal through owner-level CSS.
- Server-delivered report/subject summary records.
- Selector concealment on current placeholder surfaces, overview history traversal and responsive styling; safe native restoration when diagnostic CSS is removed.

## What is strongly supported

- Self ID is canonical for these result records and is the best production identity candidate.
- An existing static stylesheet avoids a classification-dependent first-paint race for the confirmed selectors.
- Period averages follow server projection fields.
- API records can be joined to the current DOM using unique metadata; this is less robust than an exposed canonical DOM identity and must fail closed on ambiguity.
- Targeted observers plus route events suffice for reconciliation once concealment exists.

## What remains unknown

- Exact `$type`, numeric fields, `formattedResultaat` syntax, and `isCijfer`/`isLabel` semantics for a real numeric result.
- Whether numeric results preserve exactly the same self-link model and cross-surface identity.
- Whether a current placeholder transitions to numeric under the same ID or a replacement ID.
- Actual teacher-publication timing, push behavior, reload/cached-state timing, and whether a new row or updated row appears first. Shipped code contains a `CIJFERS` push handler that refreshes recent data; no publication event was observed.
- Changed numeric values, retakes, revisions, deletion, withdrawal and re-publication; identity/version policy and which changes should trigger packs.
- Numeric result grouping, composite tests, alternate levels, remarks and imported results.
- Numeric-only classes/icons/templates and all accessibility strings those templates introduce.
- Effect of real numerical results on averages, contribution dependencies and update ordering.
- End-to-end performance of an actual MV3 shield, opening UI and persisted opened state. These features do not exist in this reconnaissance.
- Arbitrary message content and external/browser/native push notification spoilers.

## First numeric-grade validation procedure

Do not repeat the full reconnaissance. Use one focused sanitized run:

1. Preserve the existing baseline's eligible/nonnumeric classification, not just its IDs. A previously seen `*` becoming numeric must not be suppressed solely because its ID was already seen. Set an explicit policy for that transition and record version changes.
2. Capture the first numeric record from a normal page-generated GET, in memory. Check `$type`, exactly one self link, link type, individual-column type, formatted value, numeric fields if present, `isCijfer`, `isLabel`, subject and period metadata. Print schema/booleans only.
3. Compare identity with baseline and overview/subject projections. Report SAME/DIFFERENT only. Confirm this is a genuinely newly eligible numeric result rather than an old record newly entering the bounded feed.
4. Validate a strict whole-string locale parser on the actual format. Explicitly reject `*`, empty values, `-`, labels and unrecognized syntax; never use permissive `parseFloat` as eligibility. Do not infer the accepted syntax from this account's placeholders.
5. With the eventual extension's static CSS installed, perform hard reload, SPA entry from `/rooster`, history traversal and mobile detail. Inspect every confirmed surface and any newly created numeric-specific component, accessible name, tooltip, sufficiency color/icon and average. Use render/order instrumentation, not only watching for a flash.
6. Confirm the pending result has a sanitized `OPEN CIJFER` presentation and no native visible or accessible numerical disclosure. Ensure unresolved API/storage state stays concealed. Confirm all affected summaries remain concealed.
7. In the future extension, open the case once. Persist opened identity/version before revealing safe presentation. Reload and traverse routes to verify there is no second pack and no accidental exposure of other pending results.
8. Reconcile average versions and restore them only after all relevant contributions are safe. If native values are restored, test node reuse/live updates; otherwise retain native concealment and show extension-owned opened values.

Steps 1–4 are read-only SOMtoday validation. Steps 5–8 test a future extension and its local state; they cannot be executed now without building/installing it. Teacher publication, modification and deletion require separate later observed events; do not manufacture school records to test them.

## Recommended production adapter architecture

- A small allowlisted normal-response adapter, separate from presentation. MV3 `webRequest` is not a general response-body reader; choose an explicit response-observation mechanism in implementation rather than assuming this CDP reconnaissance capability exists inside the extension.
- Do not replay authenticated GETs merely to duplicate page traffic. Do not inspect/export headers, cookies, tokens or student/account objects. Project only needed result fields in memory.
- Separate progression/exam records, individual columns and aggregates. Keep canonical identity distinct from result-column/group identities and attempt versions.
- State machine: unseen/unresolved → observed nonnumeric or numeric eligible → baseline/opened or pending. Snapshot initial known eligible results as baseline; do not generate packs for first-install history. Retain placeholder observations so numeric transitions can be recognized.
- Persistence holds minimal identity/version/opened state, scoped to account context. Never put values or identifiers in logs or telemetry.
- Route-specific render adapters join by unique metadata and retain group/member relationships. Unsupported/ambiguous rows remain shielded.
- Reconcile bounded-feed coverage, caching, changed versions and aggregate snapshots. Do not infer deletion merely from absence in the recent range.

## Recommended Spoiler Shield architecture

```text
Origin-matching manifest CSS, active before DOM construction
  → Angular creates native result owners already concealed
  → document_start adapter observes normal responses and mounts
  → resolve identity, eligibility, baseline/opened state
  → pending: extension-owned OPEN CIJFER; native owner stays hidden
  → opened/baseline: extension-owned safe value presentation
  → release affected aggregates only after dependency/version reconciliation
```

Keep visual and accessibility shielding coupled at the owning surface. Fail closed on startup, unknown formats, storage delay, route transitions, node replacement and parser errors. Conceal result-bearing colors/icons alongside numbers. Portals require their own selector coverage because route-subtree selectors do not reach them.

For maximum confidence, leave native result owners hidden throughout and render classified content separately. If native reveal is required, it must have a validated revocation mechanism bound to the current identity/value version; a lingering opened class is insufficient. Document-start CSS, not a delayed observer, is the initial safety boundary.

## Remaining blockers

No current-placeholder blocker remains for establishing provisional identity, mapping the observed structured grade surfaces, and specifying a credible pre-paint architecture.

One tooling limitation remains for instrumentation: this browser capability rejects `Page.addScriptToEvaluateOnNewDocument`. A later tiny, local diagnostic extension with origin-matching static CSS and a `document_start` script recording only mount/style/order counters would verify the actual injection path. No credential access, network replay or school-state changes are needed. Such a diagnostic was not built because this task explicitly excludes building the extension.

Readiness below means **ready for the first numeric-grade validation**, not certified production safety or proven absence of grade text in arbitrary messages. All data-dependent conclusions above retain their evidence limits.

# FINAL DECISION

### `READY_FOR_FIRST_NUMERIC_GRADE`
