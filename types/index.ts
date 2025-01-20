export type RegionType = 'USA' | 'Europe' | 'Asia';

export interface ISolopreneur {
  name: string;
  region: RegionType;
  image: string;
  description: string;
  links: {
    youtube?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    previews?: {
      youtube?: string;
      twitter?: string;
    }
  };
} 