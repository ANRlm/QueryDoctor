import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '#home', label: '首页' },
  { href: '#features', label: '功能' },
  { href: '#diagnose', label: '诊断' },
  { href: '#about', label: '关于' },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.a
            href="#home"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">QD</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">QueryDoctor</span>
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors"
                whileHover={{ y: -1 }}
              >
                {link.label}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500"
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
            <motion.a
              href="#diagnose"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              开始诊断
            </motion.a>
          </div>

          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#diagnose"
                className="block px-4 py-2 bg-blue-600 text-white text-center rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                开始诊断
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
