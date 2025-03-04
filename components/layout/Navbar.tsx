'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="SolopLander"
            width={180}
            height={45}
            priority
          />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </div>
    </nav>
  )
} 