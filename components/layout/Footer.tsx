import Link from 'next/link'
import Image from 'next/image'
import { FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="SolopLander"
            width={180}
            height={45}
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
            href="mailto:mkingg04@gmail.com"
            className={styles.socialLink}
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