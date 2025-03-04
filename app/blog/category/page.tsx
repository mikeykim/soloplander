import { Metadata } from 'next';
import Link from 'next/link';
import { client } from '@/lib/sanity';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Categories | SolopLander Blog',
  description: 'Browse posts by category on SolopLander Blog'
};

export default async function CategoriesPage() {
  // 모든 태그 가져오기
  const tags = await client.fetch(`
    *[_type == "post"] {
      tags
    }
  `);
  
  // 태그 카운트 집계
  const tagCounts: Record<string, number> = {};
  tags.forEach((post: any) => {
    if (post.tags) {
      post.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // 태그와 카운트를 배열로 변환 후 정렬
  const categoriesWithCount = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Blog Categories</h1>
      
      <div className={styles.categoriesGrid}>
        {categoriesWithCount.map(({ tag, count }) => (
          <Link 
            href={`/blog/category/${encodeURIComponent(tag)}`} 
            key={tag} 
            className={styles.categoryCard}
          >
            <h2>{tag}</h2>
            <p>{count} post{count === 1 ? '' : 's'}</p>
          </Link>
        ))}
      </div>
      
      <div className={styles.backLinkContainer}>
        <Link href="/blog" className={styles.backLink}>
          ← Back to All Posts
        </Link>
      </div>
    </div>
  );
} 