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
  const baseStyles = 'font-medium rounded transition-colors inline-flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-white text-black hover:bg-[#e5e5e5]',
    secondary: 'bg-[#111] text-white hover:bg-[#222] border border-[#333]',
    outline: 'border border-[#444] text-white hover:bg-[#111]',
    ghost: 'text-[#888] hover:text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }

  return (
    <motion.button
      whileTap={{ opacity: 0.8 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  )
}
