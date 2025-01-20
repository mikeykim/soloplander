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
            width={240}
            height={60}
            priority
          />
        </Link>
      </div>
    </nav>
  )
} 