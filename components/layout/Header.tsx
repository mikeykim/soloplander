'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBars, FaTimes } from 'react-icons/fa'
import styles from './header.module.css'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // 화면 크기가 변경될 때 메뉴 상태 관리
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])
  
  // 페이지 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])
  
  // 네비게이션 링크가 현재 경로와 일치하는지 확인
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/">
          <img 
            src="/images/logo.png" 
            alt="SolopLander Logo" 
            style={{ height: '28px', width: 'auto' }}
            className={styles.logo}
          />
        </Link>
        
        <button 
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/blog" 
            className={`${styles.navLink} ${isActive('/blog') ? styles.active : ''}`}
          >
            Blog
          </Link>
          <Link 
            href="/about" 
            className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
} 