# Table-service and zero-DDP capture report

Captured: 2026-08-03

## Method

Disney finder exposes separate `2026 Table-Service Meal` and `2026 Quick-Service Meal` facets. The SPA applies both client-side to the saved WDW-wide dining payload; no second filtered API response is emitted. Round 6A saved per-park full and combined-facet snapshots from payload `002-*`, then verified candidate detail pages and fetched each menu through the menu SPA JSON endpoint in headed Chrome.

Candidate rule: full park list minus union of both 2026 meal facets minus existing `locations.json` ids. Existing ids are excluded to satisfy no-collision requirement; missing-menu and Disney-designated seasonal/event candidates remain explicitly listed below.

## Per-park classification

| Park | Full | DDP accepted | Facet difference | Existing ids excluded | Zero-DDP candidates | Captured | Skipped |
|---|---:|---:|---:|---:|---:|---:|---:|
| Magic Kingdom | 38 | 21 | 17 | 5 | 12 | 4 | 8 |
| EPCOT | 67 | 34 | 33 | 5 | 28 | 18 | 10 |
| Hollywood Studios | 31 | 17 | 14 | 4 | 10 | 9 | 1 |
| Animal Kingdom | 28 | 11 | 17 | 6 | 11 | 11 | 0 |

## Magic Kingdom

Facet method: full finder payload minus union of `2026-table-service-meal` and `2026-quick-service-meal`; detail pages checked in headed Chrome.

Zero-DDP candidates (12): Magic Kingdom Fireworks Dessert Parties: Seats & Sweets, Minnie's Wonderful Christmastime Fireworks Dessert Party with Plaza Garden Viewing, Minnie's Wonderful Christmastime Fireworks Dessert Party at Tomorrowland Terrace, Magic Kingdom Fireworks Dessert Parties: Pre-Party, Disney's Not-So-Spooky Spectacular Dessert Party at Tomorrowland Terrace, Magic Kingdom Fireworks Dessert Parties: Post-Party, Disney's Not-So-Spooky Spectacular Dessert Party with Plaza Garden Viewing, The Beak and Barrel, Astrofizz, Prince Eric's Village Market, Tomorrowland Terrace Restaurant, Auntie Gravity's Galactic Goodies.

Captured (4): Astrofizz, Auntie Gravity's Galactic Goodies, Prince Eric's Village Market, The Beak and Barrel.

| Venue id | Name | Items | Coordinates source |
|---|---|---:|---|
| `astrofizz` | Astrofizz | 15 | WDW payload `002-*` |
| `auntie-gravitys-galactic-goodies` | Auntie Gravity's Galactic Goodies | 15 | WDW payload `002-*` |
| `prince-eric-village-market` | Prince Eric's Village Market | 8 | WDW payload `002-*` |
| `beak-barrel` | The Beak and Barrel | 25 | WDW payload `002-*` |

Skipped:
- `fireworks-dessert-party-seats` — Magic Kingdom Fireworks Dessert Parties: Seats & Sweets: Dessert-party experience has no standalone Disney menu link.
- `mickeys-very-merry-christmas-party-plaza-view` — Minnie's Wonderful Christmastime Fireworks Dessert Party with Plaza Garden Viewing: Seasonal Christmas event; Disney page says check back September 2026; no menu link.
- `fireworks-holiday-dessert-party` — Minnie's Wonderful Christmastime Fireworks Dessert Party at Tomorrowland Terrace: Seasonal Christmas event; Disney page says check back September 2026; no menu link.
- `fireworks-dessert-pre-party` — Magic Kingdom Fireworks Dessert Parties: Pre-Party: Dessert-party experience has no standalone Disney menu link.
- `disneys-not-so-spooky-spectacular-fireworks-dessert-party-tomorrowland-terrace` — Disney's Not-So-Spooky Spectacular Dessert Party at Tomorrowland Terrace: Seasonal Halloween event starts August 7, 2026; no standalone menu link.
- `fireworks-dessert-after-party` — Magic Kingdom Fireworks Dessert Parties: Post-Party: Dessert-party experience has no standalone Disney menu link.
- `disneys-not-so-spooky-spectacular-dessert-party-plaza-garden` — Disney's Not-So-Spooky Spectacular Dessert Party with Plaza Garden Viewing: Seasonal Halloween event starts August 7, 2026; no standalone menu link.
- `tomorrowland-terrace-restaurant` — Tomorrowland Terrace Restaurant: Disney page says venue is only open for dessert parties; no standalone menu link.

## EPCOT

Facet method: full finder payload minus union of `2026-table-service-meal` and `2026-quick-service-meal`; detail pages checked in headed Chrome.

Zero-DDP candidates (28): EPCOT International Festival of the Arts - DISNEY ON BROADWAY Concert Series Dining Packages, Rose & Crown Fireworks Dining Package, Shiki-Sai: Sushi Izakaya Fireworks Dining Package, GEO-82 Fireworks Experience, EPCOT International Food & Wine Festival Concert Series Dining Packages, Parisian Breakfast at Chefs de France, La Cava Experience, EPCOT International Festival of the Holidays presented by AdventHealth – Candlelight Processional Dining Package, Spice Road Table Fireworks Dining Package, La Cava del Tequila, Gelateria Toscana, Grab-N-Goof, Block & Hans, Takumi-Tei, Refreshment Station, Space 220 Lounge, Spice Road Table Bar, Les Vins des Chefs de France, Tutto Gusto Wine Cellar, Space 220 Restaurant, Canada Popcorn Cart, GEO-82, Choza de Margarita, Rose & Crown Pub, UK Beer Cart, Monsieur Paul, Oasis Sweets & Sips, The Odyssey.

Captured (18): Block & Hans, Canada Popcorn Cart, Choza de Margarita, GEO-82, Gelateria Toscana, La Cava del Tequila, Les Vins des Chefs de France, Monsieur Paul, Oasis Sweets & Sips, Refreshment Station, Rose & Crown Pub, Space 220 Lounge, Space 220 Restaurant, Spice Road Table Bar, Takumi-Tei, The Odyssey, Tutto Gusto Wine Cellar, UK Beer Cart.

| Venue id | Name | Items | Coordinates source |
|---|---|---:|---|
| `block-hans` | Block & Hans | 8 | WDW payload `002-*` |
| `popcorn-at-canada-pavilion` | Canada Popcorn Cart | 9 | WDW payload `002-*` |
| `choza-de-margarita` | Choza de Margarita | 21 | WDW payload `002-*` |
| `geo-82-lounge` | GEO-82 | 52 | WDW payload `002-*` |
| `gelateria-toscana` | Gelateria Toscana | 40 | WDW payload `002-*` |
| `cava-del-tequila` | La Cava del Tequila | 8 | WDW payload `002-*` |
| `les-vins-des-chefs-de-france` | Les Vins des Chefs de France | 15 | WDW payload `002-*` |
| `monsieur-paul` | Monsieur Paul | 13 | WDW payload `002-*` |
| `oasis-sweets-sips` | Oasis Sweets & Sips | 17 | WDW payload `002-*` |
| `test-track-cool-wash` | Refreshment Station | 4 | WDW payload `002-*` |
| `rose-and-crown-pub` | Rose & Crown Pub | 46 | WDW payload `002-*` |
| `space-220-lounge` | Space 220 Lounge | 45 | WDW payload `002-*` |
| `space-220` | Space 220 Restaurant | 103 | WDW payload `002-*` |
| `spice-road-table-bar` | Spice Road Table Bar | 25 | WDW payload `002-*` |
| `takumi-tei-restaurant` | Takumi-Tei | 87 | WDW payload `002-*` |
| `odyssey` | The Odyssey | 7 | WDW payload `002-*` |
| `tutto-gusto-wine-cellar` | Tutto Gusto Wine Cellar | 53 | WDW payload `002-*` |
| `uk-beer-cart` | UK Beer Cart | 4 | WDW payload `002-*` |

Skipped:
- `broadway-concert-series-dining-package` — EPCOT International Festival of the Arts - DISNEY ON BROADWAY Concert Series Dining Packages: Seasonal dining package; Disney page says 2026 festival concluded; no venue menu link.
- `rose-and-crown-fireworks-dinner-package` — Rose & Crown Fireworks Dining Package: Dining package has no standalone Disney menu link; host restaurant menu is separate.
- `shiki-sai-fireworks-dinner-package` — Shiki-Sai: Sushi Izakaya Fireworks Dining Package: Future dining package; Disney page says booking starts August 27, 2026; no menu link.
- `geo-82-fireworks-experience` — GEO-82 Fireworks Experience: Fireworks experience has no standalone Disney menu link.
- `food-wine-concert-series-dining-package` — EPCOT International Food & Wine Festival Concert Series Dining Packages: Seasonal Food & Wine package runs August 27 through November 21, 2026; no standalone menu link.
- `chefs-de-france-parisian-breakfast` — Parisian Breakfast at Chefs de France: Limited seasonal event starts August 28, 2026; no standalone menu link.
- `cava-experience` — La Cava Experience: Tasting experience has no standalone Disney menu link.
- `candlelight-dinner-packages` — EPCOT International Festival of the Holidays presented by AdventHealth – Candlelight Processional Dining Package: Seasonal holiday package runs November 27 through December 30, 2026; no standalone menu link.
- `spice-road-table-fireworks-dinner-package` — Spice Road Table Fireworks Dining Package: Dining package has no standalone Disney menu link; host restaurant menu is separate.
- `festival-favorites` — Grab-N-Goof: Seasonal EPCOT festival kiosk; skipped per Disney festival designation.

## Hollywood Studios

Facet method: full finder payload minus union of `2026-table-service-meal` and `2026-quick-service-meal`; detail pages checked in headed Chrome.

Zero-DDP candidates (10): Jazzy Holidays at The Hollywood Brown Derby, Oga's Cantina, Sunshine Day Bar, Tune-In Lounge, Ice Cold Hydraulics, Neighborhood Bakery, BaseLine Tap House, FØØD by Swedish Chef, Market, Epic Eats.

Captured (9): BaseLine Tap House, Epic Eats, FØØD by Swedish Chef, Ice Cold Hydraulics, Market, Neighborhood Bakery, Oga's Cantina, Sunshine Day Bar, Tune-In Lounge.

| Venue id | Name | Items | Coordinates source |
|---|---|---:|---|
| `baseline-tap-house` | BaseLine Tap House | 49 | WDW payload `002-*` |
| `epic-eats` | Epic Eats | 13 | WDW payload `002-*` |
| `food-by-swedish-chef` | FØØD by Swedish Chef | 17 | WDW payload `002-*` |
| `ice-cold-hydraulics` | Ice Cold Hydraulics | 26 | WDW payload `002-*` |
| `market` | Market | 17 | WDW payload `002-*` |
| `neighborhood-bakery` | Neighborhood Bakery | 8 | WDW payload `002-*` |
| `ogas-cantina` | Oga's Cantina | 32 | WDW payload `002-*` |
| `sunshine-day-bar` | Sunshine Day Bar | 7 | WDW payload `002-*` |
| `tune-in-lounge` | Tune-In Lounge | 40 | WDW payload `002-*` |

Skipped:
- `brown-derby-jazzy-holidays` — Jazzy Holidays at The Hollywood Brown Derby: Seasonal Jollywood Nights event runs select nights November 7, 2026 through January 5, 2027; no menu link.

## Animal Kingdom

Facet method: full finder payload minus union of `2026-table-service-meal` and `2026-quick-service-meal`; detail pages checked in headed Chrome.

Zero-DDP candidates (11): The Smiling Crocodile, Thirsty River Bar, Dawa Bar, Isle of Java, Trek Snacks, Terra Treats, Warung Outpost, Caravan Road, Drinkwallah, Mahindi, Yak & Yeti™ Quality Beverages.

Captured (11): Caravan Road, Dawa Bar, Drinkwallah, Isle of Java, Mahindi, Terra Treats, The Smiling Crocodile, Thirsty River Bar, Trek Snacks, Warung Outpost, Yak & Yeti™ Quality Beverages.

| Venue id | Name | Items | Coordinates source |
|---|---|---:|---|
| `caravan-road` | Caravan Road | 12 | WDW payload `002-*` |
| `dawa-bar` | Dawa Bar | 17 | WDW payload `002-*` |
| `drinkwallah` | Drinkwallah | 11 | WDW payload `002-*` |
| `isle-of-java` | Isle of Java | 21 | WDW payload `002-*` |
| `mahindi` | Mahindi | 12 | WDW payload `002-*` |
| `terra-treats` | Terra Treats | 13 | WDW payload `002-*` |
| `smiling-crocodile` | The Smiling Crocodile | 8 | WDW payload `002-*` |
| `thirsty-river-bar` | Thirsty River Bar | 18 | WDW payload `002-*` |
| `trek-snacks` | Trek Snacks | 22 | WDW payload `002-*` |
| `warung-outpost` | Warung Outpost | 7 | WDW payload `002-*` |
| `quality-beverages` | Yak & Yeti™ Quality Beverages | 23 | WDW payload `002-*` |

Skipped:
- None.

## Hollywood Studios missing table-service set

Captured (4): 50's Prime Time Café, Hollywood & Vine, Sci-Fi Dine-In Theater Restaurant, The Hollywood Brown Derby.

| Venue id | Name | Items | DDP annotation | Coordinates source |
|---|---|---:|---|---|
| `50s-prime-time-cafe` | 50's Prime Time Café | 80 | listed; no 2-credit annotation | WDW payload `002-*` |
| `hollywood-and-vine` | Hollywood & Vine | 76 | listed; no 2-credit annotation | WDW payload `002-*` |
| `sci-fi-dine-in-theater` | Sci-Fi Dine-In Theater Restaurant | 66 | listed; no 2-credit annotation | WDW payload `002-*` |
| `hollywood-brown-derby` | The Hollywood Brown Derby | 64 | 2 Table-Service credits | WDW payload `002-*` |

Skipped:
- `mama-melroses-ristorante-italiano` — Disney page returned 404 and venue is absent from current WDW dining payload; treated as closed/removed.

Hollywood & Vine note: Disney publishes buffet selections without individual prices for many dishes. Those items remain in capture with `price: null`; no price was invented.

## Coordinate verification

All 46 captured venues use exact `marker.lat`/`marker.lng` values from `002-disneyworld-disney-go-com-finder-api-v1-explorer-service-list-ancestor-entities-wdw-800077-6019ba8a04.json`. No fresh coordinate browser capture was needed.

## Acceptance status

1. FAIL — capture JSON valid; 4/5 requested HS TS venues captured. Four open venues each exceed 15 items; Mama Melrose skipped because Disney returns 404 and omits it from current payload.
2. PASS — all 61 zero-DDP candidates are captured (42) or explicitly skipped (19).
3. PASS — all 46 captured venues have payload-exact coordinates.
4. PASS — zero captured ids collide with 77 existing `locations.json` ids.
5. PASS — report lists every per-park zero-DDP candidate by name.

## Deviations

- Disney finder uses two 2026 meal facets, not one generic “Disney Dining Plan accepted” facet. Combined union used.
- Filtered result is client-side SPA state; Disney emits no filtered API response. Saved derived per-park SPA-state snapshots reference untouched WDW raw payload `002-*`.
- Mama Melrose could not be captured without inventing data: official page returned 404 and facility is absent from current Disney payload.
- Menu items without an individual Disney price retain `price: null` (buffet/prix-fixe inclusions and selections). Raw menu JSON preserves package pricing and descriptions.

<!-- round6b-classification:start -->
## Round 6B classification

| Park | Venue id | Venue | `ddp_class` | Rationale |
|---|---|---|---|---|
| ak | `caravan-road` | Caravan Road | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `dawa-bar` | Dawa Bar | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| ak | `drinkwallah` | Drinkwallah | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `isle-of-java` | Isle of Java | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `mahindi` | Mahindi | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `terra-treats` | Terra Treats | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `smiling-crocodile` | The Smiling Crocodile | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `thirsty-river-bar` | Thirsty River Bar | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| ak | `trek-snacks` | Trek Snacks | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ak | `warung-outpost` | Warung Outpost | `no-ddp` | Disney classifies menu experience as Bar/Lounge. |
| ak | `quality-beverages` | Yak & Yeti™ Quality Beverages | `no-ddp` | Disney classifies menu experience as Bar/Lounge; alcohol-dominant menu. |
| ep | `block-hans` | Block & Hans | `no-ddp` | Disney classifies menu experience as Bar/Lounge. |
| ep | `popcorn-at-canada-pavilion` | Canada Popcorn Cart | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ep | `choza-de-margarita` | Choza de Margarita | `no-ddp` | Disney classifies menu experience as Bar/Lounge. |
| ep | `geo-82-lounge` | GEO-82 | `no-ddp` | Lounge concept with alcohol-dominant menu. |
| ep | `gelateria-toscana` | Gelateria Toscana | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ep | `cava-del-tequila` | La Cava del Tequila | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| ep | `les-vins-des-chefs-de-france` | Les Vins des Chefs de France | `no-ddp` | Disney classifies menu experience as Bar/Lounge. |
| ep | `monsieur-paul` | Monsieur Paul | `no-ddp` | Scott-designated facet-excluded signature. |
| ep | `oasis-sweets-sips` | Oasis Sweets & Sips | `no-ddp` | Disney classifies menu experience as Bar/Lounge. |
| ep | `test-track-cool-wash` | Refreshment Station | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ep | `rose-and-crown-pub` | Rose & Crown Pub | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| ep | `space-220-lounge` | Space 220 Lounge | `no-ddp` | Lounge concept with alcohol-dominant menu. |
| ep | `space-220` | Space 220 Restaurant | `no-ddp` | Scott-designated facet-excluded signature. |
| ep | `spice-road-table-bar` | Spice Road Table Bar | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| ep | `takumi-tei-restaurant` | Takumi-Tei | `no-ddp` | Scott-designated facet-excluded signature. |
| ep | `odyssey` | The Odyssey | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| ep | `tutto-gusto-wine-cellar` | Tutto Gusto Wine Cellar | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| ep | `uk-beer-cart` | UK Beer Cart | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| hs | `50s-prime-time-cafe` | 50's Prime Time Café | `ts` | Requested Hollywood Studios table-service restaurant. |
| hs | `baseline-tap-house` | BaseLine Tap House | `no-ddp` | Disney classifies menu experience as Bar/Lounge. |
| hs | `epic-eats` | Epic Eats | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| hs | `food-by-swedish-chef` | FØØD by Swedish Chef | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| hs | `hollywood-and-vine` | Hollywood & Vine | `ts` | Requested Hollywood Studios table-service restaurant. |
| hs | `ice-cold-hydraulics` | Ice Cold Hydraulics | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| hs | `market` | Market | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| hs | `neighborhood-bakery` | Neighborhood Bakery | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| hs | `ogas-cantina` | Oga's Cantina | `no-ddp` | Cantina naming and alcohol-dominant menu. |
| hs | `sci-fi-dine-in-theater` | Sci-Fi Dine-In Theater Restaurant | `ts` | Requested Hollywood Studios table-service restaurant. |
| hs | `sunshine-day-bar` | Sunshine Day Bar | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| hs | `hollywood-brown-derby` | The Hollywood Brown Derby | `ts` | Requested Hollywood Studios table-service restaurant. |
| hs | `tune-in-lounge` | Tune-In Lounge | `no-ddp` | Bar/lounge/pub/cantina/cellar naming or alcohol-dominant menu. |
| mk | `astrofizz` | Astrofizz | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| mk | `auntie-gravitys-galactic-goodies` | Auntie Gravity's Galactic Goodies | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| mk | `prince-eric-village-market` | Prince Eric's Village Market | `snack-unconfirmed` | Snack, cart, kiosk, market, or stand menu without confirmed Disney kiosk badge. |
| mk | `beak-barrel` | The Beak and Barrel | `no-ddp` | Scott-designated facet-excluded signature. |

### Round 6B TS dump skips

- `sebastians-bistro` — Caribbean Beach Resort has no app map tab.
- `topolinos-terrace` — Riviera Resort has no app map tab.

Mama Melrose remains skipped from Round 6A: official page returned 404 and current WDW payload omitted venue.
<!-- round6b-classification:end -->
