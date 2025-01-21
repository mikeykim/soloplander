export type RegionType = 'USA' | 'Europe' | 'Asia';

export interface ISolopreneur {
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
    }
  };
}

interface IPreview {
  youtube?: string;
  twitter?: string;
  website?: string;
} 