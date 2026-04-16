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
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>QueryDoctor © 2024 - AI 数据库慢查询诊断 Agent</p>
        </div>
      </footer>
    </div>
  )
}
