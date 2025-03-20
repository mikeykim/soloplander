export type RegionType = 'USA' | 'Europe' | 'Asia';

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    image?: string;
  };
  tags: string[];
  featured: boolean;
}

export interface ISolopreneur {
  id?: number;
  name: string;
  region: RegionType;
  image: string;
  description: string;
  gender: 'male' | 'female';
  links: {
    youtube?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    linkedin?: string;
    previews?: {
      youtube?: string;
      twitter?: string;
      website?: string;
      linkedin?: string;
    }
  };
  keywords?: string[];
  created_at?: string;
  updated_at?: string;
}

interface IPreview {
  youtube?: string;
  twitter?: string;
  website?: string;
} 