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
      <main className="mx-auto w-full max-w-[min(86vw,1240px)] px-0 py-10 sm:py-12 lg:py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
