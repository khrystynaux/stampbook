// Exact city / activity data extracted from the original Stampbook.dc.html design file.
export const CITIES = [
  {
    id: 'seoul',
    name: 'Seoul',
    short: 'SEOUL',
    country: 'South Korea',
    emblem: '❀',   // ❀
    tagline: 'Palace guards, hanok lanes and midnight street-food markets.',
    ink: '#a83357',
    accent: '#ffb7c5',
    accentSoft: '#ffe5ec',
    tint: '#fff2f6',
    activities: [
      { id: 'gyeongbok', name: 'Gyeongbokgung Palace',  label: 'Palace', emblem: '⌂', level: 'tourist', blurb: 'Catch the royal guard-changing ceremony at the main gate.' },
      { id: 'bukchon',   name: 'Bukchon Hanok Village', label: 'Hanok',  emblem: '❖', level: 'tourist', blurb: 'Wander tiled-roof alleys frozen a few centuries back.' },
      { id: 'nseoul',    name: 'N Seoul Tower',          label: 'Tower',  emblem: '✦', level: 'tourist', blurb: 'Lock a wish onto the rail above the whole skyline.' },
      { id: 'myeongdong',name: 'Myeongdong Street Food', label: 'Market', emblem: '✺', level: 'tourist', blurb: 'Tornado potatoes and egg bread as the lights flick on.' },
      { id: 'gwangjang', name: 'Gwangjang Market',       label: 'Eats',   emblem: '◆', level: 'local',   blurb: 'Bindae-tteok and mayak gimbap, elbow-to-elbow with ajummas.' },
      { id: 'ihwa',      name: 'Ihwa Mural Village',     label: 'Murals', emblem: '✿', level: 'local',   blurb: 'A hillside the residents repainted into an open-air gallery.' },
      { id: 'seongsu',   name: 'Seongsu Cafe Hop',       label: 'Cafe',   emblem: '✦', level: 'local',   blurb: 'The “Brooklyn of Seoul” — old factories turned roasteries.' },
      { id: 'seonyudo',  name: 'Seonyudo Island Park',   label: 'Park',   emblem: '❀', level: 'local',   blurb: 'A water-plant garden built inside an old treatment plant.' },
    ],
  },
  {
    id: 'prague',
    name: 'Prague',
    short: 'PRAHA',
    country: 'Czechia',
    emblem: '◆',   // ◆
    tagline: 'Baroque bridges, a parade of apostles and riverside beer.',
    ink: '#5b4a9c',
    accent: '#cdb6ec',
    accentSoft: '#ece2f7',
    tint: '#f6f3fc',
    activities: [
      { id: 'charles',  name: 'Charles Bridge at Dawn',  label: 'Bridge', emblem: '❖', level: 'tourist', blurb: 'Beat the crowds to the baroque statues in soft light.' },
      { id: 'castle',   name: 'Prague Castle',            label: 'Castle', emblem: '⌂', level: 'tourist', blurb: 'The largest ancient castle complex anywhere on earth.' },
      { id: 'astro',    name: 'Astronomical Clock',       label: 'Clock',  emblem: '☼', level: 'tourist', blurb: 'Watch the Apostles parade by on the stroke of the hour.' },
      { id: 'oldtown',  name: 'Old Town Square',          label: 'Square', emblem: '✦', level: 'tourist', blurb: 'Gothic spires over a fan of pastel facades.' },
      { id: 'naplavka', name: 'Náplavka Riverside',  label: 'River',  emblem: '◆', level: 'local',   blurb: 'Sunday farmers market right on the embankment.' },
      { id: 'vysehrad', name: 'Vyšehrad Sunset',     label: 'Fort',   emblem: '☼', level: 'local',   blurb: 'The locals’ picnic fort high above the Vltava.' },
      { id: 'letna',    name: 'Letná Beer Garden',   label: 'Garden', emblem: '✦', level: 'local',   blurb: 'Cheap pints and a giant panorama of the city.' },
      { id: 'zizkov',   name: 'Žižkov Tower Babies', label: 'Tower', emblem: '❖', level: 'local', blurb: 'Faceless bronze babies crawling up a brutalist tower.' },
    ],
  },
  {
    id: 'la',
    name: 'Los Angeles',
    short: 'LA',
    country: 'California, USA',
    emblem: '☼',   // ☼
    tagline: 'Observatory views, boardwalk chaos and golden-hour tacos.',
    ink: '#c2602a',
    accent: '#ffc46b',
    accentSoft: '#ffe8c6',
    tint: '#fff6ea',
    activities: [
      { id: 'griffith', name: 'Griffith Observatory',    label: 'Dome',   emblem: '☼', level: 'tourist', blurb: 'City lights below, the cosmos overhead, after dark.' },
      { id: 'pier',     name: 'Santa Monica Pier',        label: 'Pier',   emblem: '✺', level: 'tourist', blurb: 'A Ferris wheel where Route 66 finally hits the sea.' },
      { id: 'walk',     name: 'Hollywood Walk of Fame',   label: 'Stars',  emblem: '✦', level: 'tourist', blurb: 'Hunt down your favorite name set into the sidewalk.' },
      { id: 'venice',   name: 'Venice Boardwalk',         label: 'Beach',  emblem: '◆', level: 'tourist', blurb: 'Skaters, Muscle Beach and a mile of murals.' },
      { id: 'gcm',      name: 'Grand Central Market',     label: 'Tacos',  emblem: '✺', level: 'local',   blurb: 'The taco-and-egg-sandwich pilgrimage downtown.' },
      { id: 'sunken',   name: 'Sunken City',               label: 'Ruins',  emblem: '◆', level: 'local',   blurb: 'Cliffside ruins of a collapsed neighborhood, tagged in art.' },
      { id: 'smorg',    name: 'Smorgasburg LA',            label: 'Food',   emblem: '☼', level: 'local',   blurb: 'A Sunday open-air bazaar of a hundred food stalls.' },
      { id: 'wisdom',   name: 'Wisdom Tree Hike',          label: 'Trail',  emblem: '❀', level: 'local',   blurb: 'A lone tree, big views and a trail-top journal box.' },
    ],
  },
]

export function getCityById(id) {
  return CITIES.find(c => c.id === id)
}
