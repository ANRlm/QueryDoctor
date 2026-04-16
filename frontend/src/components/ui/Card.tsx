import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-[#0a0a0a] border border-[#222] rounded
        ${hover ? 'hover:border-[#444] transition-colors cursor-pointer' : ''}
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
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-[#0a0a0a] border border-[#222] rounded-xl
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
