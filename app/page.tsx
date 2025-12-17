import ProfileCard from '@/components/ProfileCard'
import CaseStudyCard from '@/components/CaseStudyCard'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-8 md:py-16">
        {/* Combined Profile and About Card */}
        <div className="mb-6 md:mb-8">
          <ProfileCard />
        </div>

        {/* Case Study - Single Wide Card */}
        <div>
          <CaseStudyCard
            variant="wide"
            title="Redesigning the user onboarding experience"
            description="A comprehensive redesign of the user onboarding flow that reduced drop-off rates by 40% and increased user engagement. Through extensive user research and iterative prototyping, I created an intuitive experience that guides users through their first steps with clarity and confidence."
            logo="P"
            logoColor="bg-indigo-600"
            href="#"
          />
        </div>
      </div>
    </main>
  )
}
