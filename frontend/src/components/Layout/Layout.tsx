import { ReactNode } from 'react'
import { Navigation } from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>{children}</main>
      <footer className="border-t border-[#222] py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-[#666] text-xs">
          <p>QueryDoctor © 2024</p>
        </div>
      </footer>
    </div>
  )
}
