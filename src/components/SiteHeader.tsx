import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
  { label: 'Journal', to: '/university-journal' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 lg:px-10">
        <NavLink
          to="/"
          className="font-display text-xl font-black uppercase tracking-tight text-text"
          aria-label="Portfolio home"
        >
          Portfolio<span className="text-accent">.</span>
        </NavLink>
        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm text-muted">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                      isActive ? 'font-bold text-accent' : ''
                    }`
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
