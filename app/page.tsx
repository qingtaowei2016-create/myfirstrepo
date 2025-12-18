import ProfileCard from '@/components/ProfileCard'
import CaseStudyCard from '@/components/CaseStudyCard'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-8 md:py-16">
        {/* Combined Profile and About Card */}
        <div className="mb-6 md:mb-8">
          <ProfileCard />
        </div>

        {/* Case Studies - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <CaseStudyCard
            variant="wide"
            title="Redesigning the user onboarding experience"
            description="A comprehensive redesign of the user onboarding flow that reduced drop-off rates by 40% and increased user engagement. Through extensive user research and iterative prototyping, I created an intuitive experience that guides users through their first steps with clarity and confidence."
            logo="P"
            logoColor="bg-indigo-600"
            href="#"
          />
          <CaseStudyCard
            variant="structured"
            title="Building an accessible design system"
            description="Developed a comprehensive design system with accessibility at its core. The system includes reusable components, clear documentation, and WCAG 2.1 AA compliance guidelines. This foundation improved design consistency across products and reduced development time by 30%."
            logo="DS"
            logoColor="bg-emerald-600"
            href="#"
          />
        </div>
      </div>
    </main>
  )
}
