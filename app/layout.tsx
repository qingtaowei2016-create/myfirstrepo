import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Hi, I'm Qingtao - UX Designer crafting intuitive experiences through thoughtful design",
  description: 'UX Portfolio Website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
