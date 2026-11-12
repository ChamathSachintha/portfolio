export type TurtleActivity = {
  title: string
  description: string
  images: string[]
}

export type TurtleLocation = {
  venueName: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  projectDate: string | null
  websiteUrl: string | null
  googleMapsUrl: string | null
}

export const turtleConservationContent = {
  title: 'Turtle Conservation',
  subtitle:
    'Our final Professional Skills group project took us outside the classroom to learn about turtle care, beach conservation, and working together.',
  projectType: 'Final Community Project',
  module: 'Professional Skills',
  teamSize: 10,
  // Replace null with the group/team name when confirmed.
  teamName: 'Ocean Guardians' as string | null,
  heroImage: '/images/university-journal/turtle-conservation/hero-team-beach.webp',
  // Venue and official site are confirmed from https://seaturtlessrilanka.org/.
  // Map coordinates are the approximate centre decoded from the venue's
  // published plus code, RVG7+GCR (Dehiwala–Mount Lavinia).
  // The user's Google Maps URL is retained as the direct external map link.
  // The visit date is still unknown. Do not confuse it with business opening hours.
  location: {
    venueName: 'Sea Turtles Sri Lanka Conservation Center',
    address: 'RVG7+GCR, Dehiwala–Mount Lavinia, Sri Lanka',
    latitude: 6.8263625,
    longitude: 79.863515625,
    projectDate: '2026-10-07',
    websiteUrl: 'https://seaturtlessrilanka.org/',
    googleMapsUrl: 'https://maps.app.goo.gl/pBw5zmQsdTJ3mgyQ7',
  } satisfies TurtleLocation,
  overview: [
    'For our final Professional Skills group project, the ten of us took part in a turtle conservation visit. It was a chance to get away from our usual classroom activities and experience something completely different.',
    'We helped clean turtle tanks, wash and feed turtles, take part in medication-related care activities, and clean the beach area. Each activity showed us a different part of the work involved in looking after turtles.',
    'Most of my university projects involve computers and assignments. This time, we were doing practical work together, which made the experience stand out.',
  ],
  purpose: [
    'We wanted to do something useful while learning more about the problems sea turtles face. Plastic pollution, damaged nesting areas, and fishing activities can all affect their survival.',
    'Before this project, I knew about turtle conservation mainly as an environmental issue. Seeing the care and cleaning involved gave me a better idea of the effort that goes into it.',
    'The beach cleanup also reminded me that small actions, like being careful about where rubbish ends up, are connected to protecting marine life.',
  ],
  sustainabilityGoal: {
    number: 14,
    title: 'Life Below Water',
    officialUrl: 'https://sdgs.un.org/goals/goal14',
    paragraphs: [
      'We chose to carry out this project in line with the United Nations Sustainable Development Goal 14, Life Below Water. The goal is about looking after our oceans and the animals that live in them.',
      'Our beach cleanup connected directly with reducing marine pollution (Target 14.1), while helping with turtle care gave us a practical way to learn about protecting marine and coastal ecosystems (Target 14.2).',
      'Before the visit, SDG 14 was something I mainly knew about from learning materials. Taking part in these activities made it feel more real and showed me that even a small group can do something useful.',
    ],
  },
  activities: [
    {
      title: 'Cleaning Turtle Tanks',
      description:
        'We helped clean the tanks where the turtles were kept. It was hands-on work, and it made me appreciate how much regular cleaning is involved in caring for them.',
      images: ['tank-cleaning-01.webp', 'tank-cleaning-02.webp'],
    },
    {
      title: 'Washing Turtles',
      description:
        'We also had the chance to help wash the turtles. Getting involved instead of just watching made this one of the more memorable parts of the visit.',
      images: [
        'turtle-washing-01.webp',
        'turtle-washing-02.webp',
        'turtle-washing-03.webp',
        'turtle-washing-04.webp',
      ],
    },
    {
      title: 'Turtle Care',
      description:
        'Another activity involved medication-related care for the turtles. It was interesting to see that looking after them involves more than feeding and keeping their surroundings clean.',
      images: [
        'turtle-care-01.webp',
        'turtle-care-02.webp',
        'turtle-care-03.webp',
        'turtle-care-04.webp',
      ],
    },
    {
      title: 'Feeding Turtles',
      description:
        'We helped feed the turtles as part of the visit. It might sound like a simple activity, but seeing the animals up close and taking part in their daily care was a new experience for me.',
      images: [
        'turtle-feeding-01.webp',
        'turtle-feeding-02.webp',
        'turtle-feeding-03.webp',
        'turtle-feeding-04.webp',
      ],
    },
    {
      title: 'Beach Cleanup',
      description:
        'We also spent time cleaning the beach area. Picking up waste ourselves made the problem of coastal pollution feel much more real than just reading about it.',
      images: ['beach-cleanup-01.webp', 'beach-cleanup-02.webp'],
    },
  ] satisfies TurtleActivity[],
  teamIntroduction:
    'There were ten of us in the group, and we worked together throughout the visit. Unlike our usual software assignments, there were no separate modules to build. We had practical tasks to finish and helped one another along the way.',
  teamMembers: [
    'N K B D O M Karunathilaka',
    'M N Perera',
    'K R V Pathirana',
    'D M L C B Dissanayake',
    'M G V Nimthara',
    'P P A W Gimhani',
    'C S G Liyanage',
    'R M Hewage',
    'A M M C Abesinghe',
    'I P P D Induwara',
  ],
  teamImage: '/images/university-journal/turtle-conservation/team-group.webp',
  certificatesImage:
    '/images/university-journal/turtle-conservation/team-certificates.webp',
  galleryIntroduction:
    'A few moments from the visit, from working around the tanks and caring for the turtles to the beach cleanup and our time together as a group.',
  gallery: [
    'hero-team-beach.webp',
    'team-group.webp',
    'team-certificates.webp',
    'tank-cleaning-01.webp',
    'turtle-washing-01.webp',
    'turtle-care-01.webp',
    'turtle-feeding-01.webp',
    'beach-cleanup-01.webp',
  ],
  expenses: [
    'We shared the project expenses among the group. The report records LKR 15,000 for entrance fees (LKR 1,500 each for ten members) and LKR 200 for gloves (LKR 20 each).',
    'The total recorded expense was LKR 15,200.',
  ],
  reflection: [
    'This project was quite different from the group work I usually do. Most of the time, I am working on code, interfaces, or solving technical problems. Here, we were doing practical work together instead.',
    'I enjoyed the chance to try something new with the group. Cleaning the tanks, helping with turtle care, and taking part in the beach cleanup made me think more about the work behind conservation.',
    'It also reminded me that the communication and teamwork skills we learn at university matter outside the classroom too. This is one of those experiences I will remember because we got to do something different together.',
  ],
} as const
