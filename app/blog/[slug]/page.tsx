import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client, urlFor } from '@/lib/sanity';
import PortableText from '@/components/PortableText';
import { formatDate } from '@/utils/dateFormatter';
import styles from './page.module.css';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    body,
    content,
    excerpt,
    "coverImage": coverImage.asset->url,
    publishedAt,
    "author": author->name,
    "authorImage": author->image.asset->url,
    "tags": tags
  }`;
  
  const post = await client.fetch(query, { slug });
  console.log('Post content field:', post.content ? 'content exists' : 'no content');
  console.log('Post body field:', post.body ? 'body exists' : 'no body');
  return post;
}

async function getRelatedPosts(slug: string, tags: string[]) {
  if (!tags || tags.length === 0) return [];
  
  return await client.fetch(`
    *[_type == "post" && slug.current != $slug && count((tags)[@ in $tags]) > 0] | order(publishedAt desc)[0...3] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt
    }
  `, { slug, tags });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | SolopLander Blog',
      description: 'The requested blog post could not be found.'
    };
  }
  
  return {
    title: `${post.title} | SolopLander Blog`,
    description: post.excerpt || 'Read this insightful article on SolopLander Blog'
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);
  
  if (!post) {
    return (
      <div className={styles.container}>
        <h1>Post Not Found</h1>
        <p>The blog post you are looking for does not exist.</p>
        <Link href="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
      </div>
    );
  }
  
  const relatedPosts = await getRelatedPosts(params.slug, post.tags);
  
  return (
    <article className={styles.container}>
      <Link href="/blog" className={styles.backLink}>
        ← Back to Blog
      </Link>
      
      <h1 className={styles.title}>{post.title}</h1>
      
      <div className={styles.meta}>
        {post.publishedAt && (
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
        )}
        {post.author && ` • By ${post.author}`}
      </div>
      
      {post.coverImage && (
        <div className={styles.coverImageContainer}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className={styles.coverImage}
            priority
          />
        </div>
      )}
      
      <div className={styles.content}>
        {post.content ? (
          <PortableText value={post.content} />
        ) : post.body ? (
          <PortableText value={post.body} />
        ) : (
          <p>No content available for this post.</p>
        )}
      </div>
      
      <div className={styles.tags}>
        {post.tags && post.tags.map((tag: string) => (
          <Link 
            href={`/blog/category/${encodeURIComponent(tag)}`} 
            key={tag} 
            className={styles.tag}
          >
            <strong>#</strong>{tag}
          </Link>
        ))}
      </div>
      
      {relatedPosts.length > 0 && (
        <>
          <hr className={styles.divider} />
          <div className={styles.relatedPosts}>
            <h3 className={styles.relatedTitle}>Related Posts</h3>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((relatedPost: any) => (
                <Link 
                  href={`/blog/${relatedPost.slug}`} 
                  key={relatedPost._id} 
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImageContainer}>
                    {relatedPost.coverImage && (
                      <Image 
                        src={urlFor(relatedPost.coverImage).url()} 
                        alt={relatedPost.title}
                        width={300}
                        height={170}
                        className={styles.relatedImage}
                      />
                    )}
                  </div>
                  <div className={styles.relatedContent}>
                    <h4 className={styles.relatedPostTitle}>{relatedPost.title}</h4>
                    <p className={styles.relatedPostMeta}>
                      {relatedPost.publishedAt && formatDate(relatedPost.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "post"] {
      "slug": slug.current
    }
  `);
  
  return posts.map((post: any) => ({
    slug: post.slug,
  }));
} 