// Main menu. Items with more than 3 children open as a picture menu; fewer open as a plain list.
// Wording and structure follow the client's current live menu (incursions by audience, classes, events).
export type NavItem = { title: string; href: string; note?: string; img?: string; children?: NavItem[] };

export const NAV: NavItem[] = [
  {
    title: 'Incursions',
    href: '/school-incursions/',
    children: [
      { title: 'School incursions', href: '/school-incursions/', note: 'Drumming, song and dance for Prep–12', img: '/media/nav/school.webp' },
      { title: 'Kindergartens', href: '/early-learning-and-kindergarten-incursions/', note: 'Playful rhythm, songs and movement games', img: '/media/nav/kindy.webp' },
      { title: 'Vacation care', href: '/vacation-care/', note: 'Loads of musical fun and movement', img: '/media/nav/vacation.webp' },
      { title: 'Team building', href: '/team-building/', note: 'Drumming for staff days and events', img: '/media/nav/corporate.webp' },
    ],
  },
  {
    title: 'Classes & camps',
    href: '/classes/',
    children: [
      { title: 'Drumming classes', href: '/african-drumming-classes/', note: 'Open djembe classes for all levels', img: '/media/nav/drum.webp' },
      { title: 'Afro Dance Fitness', href: '/dance-classes/', note: 'Cardio and choreography to live drumming', img: '/media/nav/dance.webp' },
      { title: 'Camp Afro Foli', href: '/camp-afro-foli-drum-dance-retreat/', note: 'Three days every winter', img: '/media/nav/camp.webp' },
      { title: 'School drum sets', href: '/shop/', note: 'Djembes and dunduns for schools', img: '/media/nav/sets.webp' },
    ],
  },
  { title: 'Team building', href: '/team-building/' },
  { title: 'About', href: '/about/' },
  { title: 'Contact', href: '/contact-us-2/' },
];
