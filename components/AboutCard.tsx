interface AboutCardProps {
  variant?: 'default' | 'badges' | 'minimal'
}

export default function AboutCard({ variant = 'default' }: AboutCardProps) {
  const items = [
    'Focused on accessibility and inclusive design',
    'Love exploring new design tools and methodologies',
    'Believe in data-driven design decisions',
  ]

  // Variant 1: "default" (Current Layout)
  if (variant === 'default') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm dark:shadow-gray-900/50">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About me</h2>
        <div className="space-y-0">
          {items.map((item, index) => (
            <div key={index}>
              <p className="text-base text-gray-900 dark:text-gray-300 py-4">
                {item}
              </p>
              {index < items.length - 1 && (
                <hr className="border-gray-200 dark:border-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Variant 2: "badges"
  if (variant === 'badges') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm dark:shadow-gray-900/50">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About me</h2>
        <div className="flex flex-wrap gap-3">
          {items.map((item, index) => (
            <span
              key={index}
              className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-base text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Variant 3: "minimal"
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-gray-900/50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About me</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-base text-gray-900 dark:text-gray-300 flex items-start">
            <span className="mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
