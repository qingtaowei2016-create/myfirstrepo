import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CaseStudySections from '@/components/CaseStudySections'
import EditModeProvider from '@/components/EditModeProvider'

interface CaseStudyPageProps {
  params: {
    slug: string
  }
}

// Helper function to decode slug and get case study data
function getCaseStudyData(slug: string) {
  // For now, return placeholder data based on slug
  // You can expand this to fetch from a database or CMS later
  const caseStudies: Record<string, { title: string; description: string; logo: string; logoColor: string; placeholderContent: Record<string, string> }> = {
    'redesigning-user-onboarding': {
      title: 'Redesigning the user onboarding experience',
      description: 'A comprehensive redesign of the user onboarding flow that reduced drop-off rates by 40% and increased user engagement. Through extensive user research and iterative prototyping, I created an intuitive experience that guides users through their first steps with clarity and confidence.',
      logo: 'P',
      logoColor: 'bg-indigo-600',
      placeholderContent: {
        overview: 'This is placeholder content for the overview section. Here you would describe the project context, goals, and key challenges that needed to be addressed.',
        research: 'This is placeholder content for the research section. Here you would detail your research methods, user interviews, surveys, and key insights that informed the design decisions.',
        design: 'This is placeholder content for the design process section. Here you would showcase your design iterations, wireframes, prototypes, and the evolution of your design thinking.',
        results: 'This is placeholder content for the results section. Here you would highlight the outcomes, metrics, and impact of your design work.'
      }
    },
    'building-accessible-design-system': {
      title: 'Building an accessible design system',
      description: 'Developed a comprehensive design system with accessibility at its core. The system includes reusable components, clear documentation, and WCAG 2.1 AA compliance guidelines. This foundation improved design consistency across products and reduced development time by 30%.',
      logo: 'DS',
      logoColor: 'bg-emerald-600',
      placeholderContent: {
        overview: 'This case study explores the creation of a comprehensive design system focused on accessibility and usability. The project involved establishing design tokens, component libraries, and documentation standards that would serve as the foundation for all future product development.',
        research: 'The research phase involved auditing existing components for accessibility issues, conducting user testing with assistive technologies, and analyzing WCAG 2.1 guidelines. Key findings revealed inconsistencies in color contrast, missing ARIA labels, and lack of keyboard navigation support across the product suite.',
        design: 'The design process included creating a component library with accessibility built-in from the start. Each component was designed with proper semantic HTML, ARIA attributes, and keyboard navigation. The system also included comprehensive documentation with accessibility guidelines and usage examples for designers and developers.',
        results: 'The implementation of the accessible design system resulted in improved consistency across products, reduced development time by 30%, and ensured all new features meet WCAG 2.1 AA standards. The system has been adopted across multiple product teams and has become the standard for all new development work.'
      }
    }
  }

  return caseStudies[slug] || {
    title: 'Case Study',
    description: 'This is a placeholder case study page.',
    logo: 'CS',
    logoColor: 'bg-blue-600',
    placeholderContent: {
      overview: 'This is placeholder content for the overview section.',
      research: 'This is placeholder content for the research section.',
      design: 'This is placeholder content for the design process section.',
      results: 'This is placeholder content for the results section.'
    }
  }
}

export default function CaseStudyPage({ params }: CaseStudyPageProps) {
  const slug = params?.slug || ''
  const caseStudy = getCaseStudyData(slug)

  return (
    <EditModeProvider slug={slug}>
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12 md:px-8 md:py-16">
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/">
                ← Back to home
              </Link>
            </Button>
          </div>

          {/* Case Study Header */}
          <Card className="rounded-3xl shadow-sm mb-8">
            <CardHeader>
              <div className="flex items-start gap-4 mb-4">
                <div className={`${caseStudy.logoColor} w-16 h-16 rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">{caseStudy.logo}</span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-4xl mb-4">{caseStudy.title}</CardTitle>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {caseStudy.description}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Dynamic Content Sections */}
          <CaseStudySections slug={slug} />
        </div>
      </main>
    </EditModeProvider>
  )
}
