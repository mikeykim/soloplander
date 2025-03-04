import { PortableText as PortableTextComponent } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
import styles from './PortableText.module.css';

const components = {
  types: {
    image: ({ value }: any) => {
      return (
        <div className={styles.imageContainer}>
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || ' '}
            width={800}
            height={value.height || 450}
            className={styles.image}
          />
          {value.caption && (
            <div className={styles.caption}>{value.caption}</div>
          )}
        </div>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a href={value.href} rel={rel} className={styles.link}>
          {children}
        </a>
      );
    },
  },
};

export default function PortableText({ value }: { value: any }) {
  return <PortableTextComponent value={value} components={components} />;
} 