import clsx from 'clsx'

export default function Card({ children, hover = true, gradient = false, className, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-200 shadow-lg p-6 bg-white transition duration-300',
        hover && 'hover:-translate-y-0.5 hover:shadow-xl',
        gradient && 'bg-gradient-to-br from-white via-primary/5 to-primary/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
