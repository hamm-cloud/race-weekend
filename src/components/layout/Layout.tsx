import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {children}
    </main>
  )
}
