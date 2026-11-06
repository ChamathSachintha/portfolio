import { PagePlaceholder } from './PagePlaceholder'

export default function JournalEntryPage() {
  return (
    <PagePlaceholder
      eyebrow="Journal entry"
      title="Session placeholder"
      description="A published session will later include its description, reflection, and optional facilitator or gallery details."
      action={{ label: 'Back to journal', to: '/university-journal' }}
    />
  )
}
