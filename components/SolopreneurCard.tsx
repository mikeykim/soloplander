'use client'

import Image from 'next/image'
import styles from './SolopreneurCard.module.css'
import type { ISolopreneur } from '@/types'
import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'

interface Props {
  solopreneur: ISolopreneur
  isFirst?: boolean
}

export default function SolopreneurCard({ solopreneur, isFirst }: Props) {
  const [activePreview, setActivePreview] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 콘솔 오류 메시지 무시
    const originalError = console.error;
    console.error = (...args) => {
      if (
        args[0]?.includes('Backpack') ||
        args[0]?.includes('TrustedScript')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    if (activePreview === 'twitter' && (window as any).twttr) {
      (window as any).twttr.widgets.load()
    }
  }, [activePreview])

  useEffect(() => {
    if (activePreview && cardRef.current) {
      const card = cardRef.current
      const cardRect = card.getBoundingClientRect()
      const imageWrapper = card.querySelector(`.${styles.imageWrapper}`)
      const preview = document.querySelector(`.${styles.preview}`) as HTMLElement
      
      if (preview && imageWrapper) {
        if (isFirst) {
          // 이미지 영역의 정중앙 위치 계산
          const imageRect = imageWrapper.getBoundingClientRect()
          const imageX = imageRect.left + (imageRect.width / 2)
          const imageY = imageRect.top + (imageRect.height / 2)
          
          preview.style.position = 'fixed'
          preview.style.left = `${imageX}px`
          preview.style.top = `${imageY}px`
        } else {
          const centerX = cardRect.left + (cardRect.width / 2)
          const centerY = cardRect.top + (cardRect.height / 2)
          
          preview.style.position = 'fixed'
          preview.style.left = `${centerX}px`
          preview.style.top = `${centerY}px`
        }
      }
    }

    const handleScroll = () => {
      if (activePreview && cardRef.current) {
        const card = cardRef.current
        const preview = document.querySelector(`.${styles.preview}`) as HTMLElement
        
        if (preview) {
          if (isFirst) {
            const imageWrapper = card.querySelector(`.${styles.imageWrapper}`)
            if (imageWrapper) {
              const imageRect = imageWrapper.getBoundingClientRect()
              const imageX = imageRect.left + (imageRect.width / 2)
              const imageY = imageRect.top + (imageRect.height / 2)
            
              preview.style.left = `${imageX}px`
              preview.style.top = `${imageY}px`
            }
          } else {
            const cardRect = card.getBoundingClientRect()
            const centerX = cardRect.left + (cardRect.width / 2)
            const centerY = cardRect.top + (cardRect.height / 2)
            
            preview.style.left = `${centerX}px`
            preview.style.top = `${centerY}px`
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [activePreview, isFirst])

  const renderPreview = () => {
    if (!activePreview) return null;

    switch (activePreview) {
      case 'youtube':
        if (!solopreneur.links.previews?.youtube) return null;
        return (
          <div className={styles.youtubePreview}>
            <Image
              src={solopreneur.links.previews.youtube}
              alt={`${solopreneur.name}'s YouTube Channel`}
              width={480}
              height={270}
              className={styles.previewImage}
            />
          </div>
        );

      case 'twitter':
        if (!solopreneur.links.previews?.twitter) return null;
        return (
          <div className={styles.twitterPreview}>
            <Image
              src={solopreneur.links.previews.twitter}
              alt={`${solopreneur.name}'s Twitter Profile`}
              width={480}
              height={240}
              className={styles.previewImage}
            />
          </div>
        );

      case 'website':
        return (
          <div className={styles.previewContent}>
            <iframe
              className={styles.previewIframe}
              src={`/api/preview?url=${encodeURIComponent(solopreneur.links.website)}`}
              width="400"
              height="300"
              style={{ border: 'none', borderRadius: '8px' }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // iframe 로드 실패시 대체 UI 표시
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = styles.websitePreview;
                fallback.innerHTML = `
                  <h3>${solopreneur.name}'s Website</h3>
                  <p class="${styles.websiteUrl}">${solopreneur.links.website}</p>
                  <a 
                    href="${solopreneur.links.website}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="${styles.previewButton}"
                  >
                    Visit Website
                  </a>
                `;
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getLinksText = (links: ISolopreneur['links']) => {
    const platforms = [];
    if (links.youtube) platforms.push('YouTube');
    if (links.twitter) platforms.push('X');
    if (links.website) platforms.push('website');

    const pronoun = solopreneur.gender === 'female' ? 'her' : 'his';
    
    // 플랫폼이 3개 이상일 때 처리
    if (platforms.length >= 3) {
      const firstParts = platforms.slice(0, -1);
      const lastPart = platforms[platforms.length - 1];
      return `Please check ${pronoun} ${firstParts.join(' , ')} and ${lastPart}`;
    }
    
    // 플랫폼이 1-2개일 때 처리
    return `Please check ${pronoun} ${platforms.join(' and ')}`;
  };

  const renderLinks = () => {
    const availableLinks = []
    if (solopreneur.links.youtube) availableLinks.push('YouTube')
    if (solopreneur.links.twitter) availableLinks.push('X')
    if (solopreneur.links.website) availableLinks.push('website')

    const pronoun = solopreneur.gender === 'female' ? 'her' : 'his'

    const formatText = (links: string[]) => {
      if (links.length === 1) return `Please check ${pronoun} ${links[0]}.`
      if (links.length === 2) return `Please check ${pronoun} ${links[0]} and ${links[1]}.`
      return `Please check ${pronoun} ${links.slice(0, -1).join(' , ')} and ${links[links.length - 1]}.`
    }

    return (
      <div className={styles.links}>
        <p className={styles.linkText}>
          {formatText(availableLinks).split(' ').map((word, index) => {
            if (word.includes('YouTube')) {
              return (
                <a 
                  key={index}
                  href={solopreneur.links.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                  onMouseEnter={() => setActivePreview('youtube')}
                  onMouseLeave={() => setActivePreview(null)}
                >
                  YouTube
                </a>
              )
            }
            if (word.includes('X')) {
              return (
                <a 
                  key={index}
                  href={solopreneur.links.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                  onMouseEnter={() => setActivePreview('twitter')}
                  onMouseLeave={() => setActivePreview(null)}
                >
                  X
                </a>
              )
            }
            if (word.includes('website')) {
              return (
                <a 
                  key={index}
                  href={solopreneur.links.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                  onMouseEnter={() => setActivePreview('website')}
                  onMouseLeave={() => setActivePreview(null)}
                >
                  website
                </a>
              )
            }
            return <span key={index}> {word} </span>
          })}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.card} ref={cardRef}>
        <div className={styles.imageWrapper}>
          <Image 
            src={solopreneur.image}
            alt={solopreneur.name}
            width={300}
            height={400}
            className={styles.image}
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.content}>
          <h2>{solopreneur.name}</h2>
          <p>{solopreneur.description}</p>
          {renderLinks()}
        </div>
      </div>
      <div 
        className={styles.previewWrapper}
        style={{ 
          display: activePreview ? 'block' : 'none',
          position: 'absolute',
          left: '50%',
          bottom: '100%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}
      >
        <div 
          className={styles.preview}
          data-visible={Boolean(activePreview)}
        >
          {renderPreview()}
        </div>
      </div>
    </div>
  )
} 