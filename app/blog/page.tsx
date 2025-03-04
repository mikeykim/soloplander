import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client, urlFor } from '@/lib/sanity';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog | SolopLander',
  description: 'Read the latest insights and stories from successful solopreneurs around the world.'
};

async function getPosts() {
  return await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      "author": author->{name, image},
      tags,
      featured
    }
  `);
}

export default async function BlogPage() {
  const posts = await getPosts();
  
  // 특집 게시물 찾기
  const featuredPost = posts.find((post: any) => post.featured);
  // 나머지 게시물
  const regularPosts = posts.filter((post: any) => !post.featured);
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>SolopLander Blog</h1>
      
      {/* 특집 게시물 */}
      {featuredPost && (
        <div className={styles.featuredSection}>
          <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredPost}>
            <div className={styles.featuredImageContainer}>
              <Image 
                src={urlFor(featuredPost.coverImage).width(800).height(400).url()} 
                alt={featuredPost.title}
                width={800}
                height={400}
                className={styles.featuredImage}
              />
            </div>
            <div className={styles.featuredContent}>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.excerpt}</p>
              <div className={styles.postMeta}>
                <time>{new Date(featuredPost.publishedAt).toLocaleDateString()}</time>
                <div className={styles.tags}>
                  {featuredPost.tags && featuredPost.tags.map((tag: string) => (
                    <Link 
                      href={`/blog/category/${encodeURIComponent(tag)}`} 
                      key={tag} 
                      className={styles.tag}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
      
      {/* 모든 게시물 */}
      <div className={styles.postsGrid}>
        {regularPosts.map((post: any) => (
          <Link href={`/blog/${post.slug}`} key={post._id} className={styles.postCard}>
            <div className={styles.postImageContainer}>
              <Image 
                src={urlFor(post.coverImage).width(400).height(225).url()} 
                alt={post.title}
                width={400}
                height={225}
                className={styles.postImage}
              />
            </div>
            <div className={styles.postContent}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className={styles.postMeta}>
                <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
                <div className={styles.tags}>
                  {post.tags && post.tags.slice(0, 2).map((tag: string) => (
                    <Link 
                      href={`/blog/category/${encodeURIComponent(tag)}`} 
                      key={tag} 
                      className={styles.tag}
                    >
                      {tag}
                    </Link>
                  ))}
                  {post.tags && post.tags.length > 2 && (
                    <span className={styles.moreTag}>+{post.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 