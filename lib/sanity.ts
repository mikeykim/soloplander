import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId, useCdn } from '@/sanity/env';

export const client = createClient({
  projectId: 'eqkm480h',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  perspective: 'published'
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
} 