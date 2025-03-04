import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity';
import styles from './page.module.css';
import { formatDate } from '@/utils/dateFormatter';

export const metadata: Metadata = {
  title: 'Blog | SolopLander',
  description: 'Read the latest insights and stories from successful solopreneurs around the world.'
};

async function getPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "coverImage": coverImage.asset->url,
    publishedAt,
    "author": author->name,
    "tags": tags,
    _createdAt,
    _updatedAt
  }`;
  
  const posts = await client.fetch(query);
  return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();
  
  if (!posts || posts.length === 0) {
    return (
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.description}>
            No posts available at the moment. Check back soon!
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.headerSection}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.description}>
          Insights, strategies, and resources for solopreneurs and small business owners.
        </p>
      </section>

      {posts.length > 0 ? (
        <section className={styles.postsGrid}>
          {posts.map(post => (
            <Link 
              href={`/blog/${post.slug}`}
              className={styles.blogPostCard}
              key={post._id}
            >
              <div className={styles.blogPostImageContainer}>
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className={styles.postImage}
                  />
                )}
              </div>
              <div className={styles.postContent}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postMeta}>
                  {post.publishedAt && formatDate(post.publishedAt)}
                  {post.author && ` • By ${post.author}`}
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <p className={styles.noPostsMessage}>No posts available.</p>
      )}
    </div>
  );
} 