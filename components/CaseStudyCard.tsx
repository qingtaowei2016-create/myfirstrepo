import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CaseStudyCardProps {
  variant?: 'image' | 'text' | 'wide' | 'structured'
  title: string
  description: string
  imageUrl?: string
  logo?: string
  logoColor?: string
  href?: string
}

export default function CaseStudyCard({ 
  variant = 'text',
  title, 
  description,
  imageUrl,
  logo,
  logoColor = 'bg-blue-600',
  href = '#'
}: CaseStudyCardProps) {
  if (variant === 'image') {
    return (
      <Card className="rounded-3xl p-0 shadow-sm overflow-hidden relative h-full min-h-[400px]">
        {imageUrl ? (
          <div className="relative w-full h-full min-h-[400px]">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-yellow-100 via-green-100 to-pink-100 dark:from-yellow-900/30 dark:via-green-900/30 dark:to-pink-900/30 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-muted-foreground text-sm">Case Study Image</p>
            </div>
          </div>
        )}
      </Card>
    )
  }

  if (variant === 'wide') {
    return (
      <Card className="rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Image on left */}
        <div className="w-full md:w-2/5 min-h-[300px] md:min-h-[400px] relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">💼</div>
                <p className="text-muted-foreground text-sm">Case Study</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Text content on right */}
        <div className="w-full md:w-3/5 p-8 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6"
            asChild
          >
            <a 
              href={href}
              aria-label="View case study"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 12L12 4M12 4H6M12 4V10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </Button>
          
          {logo && (
            <div className={`${logoColor} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
              <span className="text-white text-xl font-bold">{logo}</span>
            </div>
          )}
          
          <h3 className="text-2xl font-bold mb-4 pr-10">
            {title}
          </h3>
          <p className="text-base leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    )
  }

  if (variant === 'structured') {
    return (
      <Card className="rounded-3xl shadow-sm relative h-full flex flex-col">
        <CardHeader className="relative">
          {logo && (
            <div className={`${logoColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-white text-xl font-bold">{logo}</span>
            </div>
          )}
          <CardTitle className="text-2xl pr-10">{title}</CardTitle>
          <CardDescription className="text-base leading-relaxed mt-2">
            {description}
          </CardDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6"
            asChild
          >
            <a 
              href={href}
              aria-label="View case study"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 12L12 4M12 4H6M12 4V10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          {/* Additional content can go here */}
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <a href={href}>View case study</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl p-8 shadow-sm relative h-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6"
        asChild
      >
        <a 
          href={href}
          aria-label="View case study"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M4 12L12 4M12 4H6M12 4V10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </Button>
      
      {logo && (
        <div className={`${logoColor} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
          <span className="text-white text-xl font-bold">{logo}</span>
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-4 pr-10">
        {title}
      </h3>
      <p className="text-base leading-relaxed">
        {description}
      </p>
    </Card>
  )
}
