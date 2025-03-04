import { PortableText as PortableTextComponent } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
import styles from './PortableText.module.css';

// 디버깅 래퍼 추가
export default function PortableText({ value }: { value: any }) {
  // 값이 없거나 유효하지 않은 경우 처리
  if (!value) {
    console.error('No value provided to PortableText component');
    return <p>No content available.</p>;
  }

  // 값의 타입 확인 및 로깅
  console.log('PortableText value type:', typeof value);
  console.log('PortableText value:', JSON.stringify(value).substring(0, 200) + '...');

  // 컴포넌트 설정
  const components = {
    types: {
      image: ({ value: imageValue }: any) => {
        if (!imageValue || !imageValue.asset) {
          console.error('Invalid image value:', imageValue);
          return null;
        }
        
        try {
          return (
            <div className="relative w-full h-96 my-6">
              <Image
                src={urlFor(imageValue).url()}
                alt={imageValue.alt || 'Blog post image'}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          );
        } catch (error) {
          console.error('Error rendering image:', error);
          return <p>Error loading image</p>;
        }
      },
    },
    marks: {
      link: ({ value, children }: any) => {
        try {
          const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
          const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
          
          return (
            <a 
              href={value?.href || '#'} 
              target={target} 
              rel={rel}
              className="text-blue-500 hover:underline"
            >
              {children}
            </a>
          );
        } catch (error) {
          console.error('Error rendering link:', error);
          return <>{children}</>;
        }
      },
    },
  };

  // 안전하게 렌더링 시도
  try {
    return <PortableTextComponent value={value} components={components} />;
  } catch (error) {
    console.error('Error rendering PortableText:', error);
    return <p>Error displaying content. Please try again later.</p>;
  }
} 