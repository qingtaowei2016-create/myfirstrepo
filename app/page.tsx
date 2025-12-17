import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import CaseStudyCard from '@/components/CaseStudyCard'

const caseStudies = [
  {
    title: 'Project Alpha',
    description: 'Redesigning the user onboarding experience to increase engagement and reduce drop-off rates by 40%.',
    tag: 'UX Research',
  },
  {
    title: 'Project Beta',
    description: 'Creating a mobile-first design system that improved consistency across platforms and accelerated development.',
    tag: 'Design System',
  },
  {
    title: 'Project Gamma',
    description: 'Streamlining complex workflows through information architecture and interaction design improvements.',
    tag: 'Interaction Design',
  },
  {
    title: 'Project Delta',
    description: 'Building an accessible interface that meets WCAG 2.1 AA standards while maintaining visual appeal.',
    tag: 'Accessibility',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Nav />
      <Hero />
      <section id="work" className="max-w-6xl mx-auto px-8 py-24">
        <h2 className="text-3xl font-semibold mb-12 text-gray-900 tracking-tight">
          Case Studies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <CaseStudyCard
              key={index}
              title={study.title}
              description={study.description}
              tag={study.tag}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
