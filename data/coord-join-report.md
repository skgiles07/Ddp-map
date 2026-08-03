# Disney coordinate join report — Hollywood Studios

Captured: 2026-08-03T01:34:12.785Z

Scope: 16 venues with `area: "hs"` only. Matched: 15. Unmatched: 1.

Sanity check: every included coordinate is within 1100 m of area center [28.3575, -81.5583]. 15/15 pass.

## Venue join

| Venue id | Disney name | Match | Old lat/lng | Official lat/lng | Delta | Status |
|---|---|---|---:|---:|---:|---|
| `abc-commissary` | ABC Commissary | slug | 28.3561366, -81.5598601 | 28.356062, -81.559872 | 8.4 m | matched; center 221.9 m |
| `anaheim-produce` | Anaheim Produce | slug | 28.35787, -81.55981 | 28.358448, -81.560086 | 69.7 m | matched; center 204.1 m |
| `backlot-express` | Backlot Express | slug | 28.35566, -81.55969 | 28.35589, -81.558388 | 129.9 m | matched; center 179.2 m |
| `catalina-eddies` | Catalina Eddie's | slug | 28.35768, -81.55966 | 28.358915, -81.560278 | 150.1 m | matched; center 249.4 m |
| `docking-bay-7-food-and-cargo` | Docking Bay 7 Food and Cargo | slug | 28.3540894, -81.5615367 | 28.354088, -81.561643 | 10.4 m | matched; center 501.0 m |
| `dockside-diner` | Dockside Diner | slug | 28.35664, -81.55856 | 28.3570985, -81.559552 | 109.6 m | matched; center 130.4 m |
| `fairfax-fare` | Fairfax Fare | slug | 28.3576, -81.55958 | 28.3590392579, -81.5600222899 | 165.8 m | matched; center 240.2 m |
| `hollywood-scoops` | Hollywood Scoops | slug | 28.35771, -81.55969 | 28.359139, -81.560084 | 163.5 m | matched; center 252.4 m |
| `kat-sakas-kettle` | Kat Saka's Kettle | slug | 28.35482, -81.56123 | 28.35432, -81.561467 | 60.2 m | matched; center 470.2 m |
| `milk-stand` | Milk Stand | slug | 28.35434, -81.56104 | 28.354311, -81.562296 | 122.9 m | matched; center 527.9 m |
| `ronto-roasters` | Ronto Roasters | slug | 28.3543672, -81.5615777 | 28.354341, -81.561652 | 7.8 m | matched; center 480.6 m |
| `rosies-all-american-cafe` | Rosie's All-American Café | slug | 28.35779, -81.55974 | 28.358821, -81.560268 | 125.7 m | matched; center 242.2 m |
| `trolley-car-cafe` | The Trolley Car Café | slug | 28.3581, -81.55841 | 28.357767, -81.559604 | 122.6 m | matched; center 131.0 m |
| `woodys-lunchbox` | Woody's Lunch Box | slug | 28.3557055, -81.5622064 | 28.355747, -81.562185 | 5.1 m | matched; center 427.2 m |
| `pizzerizzo` | — | — | 28.35636, -81.55934 | — | — | unmatched: No confident slug or normalized-name match in captured Disney dining payload. |
| `roundup-rodeo-lunch` | Roundup Rodeo BBQ | normalized name | 28.3559, -81.56289 | 28.356832, -81.56201 | 134.7 m | matched; center 370.6 m |

## Disney map tiles

Template: `https://cdn6.parksmedia.wdprapps.disney.com/media/maps/prod/900014458/{z}/{x}/{y}.jpg`

Observed zoom range: 12–17 (levels: 12, 13, 15, 17).

| Probe | Status | Content-Type | Bytes | Fetchable |
|---|---:|---|---:|---|
| [tile 1](https://cdn6.parksmedia.wdprapps.disney.com/media/maps/prod/900014458/12/1119/1710.jpg) | 200 | image/jpeg | 37853 | yes |
| [tile 2](https://cdn6.parksmedia.wdprapps.disney.com/media/maps/prod/900014458/12/1120/1710.jpg) | 200 | image/jpeg | 26544 | yes |
| [tile 3](https://cdn6.parksmedia.wdprapps.disney.com/media/maps/prod/900014458/12/1119/1711.jpg) | 200 | image/jpeg | 35359 | yes |

Verdict: FETCHABLE — all 3 plain-HTTP probes returned 200 with image bytes.

Probe method: Node `fetch`, generic `Mozilla/5.0` User-Agent, no cookies; response bytes inspected but not archived.

## Acceptance tests

1. PASS — `data/disney_coords.json` valid JSON; 15/16 HS ids matched; required fields present.
2. PASS — 15/15 matched coordinates within 1100 m HS radius.
3. PASS — all 16/16 HS venues listed with match details or unmatched reason.
4. PASS — tile template, observed zooms, and 3 plain-HTTP probes recorded.
5. PASS — `index.json` provides `by_url` and `by_file` mappings for every saved raw response.
6. PASS — `tools/capture_map_coords.mjs` accepts documented park argument; later parks need no code edit.

## Deviations

- Disney `/maps/hollywood-studios/` returned “Someone Ate the Page!” (404 surface); working `/maps/`, HS destination, and HS dining surfaces supplied tiles and facility payloads.
- HS dining endpoint returned one raw 410-record WDW-wide response despite HS page/filter. Raw response remains unaltered for provenance; join/output remain HS-only. Filtering raw payload would violate raw-capture requirement.
