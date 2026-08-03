const DISNEY_TILES = 'https://cdn6.parksmedia.wdprapps.disney.com/media/maps/prod/900014458/{z}/{x}/{y}.jpg';
const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export function tileConfig(disneyFetchable) {
  const osm = {
    url: OSM_TILES,
    options: { maxZoom: 19, attribution: '© OpenStreetMap contributors' },
  };
  const disney = {
    url: DISNEY_TILES,
    options: {
      minNativeZoom: 12,
      maxNativeZoom: 17,
      maxZoom: 19,
      attribution: 'Map © Disney',
    },
  };
  return disneyFetchable ? { primary: disney, fallback: osm } : { primary: osm, fallback: osm };
}

export function pinHtml(location) {
  const credits = location?.accepted_credits || [];
  const kind = ['quick', 'snack', 'kids', 'table'].find(credit => credits.includes(credit)) || 'default';
  const glyph = { quick: 'Q', snack: 'S', kids: 'K', table: 'T', default: '•' }[kind];
  const valueClass = location?.tier === 1 ? ' pin-best' : location?.tier === 3 ? ' pin-dim' : '';
  const valueBadge = location?.tier === 1
    ? '<span class="pin-value" aria-hidden="true">🔥</span>'
    : location?.tier === 3 ? '<span class="pin-value pin-cash">cash</span>' : '';
  return `<span class="disney-pin pin-${kind}${valueClass}" aria-hidden="true"><span class="pin-glyph">${glyph}</span><span class="pin-tail"></span>${valueBadge}</span>`;
}
