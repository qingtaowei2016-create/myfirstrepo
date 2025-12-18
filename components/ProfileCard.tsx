import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ProfileCard() {
  const aboutItems = [
    'Focused on accessibility and inclusive design',
    'Love exploring new design tools and methodologies',
    'Believe in data-driven design decisions',
  ]

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Section: Profile */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Hello World</h1>
                <p className="text-sm text-muted-foreground">Product Designer</p>
              </div>
            </div>
            <p className="text-lg font-bold mb-4">
              Crafting experiences that connect people and technology.
            </p>
            <p className="text-base leading-relaxed">
              I specialize in transforming complex problems into elegant, user-centered solutions.
            </p>
          </div>

          {/* Right Section: About */}
          <div className="flex-1 md:border-l md:border-border md:pl-8">
            <h2 className="text-3xl font-bold mb-6">About me</h2>
            <div className="space-y-0">
              {aboutItems.map((item, index) => (
                <div key={index}>
                  <p className="text-base py-4">
                    {item}
                  </p>
                  {index < aboutItems.length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
