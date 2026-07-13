import { useEffect, useState, type ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  pageKey: string
}

function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [pageKey])

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  )
}

export default PageTransition
