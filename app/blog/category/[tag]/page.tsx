/// <reference types="@sanity/client" />
/// <reference types="next-sanity" />

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client, urlFor } from '@/lib/sanity';
import { fetchSanity } from '@/lib/sanity-helpers';
import styles from '../../page.module.css';

interface PageProps {
  params: {
    tag: string;
  };
}

async function getPostsByTag(tag: string) {
  return fetchSanity(`
    *[_type == "post" && $tag in tags] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      "author": author->{name, image},
      tags
    }
  `, { tag });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(decodedTag);
  
  if (!posts || posts.length === 0) {
    return {
      title: 'Category Not Found | SolopLander Blog',
    };
  }
  
  return {
    title: `${decodedTag} | SolopLander Blog`,
    description: `Read articles about ${decodedTag} from SolopLander Blog.`
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const decodedTag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(decodedTag);
  
  if (!posts || posts.length === 0) {
    notFound();
  }
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Category: <span className={styles.highlight}>{decodedTag}</span>
      </h1>
      
      <div className={styles.postsGrid}>
        {posts.map((post: any) => (
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
      
      <div className={styles.backLinkContainer}>
        <Link href="/blog" className={styles.backLink}>
          ← Back to All Posts
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const tags = await client.fetch(`
    *[_type == "post"] {
      tags
    }
  `);
  
  const allTags = new Set<string>();
  
  tags.forEach((post: any) => {
    if (post.tags) {
      post.tags.forEach((tag: string) => {
        allTags.add(tag);
      });
    }
  });
  
  return Array.from(allTags)
    .filter(tag => tag && tag.trim().length > 0)
    .map(tag => ({
      tag: encodeURIComponent(tag),
    }));
} 