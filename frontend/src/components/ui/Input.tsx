import { forwardRef } from 'react'
import { motion } from 'framer-motion'

interface InputProps {
  label?: string
  error?: string
  className?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  type?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', placeholder, value, onChange, name, type = 'text' }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-zinc-900/80 border border-white/10
            text-white placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          type={type}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextAreaProps {
  label?: string
  error?: string
  className?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  name?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', placeholder, value, onChange, rows = 4, name }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <motion.textarea
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-zinc-900/80 border border-white/10
            text-white placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            resize-none
            font-mono text-sm
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          name={name}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
