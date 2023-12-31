import type { Metadata } from 'next'
import { Roboto_Mono } from 'next/font/google'
import '../style/style.css'

const inter = Roboto_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Chat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
