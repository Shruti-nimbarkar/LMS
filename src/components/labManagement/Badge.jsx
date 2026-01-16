import clsx from 'clsx'

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-600 border-red-200',
    info: 'bg-primary/10 text-primary border-primary/20',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  return (
    <span className={clsx(
      'inline-flex items-center font-semibold rounded-full border',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </span>
  )
}
