interface CaseStudyCardProps {
  title: string
  description: string
  tag: string
}

export default function CaseStudyCard({ title, description, tag }: CaseStudyCardProps) {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
      <h3 className="text-2xl font-semibold mb-3 text-gray-900 tracking-tight">
        {title}
      </h3>
      <p className="text-base text-gray-600 leading-relaxed mb-4">
        {description}
      </p>
      <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-sm font-medium">
        {tag}
      </span>
    </div>
  )
}
