import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">About me</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {items.map((item, index) => (
            <div key={index}>
              <p className="text-base py-4">
                {item}
              </p>
              {index < items.length - 1 && (
                <Separator />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Variant 2: "badges"
  if (variant === 'badges') {
    return (
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">About me</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {items.map((item, index) => (
              <span
                key={index}
                className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-base hover:bg-secondary/80 transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Variant 3: "minimal"
  return (
    <Card className={cn("rounded-3xl shadow-sm bg-muted")}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">About me</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-base flex items-start">
              <span className="mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
