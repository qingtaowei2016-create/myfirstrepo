export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-8 py-4">
        <ul className="flex justify-end items-center gap-12">
          <li>
            <a href="#home" className="text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors text-sm font-normal">
              Home
            </a>
          </li>
          <li>
            <a href="#work" className="text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors text-sm font-normal">
              Work
            </a>
          </li>
          <li>
            <a href="#about" className="text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors text-sm font-normal">
              About
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
