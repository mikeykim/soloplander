'use client'

import { useState } from 'react'
import styles from './NewsletterSignup.module.css'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // TODO: 실제 API 엔드포인트로 교체
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) throw new Error('Failed to subscribe')
      
      setStatus('success')
      setEmail('')
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h2>Stay Updated</h2>
        <p>
          We're preparing to share even more inspiring stories from passionate solopreneurs around the world. 
          Want to be the first to meet these amazing creators? Join our waiting list below and become part of 
          this growing community of dreamers and doers!
        </p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className={styles.input}
          />
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className={styles.button}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {status === 'success' && (
          <p className={styles.success}>Thanks for subscribing!</p>
        )}
        {status === 'error' && (
          <p className={styles.error}>Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  )
} 