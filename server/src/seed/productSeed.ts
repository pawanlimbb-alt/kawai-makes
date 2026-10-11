import { Product } from '../models/Product';
import { Settings } from '../models/Settings';
import { config } from '../config';

const INITIAL_PRODUCTS = [
  {
    name: 'Cat keychain',
    slug: 'cat-keychain',
    category: 'Keychains',
    material: 'Pipe cleaner',
    price: 250,
    imageUrl: 'cat',
    description: 'A fluffy little cat with purple ears and stitched whiskers. It sits happily in your palm and hangs from a bag or key ring.',
    options: [{ label: 'Fur colour', choices: ['Ginger and white', 'Grey and white', 'Black', 'Cream'] }],
    active: true,
    sortOrder: 1
  },
  {
    name: 'Rose bouquet',
    slug: 'rose-bouquet',
    category: 'Bouquets',
    material: 'Pipe cleaner',
    price: 350,
    imageUrl: 'rose',
    description: 'A pocket-sized bouquet of fuzzy roses with a soft wrap and a satin bow. It never wilts.',
    options: [
      { label: 'Rose colour', choices: ['Deep red', 'Pink', 'White', 'Yellow', 'Lilac'] },
      { label: 'Wrap colour', choices: ['Lilac', 'Pink', 'White', 'Cream'] }
    ],
    active: true,
    sortOrder: 2
  },
  {
    name: 'Little elephant keychain',
    slug: 'little-elephant-keychain',
    category: 'Keychains',
    material: 'Pipe cleaner',
    price: 280,
    imageUrl: 'ele',
    description: 'A very fluffy elephant with heart-shaped ears and blushing cheeks.',
    options: [{ label: 'Body colour', choices: ['Pink', 'Grey', 'Blue', 'Cream'] }],
    active: true,
    sortOrder: 3
  },
  {
    name: 'Mini ghost keychain',
    slug: 'mini-ghost-keychain',
    category: 'Keychains',
    material: 'Crochet',
    price: 220,
    imageUrl: 'ghost',
    description: 'A tiny crocheted ghost with rosy cheeks and black bead eyes. The cream one wears a pink bow.',
    options: [{ label: 'Style', choices: ['Black ghost', 'Cream ghost with bow', 'One of each (2 pieces)'] }],
    active: true,
    sortOrder: 4
  },
  {
    name: 'Strawberry swiss roll',
    slug: 'strawberry-swiss-roll',
    category: 'Keychains',
    material: 'Crochet',
    price: 180,
    imageUrl: 'swiss',
    description: 'A crocheted swiss roll topped with cream and a cherry. Sweet enough to look at, safe to carry.',
    options: [{ label: 'Topping', choices: ['Cherry', 'Strawberry'] }],
    active: true,
    sortOrder: 5
  },
  {
    name: 'Beaded phone charm',
    slug: 'beaded-phone-charm',
    category: 'Phone charms',
    material: 'Beads',
    price: 150,
    imageUrl: 'charm',
    description: 'Glass and acrylic beads with little hearts on a strong loop cord. Fits any phone case with a hole.',
    options: [{ label: 'Colour set', choices: ['Pink hearts', 'Mint hearts', 'Sunset mix', 'Surprise me'] }],
    active: true,
    sortOrder: 6
  },
  {
    name: 'Crochet lily keychain',
    slug: 'crochet-lily-keychain',
    category: 'Keychains',
    material: 'Crochet',
    price: 260,
    imageUrl: 'lily',
    description: 'A big blooming lily in pink wool with stamens and a green leaf.',
    options: [{ label: 'Petal colour', choices: ['Pink', 'White', 'Yellow', 'Peach'] }],
    active: true,
    sortOrder: 7
  }
];

export async function seedInitialData(): Promise<void> {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding initial products into MongoDB...');
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} products successfully.`);
    }

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      console.log('🌱 Initializing shop settings...');
      await Settings.create({
        shippingFee: 60,
        codCity: 'dibrugarh',
        ownerEmail: config.ownerEmail
      });
      console.log('✅ Shop settings initialized.');
    }
  } catch (err) {
    console.error('⚠️ Product seed warning:', err);
  }
}
