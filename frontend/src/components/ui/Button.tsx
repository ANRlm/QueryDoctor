import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'relative font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 overflow-hidden'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/20',
    outline: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  )
}
