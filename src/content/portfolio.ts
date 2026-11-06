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
        href: 'https://www.linkedin.com/in/chamath-sachintha/',
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
  featuredProjects: [
    {
      title: 'Workflow — HR Management System',
      category: 'Full-Stack Development / Team Lead',
      description:
        'Leading a development team building a web-based Human Resource Management System.',
      technologies: 'Next.js · TypeScript · Laravel · PostgreSQL',
      techIcons: ['nextjs', 'typescript', 'laravel', 'postgresql'],
      status: 'In Development',
      preview: 'workflow',
    },
    {
      title: 'Online Student Counselling System',
      category: 'Academic Web Application',
      description:
        'Database-driven application for student registration, counselling appointments, messaging and feedback.',
      technologies: 'PHP · MySQL · HTML · CSS · JavaScript',
      techIcons: ['php', 'mysql', 'html', 'css', 'javascript'],
      preview: 'counselling',
    },
    {
      title: 'Pixeltech — Computer Shop Website & Content Portal',
      category: 'E-Commerce / Content Portal',
      description:
        'A local computer shop e-commerce platform with product catalog, authentication, admin management, shopping cart and content features.',
      technologies: 'HTML · PHP · CSS',
      techIcons: ['html', 'php', 'css'],
      externalUrl: 'https://github.com/ChamathSachintha/Pixeltech',
      preview: 'pixeltech',
    },
  ] satisfies FeaturedProject[],
  contact: {
    heading: 'Get in Touch',
    description:
      "Interested in collaborating on a software project, discussing a creative idea, or exploring new opportunities? I'd love to connect.",
  },
  footer: {
    name: 'Chamath Sachintha',
    lines: ['Building with code.', 'Creating through design.'],
  },
} as const
