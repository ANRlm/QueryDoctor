import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
}

export function Card({ children, className = '', glow = false, hover = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } : undefined}
      className={`
        bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl
        ${glow ? 'shadow-lg shadow-blue-500/10' : ''}
        ${hover ? 'cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        hover:border-white/20 transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
