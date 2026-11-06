import type { ReactNode } from 'react'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

type PageLayoutProps = {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-page text-text">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
