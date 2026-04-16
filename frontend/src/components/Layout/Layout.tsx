import { ReactNode } from 'react'
import { Navigation } from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <Navigation />
      <main>{children}</main>
      <footer className="border-t border-[#222] py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center text-[#666] text-xs">
          <p>QueryDoctor © 2024</p>
        </div>
      </footer>
    </div>
  )
}
