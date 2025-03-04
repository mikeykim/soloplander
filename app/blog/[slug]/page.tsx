import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client, urlFor } from '@/lib/sanity';
import PortableText from '@/components/PortableText';
import styles from './page.module.css';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  return await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      content,
      excerpt,
      coverImage,
      publishedAt,
      "author": author->{name, image},
      tags,
      featured
    }
  `, { slug });
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
      title: 'Post Not Found | SolopLander',
    };
  }
  
  return {
    title: `${post.title} | SolopLander Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: urlFor(post.coverImage).width(1200).height(630).url() }]
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedPosts(params.slug, post.tags);
  
  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <div className={styles.author}>
            {post.author.image && (
              <Image 
                src={urlFor(post.author.image).width(40).height(40).url()} 
                alt={post.author.name}
                width={40}
                height={40}
                className={styles.authorImage}
              />
            )}
            <span>{post.author.name}</span>
          </div>
          <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
        </div>
      </div>
      
      <div className={styles.coverImageContainer}>
        <Image 
          src={urlFor(post.coverImage).width(1200).height(600).url()} 
          alt={post.title}
          width={1200}
          height={600}
          className={styles.coverImage}
          priority
        />
      </div>
      
      <div className={styles.content}>
        <PortableText value={post.content} />
      </div>
      
      <div className={styles.tags}>
        {post.tags && post.tags.map((tag: string) => (
          <Link 
            href={`/blog/category/${encodeURIComponent(tag)}`} 
            key={tag} 
            className={styles.tag}
          >
            {tag}
          </Link>
        ))}
      </div>
      
      {relatedPosts.length > 0 && (
        <div className={styles.relatedPosts}>
          <h3 className={styles.relatedTitle}>Related Posts</h3>
          <div className={styles.relatedGrid}>
            {relatedPosts.map((relatedPost: any) => (
              <Link href={`/blog/${relatedPost.slug}`} key={relatedPost._id} className={styles.relatedCard}>
                <div className={styles.relatedImageContainer}>
                  <Image 
                    src={urlFor(relatedPost.coverImage).width(300).height(170).url()} 
                    alt={relatedPost.title}
                    width={300}
                    height={170}
                    className={styles.relatedImage}
                  />
                </div>
                <div className={styles.relatedContent}>
                  <h4>{relatedPost.title}</h4>
                  <time>{new Date(relatedPost.publishedAt).toLocaleDateString()}</time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.navigation}>
        <Link href="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
      </div>
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