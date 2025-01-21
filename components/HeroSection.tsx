'use client'

import styles from './HeroSection.module.css'
import Image from 'next/image'

export default function HeroSection() {
  const handleContact = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const mailtoLink = "mailto:mkingg04@gmail.com?subject=Contact from SolopLander&body=Hi, I'd like to share my story with SolopLander."
    
    if (isMobile) {
      window.location.href = mailtoLink
    }
  }

  return (
    <section className={styles.hero}>
      <div className={styles.wrapper}>
        <div className={styles.split}>
          <h1>
            <span className={`${styles.highlight} ${styles.secondary}`}>Empower</span>
            <span className={`${styles.highlight} ${styles.primary}`}>Solopreneurs</span>
            <span className={`${styles.highlight} ${styles.secondary}`}>Worldwide</span>
          </h1>
          <p>
            Are you a passionate creator building your own path? Join our community 
            of inspiring solopreneurs who share their growth and make a difference. 
            Reach out below to add your story to this collection.
          </p>
          <a 
            href="mailto:mkingg04@gmail.com?subject=Contact from SolopLander&body=Hi, I'd like to share my story with SolopLander."
            className={styles.button}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleContact}
          >
            Contact
          </a>
        </div>
        <div className={styles.split}>
          <Image 
            src="/images/growth.png"
            alt="Growth"
            width={500}
            height={375}
            priority
          />
        </div>
      </div>
    </section>
  )
} 