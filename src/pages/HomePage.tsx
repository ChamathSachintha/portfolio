import { PagePlaceholder } from './PagePlaceholder'

export default function HomePage() {
  return (
    <PagePlaceholder
      eyebrow="Foundation"
      title="Portfolio home"
      description="The complete home experience will be implemented in the next approved design phase."
      action={{ label: 'View projects', to: '/projects' }}
    />
  )
}
