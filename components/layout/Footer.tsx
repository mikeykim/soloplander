'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import styles from './Footer.module.css'

export default function Footer() {
  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const mailtoLink = "mailto:mkingg04@gmail.com?subject=Contact from SolopLander&body=Hi, I'd like to share my story with SolopLander."
    window.open(mailtoLink, '_blank')
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/logo.png"
            alt="SolopLander Logo"
            width={110}
            height={28}
            className={styles.logo}
          />
        </Link>
        <div className={styles.socialLinks}>
          <a 
            href="https://www.linkedin.com/in/mikey0450/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <FaLinkedin size={24} />
          </a>
          <a 
            href="mailto:mkingg04@gmail.com?subject=Contact from SolopLander&body=Hi, I'd like to share my story with SolopLander."
            className={styles.socialLink}
            onClick={handleEmailClick}
          >
            <MdEmail size={24} />
          </a>
          <span className={styles.copyright}>
            Copyright © 2025 SolopLander
          </span>
        </div>
      </div>
    </footer>
  )
} 