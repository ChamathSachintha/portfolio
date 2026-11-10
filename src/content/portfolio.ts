export type TechnologyIconName =
  | 'nextjs'
  | 'typescript'
  | 'laravel'
  | 'postgresql'
  | 'php'
  | 'mysql'
  | 'html'
  | 'css'
  | 'javascript'

export type FeaturedProject = {
  title: string
  category: string
  description: string
  technologies: string
  techIcons: TechnologyIconName[]
  status?: string
  to?: string
  externalUrl?: string
  preview: 'workflow' | 'counselling' | 'pixeltech'
}

export const portfolioContent = {
  hero: {
    greeting: "Hey There I'm",
    name: 'Chamath',
    headline: 'Software Developer & Creative Designer',
    secondaryTitle: 'Computer Science Undergraduate',
    affiliation: 'Co-founder & Creative Director — Merae Global (Pvt) Ltd',
    socialLinks: {
      linkedin: {
        href: 'https://www.linkedin.com/in/chamath-sachintha',
        label: 'Chamath Sachintha on LinkedIn',
        image: '/images/social/linkedin.png',
      },
      github: {
        href: 'https://github.com/ChamathSachintha',
        label: 'Chamath Sachintha on GitHub',
        image: '/images/social/Github.png',
      },
    },
    skillRows: [
      'UI/UX DESIGNER   PHOTOGRAPHER   CINEMATOGRAPHER',
      'CREATIVE DIRECTOR   STORY TELLER   SOFTWARE DEVELOPER',
    ],
  },
  introduction:
    "I'm Chamath Sachintha, a Computer Science undergraduate passionate about software development and creative design. As Co-founder and Creative Director at Merae Global (Pvt) Ltd, I work across digital solutions, UI/UX, graphic design and marketing. I enjoy combining technology and creativity to build meaningful digital experiences.",
  about: {
    intro:
      "I'm a Computer Science undergraduate who enjoys turning ideas into useful digital experiences. My work sits between software development, UI/UX design, photography and creative direction.",
    beyondScreen:
      'Beyond the screen, I enjoy experimenting with new ideas, creating visual stories and learning across disciplines. That mix of curiosity and craft shapes how I approach both technical and creative work.',
    toolkit: {
      development: [
        'React',
        'Next.js',
        'TypeScript',
        'JavaScript',
        'Laravel',
        'PHP',
        'Java',
        'PostgreSQL',
        'Supabase',
        'Tailwind CSS',
      ],
      creative: [
        'Figma',
        'UI/UX Design',
        'Photography',
        'Graphic Design',
        'Digital Content Creation',
        'Motion Design',
      ],
      collaboration: ['Git & GitHub', 'Team Leadership', 'Problem Solving'],
    },
  },
  contact: {
    heading: 'Get in Touch',
    description:
      "Interested in collaborating on a software project, discussing a creative idea, or exploring new opportunities? I'd love to connect.",
    email: 'chamath@merae.lk',
  },
  footer: {
    name: 'Chamath Sachintha',
    lines: ['Building with code.', 'Creating through design.'],
  },
} as const
