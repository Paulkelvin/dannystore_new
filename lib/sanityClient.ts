import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
}

// Create a single client instance
const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Always use fresh data for mutations
  token: process.env.SANITY_API_TOKEN,
};

// Create the client
const sanityClient = createClient(sanityConfig);

// Create the image URL builder
const builder = imageUrlBuilder(sanityConfig);

// Export the urlFor function with proper typing
export function urlFor(source: SanityImageSource) {
  if (!source) return null;
  try {
    return builder.image(source);
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
}

// Export a single client instance
export const sanityClientWrite = sanityClient;

// Export a public client for read-only operations
export const sanityClientPublic = createClient({
  ...sanityConfig,
  useCdn: true,
}); 