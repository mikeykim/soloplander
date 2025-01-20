import styles from './HeroSection.module.css'
import Image from 'next/image'

export default function HeroSection() {
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
            Are you a passionate creator building your own path? I'd love to showcase your journey! This community 
            celebrates solopreneurs who share their growth, inspire others, and make a difference. 
            Reach out through the contact button below, and let's add your story to this inspiring collection.
          </p>
          <a 
            href="mailto:mkingg04@gmail.com?subject=Contact from SolopLander"
            className={styles.button}
            target="_blank"
            rel="noopener noreferrer"
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