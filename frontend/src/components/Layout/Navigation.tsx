import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '#home', label: '首页' },
  { href: '#features', label: '功能' },
  { href: '#diagnose', label: '诊断' },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-[#222]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <a href="#home" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
              <span className="text-black font-mono text-xs font-bold">Q</span>
            </div>
            <span className="text-white font-medium text-sm">QueryDoctor</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#888] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#diagnose"
              className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e5e5] transition-colors"
            >
              开始使用
            </a>
          </div>

          <button
            className="md:hidden p-1 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-[#222]">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-[#888] hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#diagnose"
              className="block py-2 text-sm text-white font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              开始使用
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
