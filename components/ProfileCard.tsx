export default function ProfileCard() {
  const aboutItems = [
    'Focused on accessibility and inclusive design',
    'Love exploring new design tools and methodologies',
    'Believe in data-driven design decisions',
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm dark:shadow-gray-900/50">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section: Profile */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Qingtao</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">UX Designer</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Crafting experiences that connect people and technology 🎨
          </p>
          <p className="text-base text-gray-900 dark:text-gray-300 leading-relaxed">
            I specialize in transforming complex problems into elegant, user-centered solutions. 
            Through research-driven design and iterative prototyping, I create digital experiences 
            that are both beautiful and functional.
          </p>
        </div>

        {/* Right Section: About */}
        <div className="flex-1 md:border-l md:border-gray-200 dark:md:border-gray-700 md:pl-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About me</h2>
          <div className="space-y-0">
            {aboutItems.map((item, index) => (
              <div key={index}>
                <p className="text-base text-gray-900 dark:text-gray-300 py-4">
                  {item}
                </p>
                {index < aboutItems.length - 1 && (
                  <hr className="border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
