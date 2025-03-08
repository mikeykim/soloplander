'use client'

import Image from 'next/image'
import styles from './SolopreneurCard.module.css'
import type { ISolopreneur } from '@/types'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  solopreneur: ISolopreneur
  isFirst?: boolean
}

export default function SolopreneurCard({ solopreneur, isFirst }: Props) {
  const [activePreview, setActivePreview] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

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

  // 프리뷰 위치 조정 및 스크롤/리사이즈 이벤트 처리
  useEffect(() => {
    const updatePreviewPosition = () => {
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
    }

    updatePreviewPosition()

    window.addEventListener('scroll', updatePreviewPosition)
    window.addEventListener('resize', updatePreviewPosition)
    
    return () => {
      window.removeEventListener('scroll', updatePreviewPosition)
      window.removeEventListener('resize', updatePreviewPosition)
    }
  }, [activePreview, isFirst])

  useEffect(() => {
    if (!activePreview || !cardRef.current) return;

    // 마우스 움직임에 따라 미리보기 위치 업데이트
    const updatePreviewPosition = (e: MouseEvent) => {
      // 화면 크기 가져오기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 미리보기 카드 예상 크기
      const previewWidth = 400;
      const previewHeight = 300;
      
      // 마우스 커서 위치에 따라 왼쪽 또는 오른쪽에 배치
      // 기본적으로 마우스 커서의 오른쪽에 표시
      let x = e.clientX + 40; // 오른쪽으로 40px 떨어진 곳에 위치
      let y = e.clientY - previewHeight / 2; // 마우스 커서 높이의 중앙에 맞춤
      
      // 화면 오른쪽 경계를 넘어가는 경우 왼쪽에 표시
      if (x + previewWidth > viewportWidth - 20) {
        x = e.clientX - previewWidth - 40; // 왼쪽으로 40px 떨어진 곳에 위치
      }
      
      // 화면 위쪽 경계를 넘어가는 경우 아래로 조정
      if (y < 20) {
        y = 20;
      }
      
      // 화면 아래쪽 경계를 넘어가는 경우 위로 조정
      if (y + previewHeight > viewportHeight - 20) {
        y = viewportHeight - previewHeight - 20;
      }
      
      setPreviewPosition({ x, y });
    };

    // 마우스 이동 이벤트 리스너 추가
    window.addEventListener('mousemove', updatePreviewPosition);
    
    return () => {
      // 이벤트 리스너 제거
      window.removeEventListener('mousemove', updatePreviewPosition);
    };
  }, [activePreview]);

  // 프리뷰 위치 초기화 - 마우스 호버 시 최초 위치 설정
  const initPreviewPosition = (e: React.MouseEvent) => {
    // 화면 크기 가져오기
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 미리보기 카드 예상 크기
    const previewWidth = 400;
    const previewHeight = 300;
    
    // 마우스 커서 위치에 따라 왼쪽 또는 오른쪽에 배치
    // 기본적으로 마우스 커서의 오른쪽에 표시
    let x = e.clientX + 40; // 오른쪽으로 40px 떨어진 곳에 위치
    let y = e.clientY - previewHeight / 2; // 마우스 커서 높이의 중앙에 맞춤
    
    // 화면 오른쪽 경계를 넘어가는 경우 왼쪽에 표시
    if (x + previewWidth > viewportWidth - 20) {
      x = e.clientX - previewWidth - 40; // 왼쪽으로 40px 떨어진 곳에 위치
    }
    
    // 화면 위쪽 경계를 넘어가는 경우 아래로 조정
    if (y < 20) {
      y = 20;
    }
    
    // 화면 아래쪽 경계를 넘어가는 경우 위로 조정
    if (y + previewHeight > viewportHeight - 20) {
      y = viewportHeight - previewHeight - 20;
    }
    
    setPreviewPosition({ x, y });
  };

  // 프리뷰 렌더링
  const renderPreview = () => {
    if (!activePreview) return null;

    let previewTitle = '';
    let previewContent: React.ReactNode = null;

    switch (activePreview) {
      case 'youtube':
        previewTitle = `${solopreneur.name}'s YouTube Channel`;
        // 미리보기 이미지가 없는 경우 기본 이미지 사용
        const youtubePreviewImage = solopreneur.links.previews?.youtube || 
          `https://picsum.photos/800/450?random=${solopreneur.name}-youtube`;
        
        previewContent = (
          <div className={styles.youtubePreview}>
            <Image
              src={youtubePreviewImage}
              alt={previewTitle}
              width={480}
              height={270}
              className={styles.previewImage}
            />
          </div>
        );
        break;

      case 'twitter':
        previewTitle = `${solopreneur.name}'s Twitter Profile`;
        // 미리보기 이미지가 없는 경우 기본 이미지 사용
        const twitterPreviewImage = solopreneur.links.previews?.twitter || 
          `https://picsum.photos/600/300?random=${solopreneur.name}-twitter`;
        
        previewContent = (
          <div className={styles.twitterPreview}>
            <Image
              src={twitterPreviewImage}
              alt={previewTitle}
              width={480}
              height={240}
              className={styles.previewImage}
            />
          </div>
        );
        break;

      case 'linkedin':
        previewTitle = `${solopreneur.name}'s LinkedIn Profile`;
        // 미리보기 이미지가 없는 경우 기본 이미지 사용
        const linkedinPreviewImage = solopreneur.links.previews?.linkedin || 
          `https://picsum.photos/700/400?random=${solopreneur.name}-linkedin`;
        
        previewContent = (
          <div className={styles.linkedinPreview}>
            <Image
              src={linkedinPreviewImage}
              alt={previewTitle}
              width={480}
              height={270}
              className={styles.previewImage}
            />
          </div>
        );
        break;

      case 'website':
        if (!solopreneur.links.website) return null;
        previewTitle = `${solopreneur.name}'s Website`;
        
        // 웹사이트 미리보기를 iframe으로 변경
        previewContent = (
          <div className={styles.websitePreview}>
            <iframe
              src={`/api/preview?url=${encodeURIComponent(solopreneur.links.website)}`}
              className={styles.websiteIframe}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              referrerPolicy="no-referrer"
              title={`${solopreneur.name}'s Website Preview`}
            />
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>{previewTitle}</h3>
        </div>
        <div className={styles.previewContent}>
          {previewContent}
        </div>
      </div>
    );
  };

  // 사용 가능한 링크 텍스트 생성
  const getAvailableLinksText = () => {
    const linkPlatforms: string[] = [];
    if (solopreneur.links.youtube) linkPlatforms.push('YouTube');
    if (solopreneur.links.twitter) linkPlatforms.push('Twitter');
    if (solopreneur.links.linkedin) linkPlatforms.push('LinkedIn');
    if (solopreneur.links.website) linkPlatforms.push('Website');
    
    if (linkPlatforms.length === 0) return '';
    
    const pronoun = solopreneur.gender === 'female' ? 'her' : 'his';
    
    // 각 플랫폼 이름을 span으로 감싸서 hover 이벤트 추가
    const wrapPlatformWithHover = (platform: string) => {
      const platformLower = platform.toLowerCase();
      return (
        <span 
          key={platformLower}
          className={styles.platformLink}
          onMouseEnter={(e) => {
            setActivePreview(platformLower);
            initPreviewPosition(e);
          }}
          onMouseLeave={() => setActivePreview(null)}
          onClick={(e) => {
            e.preventDefault();
            if (solopreneur.links[platformLower as keyof typeof solopreneur.links]) {
              window.open(solopreneur.links[platformLower as keyof typeof solopreneur.links] as string, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          {platform}
        </span>
      );
    };
    
    const wrappedLinks = linkPlatforms.map(platform => wrapPlatformWithHover(platform));
    
    if (wrappedLinks.length === 1) {
      return (
        <>Check out {pronoun} {wrappedLinks[0]}</>
      );
    } else if (wrappedLinks.length === 2) {
      return (
        <>Check out {pronoun} {wrappedLinks[0]} and {wrappedLinks[1]}</>
      );
    } else {
      const lastLink = wrappedLinks.pop();
      return (
        <>Check out {pronoun} {wrappedLinks.reduce((prev, curr, i) => 
          <>
            {prev}
            {i > 0 ? ', ' : ''}
            {curr}
          </>, <></>)}, and {lastLink}</>
      );
    }
  };

  // Portal 컨테이너 설정
  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  return (
    <div className={styles.card} ref={cardRef}>
      <div className={styles.cardInner}>
        <div className={styles.imageWrapper}>
          <Image
            src={solopreneur.image}
            alt={solopreneur.name}
            width={120}
            height={120}
            className={styles.image}
          />
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.name}>{solopreneur.name}</h3>
          <p className={styles.description}>{solopreneur.description}</p>
          
          <div className={styles.links}>
            {solopreneur.links.youtube && (
              <a
                href={solopreneur.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onMouseEnter={(e) => {
                  setActivePreview('youtube');
                  initPreviewPosition(e);
                }}
                onMouseLeave={() => setActivePreview(null)}
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.5 6.50701C23.3641 6.02225 23.0994 5.58336 22.734 5.23671C22.3583 4.88015 21.8978 4.62536 21.396 4.50001C19.518 4.00001 12 4.00001 12 4.00001C12 4.00001 4.48201 4.00001 2.60401 4.50001C2.10217 4.62536 1.64166 4.88015 1.26601 5.23671C0.900551 5.58336 0.635913 6.02225 0.500006 6.50701C0.0110061 10.8 0.0110061 15.092 0.500006 19.385C0.635913 19.8698 0.900551 20.3087 1.26601 20.6553C1.64166 21.0119 2.10217 21.2667 2.60401 21.392C4.48201 21.892 12 21.892 12 21.892C12 21.892 19.518 21.892 21.396 21.392C21.8978 21.2667 22.3583 21.0119 22.734 20.6553C23.0994 20.3087 23.3641 19.8698 23.5 19.385C23.9891 15.092 23.9891 10.8 23.5 6.50701ZM9.60401 15.744V10.144L15.804 12.944L9.60401 15.744Z" fill="currentColor"/>
                </svg>
              </a>
            )}
            
            {solopreneur.links.twitter && (
              <a
                href={solopreneur.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onMouseEnter={(e) => {
                  setActivePreview('twitter');
                  initPreviewPosition(e);
                }}
                onMouseLeave={() => setActivePreview(null)}
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 5.79997C21.2483 6.12606 20.4534 6.34163 19.64 6.43997C20.4982 5.92729 21.1413 5.12075 21.45 4.16997C20.6436 4.65003 19.7608 4.98826 18.84 5.16997C18.2245 4.50254 17.405 4.05826 16.5098 3.90682C15.6147 3.75537 14.6945 3.90532 13.8938 4.33315C13.093 4.76099 12.4569 5.4425 12.0852 6.2708C11.7135 7.09911 11.6273 8.02736 11.84 8.90997C10.2094 8.82749 8.61444 8.40292 7.15865 7.66383C5.70287 6.92474 4.41885 5.88766 3.39 4.61997C3.02914 5.25013 2.83952 5.96379 2.84 6.68997C2.83872 7.36435 3.00422 8.02858 3.32176 8.62353C3.63929 9.21848 4.09902 9.72568 4.66 10.1C4.00798 10.0822 3.36989 9.90726 2.8 9.58997V9.63997C2.80489 10.5849 3.13599 11.4991 3.73731 12.2279C4.33864 12.9568 5.17326 13.4556 6.1 13.64C5.74326 13.7485 5.37288 13.8058 5 13.81C4.74189 13.807 4.48442 13.7835 4.23 13.74C4.49391 14.5528 5.00462 15.2631 5.69107 15.7721C6.37753 16.2811 7.20558 16.5635 8.06 16.58C6.6172 17.7294 4.83588 18.3353 3 18.34C2.66574 18.3411 2.33174 18.321 2 18.28C3.87443 19.5045 6.05881 20.1459 8.29 20.14C9.82969 20.1645 11.3571 19.8818 12.7831 19.3109C14.2091 18.7399 15.505 17.8918 16.5952 16.8126C17.6854 15.7334 18.546 14.4465 19.1301 13.0265C19.7142 11.6065 20.0109 10.0813 20 8.53997C20 8.36997 20 8.18997 20 8.00997C20.7847 7.41793 21.4615 6.68439 22 5.84997L22 5.79997Z" fill="currentColor"/>
                </svg>
              </a>
            )}
            
            {solopreneur.links.linkedin && (
              <a
                href={solopreneur.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onMouseEnter={(e) => {
                  setActivePreview('linkedin');
                  initPreviewPosition(e);
                }}
                onMouseLeave={() => setActivePreview(null)}
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z" fill="currentColor"/>
                  <path d="M5 10C5 9.44772 5.44772 9 6 9H7C7.55228 9 8 9.44771 8 10V18C8 18.5523 7.55228 19 7 19H6C5.44772 19 5 18.5523 5 18V10Z" fill="currentColor"/>
                  <path d="M11 19H12C12.5523 19 13 18.5523 13 18V13.5C13 12 16 11 16 13V18.0004C16 18.5527 16.4477 19 17 19H18C18.5523 19 19 18.5523 19 18V12C19 10 17.5 9 15.5 9C13.5 9 13 10.5 13 10.5V10C13 9.44771 12.5523 9 12 9H11C10.4477 9 10 9.44772 10 10V18C10 18.5523 10.4477 19 11 19Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 1C21.6569 1 23 2.34315 23 4V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H20ZM20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20Z" fill="currentColor"/>
                </svg>
              </a>
            )}
            
            {solopreneur.links.website && (
              <a
                href={solopreneur.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onMouseEnter={(e) => {
                  setActivePreview('website');
                  initPreviewPosition(e);
                }}
                onMouseLeave={() => setActivePreview(null)}
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.982 19.61C17.7569 18.9253 20.0587 16.9701 21.0986 14.3577C22.1385 11.7453 21.7943 8.82984 20.1553 6.49941C18.5163 4.16897 15.8004 2.79148 12.9701 2.86106C10.1399 2.93063 7.49138 4.43738 5.96795 6.84876C4.44451 9.26013 4.26231 12.2133 5.48436 14.7835C6.7064 17.3538 9.16596 19.1771 12 19.4V16.7439C10.8456 16.5746 9.79633 16.0194 9.00398 15.1721C8.21163 14.3248 7.72273 13.2341 7.61313 12.0758C7.50354 10.9175 7.77958 9.75722 8.39491 8.77295C9.01024 7.78869 9.92986 7.03511 11 6.62868V6.62868C11.9223 6.25868 12.9394 6.18661 13.9035 6.42302C14.8676 6.65944 15.7347 7.19219 16.3844 7.94868C17.0341 8.70517 17.4344 9.64985 17.5307 10.6498C17.627 11.6498 17.4147 12.6564 16.926 13.5439L16.926 13.5439C16.4483 14.4133 15.7205 15.1175 14.8439 15.5608C13.9673 16.0042 12.9835 16.1629 12.018 16.0151C11.0525 15.8673 10.1549 15.4201 9.45445 14.7439C8.75398 14.0677 8.28282 13.1967 8.11 12.2439H10.25C10.3766 12.6638 10.6478 13.0259 11.0176 13.2693C11.3873 13.5128 11.8329 13.6226 12.2739 13.5793C12.7148 13.536 13.1274 13.3421 13.4388 13.0295C13.7502 12.7169 13.9427 12.3037 13.9844 11.8628C14.0261 11.4219 13.9147 10.9767 13.6699 10.6078C13.425 10.2388 13.0619 9.96895 12.6414 9.84402C12.2209 9.71909 11.7747 9.74689 11.3748 9.92214C10.9749 10.0974 10.6471 10.4092 10.45 10.8H8.3C8.5 9.8 9.1 8.9 10 8.3C10.9 7.7 12 7.5 13 7.7C14 7.9 14.9 8.5 15.5 9.4C16.1 10.3 16.3 11.4 16.1 12.4C15.9 13.4 15.3 14.3 14.4 14.9C13.5 15.5 12.4 15.7 11.4 15.5C10.4 15.3 9.5 14.7 8.9 13.8C8.3 12.9 8.1 11.8 8.3 10.8H8.3C8.4 10.2 8.6 9.7 8.9 9.2C9.2 8.7 9.6 8.4 10 8.1V8.1C10.6 7.7 11.3 7.5 12 7.5C12.7 7.5 13.4 7.7 14 8.1C14.6 8.5 15.1 9 15.4 9.7C15.7 10.4 15.8 11.1 15.7 11.8C15.6 12.5 15.2 13.1 14.7 13.6C14.2 14.1 13.5 14.4 12.8 14.5C12.1 14.6 11.4 14.4 10.8 14.1C10.2 13.8 9.7 13.2 9.5 12.6H12C12.1 12.9 12.4 13.1 12.7 13.2C13 13.3 13.3 13.2 13.6 13C13.9 12.8 14.1 12.5 14.2 12.2C14.3 11.9 14.2 11.6 14 11.3C13.8 11 13.5 10.8 13.2 10.7C12.9 10.6 12.6 10.7 12.3 10.9C12 11.1 11.8 11.4 11.7 11.7H10.5C10.6 11.2 10.8 10.7 11.2 10.4C11.6 10.1 12 9.9 12.5 9.9C13 9.9 13.4 10.1 13.8 10.4C14.2 10.7 14.4 11.2 14.5 11.7C14.6 12.2 14.4 12.6 14.1 13C13.8 13.4 13.3 13.6 12.8 13.7C12.3 13.8 11.9 13.6 11.5 13.3C11.1 13 10.9 12.5 10.8 12H12.5C12.5 12.1 12.6 12.2 12.7 12.3C12.8 12.4 12.9 12.4 13 12.4C13.1 12.4 13.2 12.3 13.3 12.2C13.4 12.1 13.4 12 13.4 11.9C13.4 11.8 13.3 11.7 13.2 11.6C13.1 11.5 13 11.5 12.9 11.5C12.8 11.5 12.7 11.6 12.6 11.7C12.5 11.8 12.5 11.9 12.5 12H12C12 11.9 12 11.7 12.1 11.6C12.2 11.5 12.4 11.4 12.5 11.4C12.6 11.4 12.8 11.5 12.9 11.6C13 11.7 13 11.9 13 12C13 12.1 12.9 12.3 12.8 12.4C12.7 12.5 12.5 12.6 12.4 12.6C12.3 12.6 12.1 12.5 12 12.4C11.9 12.3 11.9 12.1 11.9 12H12.5V12ZM14.982 19.61C14.9887 19.6066 14.9953 19.6033 15.0019 19.6H15V19.598C14.9941 19.602 14.988 19.606 14.982 19.61Z" fill="currentColor"/>
                </svg>
              </a>
            )}
          </div>
          
          <p className={styles.availableLinks}>{getAvailableLinksText()}</p>
        </div>
      </div>

      {/* Portal을 사용하여 미리보기를 body에 직접 렌더링 */}
      {activePreview && portalContainer && createPortal(
        <div 
          className={styles.preview} 
          style={{ 
            top: previewPosition.y, 
            left: previewPosition.x,
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'none' // 마우스 이벤트를 무시하여 중복 호버링 방지
          }}
          ref={previewRef}
        >
          {renderPreview()}
        </div>,
        portalContainer
      )}
    </div>
  );
} 