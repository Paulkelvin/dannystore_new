require('dotenv').config();
const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: 'bf1mtn9k',
  dataset: 'production',
  apiVersion: '2024-04-30',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // Set this in your .env file
});

const lifestylePackagesData = [
  { 
    _id: 'lifestylePackage.backyard-explorers-club', 
    _type: 'lifestylePackage', 
    title: 'Backyard Explorers Club', 
    slug: { _type: 'slug', current: 'backyard-explorers-club' }, 
    description: [ { _key: 'desc1', _type: 'block', style: 'normal', children: [ { _key: 'span1', _type: 'span', text: 'Gear up for adventure! Everything for fun-filled days playing outside.' } ] } ],
    marqueeImage: null, 
    heroImage: null,
    featuredProducts: [],
    callToActionText: 'Shop Outdoor Fun',
    isActive: true 
  },
  { 
    _id: 'lifestylePackage.little-artists-studio', 
    _type: 'lifestylePackage', 
    title: 'Little Artists Studio', 
    slug: { _type: 'slug', current: 'little-artists-studio' }, 
    description: [ { _key: 'desc2', _type: 'block', style: 'normal', children: [ { _key: 'span2', _type: 'span', text: 'Unleash their inner Picasso! Paints, crafts, dough, and more.' } ] } ],
    marqueeImage: null, 
    heroImage: null,
    featuredProducts: [],
    callToActionText: 'Explore Art Supplies',
    isActive: true 
  },
  { 
    _id: 'lifestylePackage.curious-minds-lab-stem', 
    _type: 'lifestylePackage', 
    title: 'Curious Minds Lab (STEM)', 
    slug: { _type: 'slug', current: 'curious-minds-lab-stem' }, 
    description: [ { _key: 'desc3', _type: 'block', style: 'normal', children: [ { _key: 'span3', _type: 'span', text: 'Build, experiment, and discover! Engaging STEM toys for learning.' } ] } ],
    marqueeImage: null, 
    heroImage: null,
    featuredProducts: [],
    callToActionText: 'Shop STEM Fun',
    isActive: true 
  },
  { 
    _id: 'lifestylePackage.tiny-tots-treasures', 
    _type: 'lifestylePackage', 
    title: 'Tiny Tots Treasures (Ages 1-3)', 
    slug: { _type: 'slug', current: 'tiny-tots-treasures' }, 
    description: [ { _key: 'desc4', _type: 'block', style: 'normal', children: [ { _key: 'span4', _type: 'span', text: 'Safe, engaging, and perfectly sized for little hands.' } ] } ],
    marqueeImage: null, 
    heroImage: null,
    featuredProducts: [],
    callToActionText: 'Shop Toddler Picks',
    isActive: true 
  }
];

async function createLifestylePackages() {
  for (const pkg of lifestylePackagesData) {
    try {
      const result = await client.createOrReplace(pkg);
      console.log(`✅ Created/updated: ${result.title} (${result._id})`);
    } catch (err) {
      console.error(`❌ Failed for ${pkg.title}:`, err.message);
    }
  }
  process.exit(0);
}

createLifestylePackages();

// How to run: node createLifestylePackages.js 