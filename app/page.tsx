import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import WorldMap from '@/components/WorldMap';
import NewsletterSignup from '@/components/NewsletterSignup';
import { client, urlFor } from '@/lib/sanity';
import styles from './page.module.css';

async function getLatestPosts() {
  return await client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0...3] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt
    }
  `);
}

export default async function Home() {
  const latestPosts = await getLatestPosts();
  
  return (
    <main>
      <HeroSection />
      <WorldMap />
      
      {latestPosts.length > 0 && (
        <section className={styles.blogSection}>
          <div className={styles.blogContainer}>
            <div className={styles.blogHeader}>
              <h2 className={styles.blogTitle}>Latest from our Blog</h2>
              <Link href="/blog" className={styles.viewAllLink}>
                View all posts →
              </Link>
            </div>
            
            <div className={styles.blogGrid}>
              {latestPosts.map((post: any) => (
                <Link href={`/blog/${post.slug}`} key={post._id} className={styles.blogCard}>
                  <div className={styles.blogImageContainer}>
                    <Image 
                      src={urlFor(post.coverImage).width(350).height(200).url()} 
                      alt={post.title}
                      width={350}
                      height={200}
                      className={styles.blogImage}
                    />
                  </div>
                  <div className={styles.blogContent}>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className={styles.blogMeta}>
                      <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <NewsletterSignup />
    </main>
  );
} 