import type {
  Product,
  ProductImage,
  ProductVariant,
} from "@/types/product";

/**
 * NEXTCART — Development Product Catalogue
 *
 * Temporary frontend seed/mock data.
 * The production catalogue will eventually come from Spring Boot.
 */

const image = (
  id: number,
  url: string,
  alt: string,
  isPrimary = true,
): ProductImage => ({
  id,
  url,
  alt,
  sortOrder: 0,
  isPrimary,
});

const variant = (
  id: number,
  sku: string,
  options: {
    size?: string;
    color?: string;
    storage?: string;
    price?: number;
    quantity?: number;
  } = {},
): ProductVariant => {
  const quantity = options.quantity ?? 20;

  return {
    id,
    sku,
    size: options.size ?? null,
    color: options.color ?? null,
    storage: options.storage ?? null,
    price: options.price,
    inventory: {
      quantity,
      reservedQty: 0,
      available: quantity,
    },
  };
};

interface SeedDefinition {
  title: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  color?: string;
  highlights?: string[];
  keywords?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  warranty?: string;
  delivery?: string;
  stock?: number;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const createProduct = (
  id: number,
  data: SeedDefinition,
): Product => {
  // Build the slug from the title, but prepend the brand only when the
  // title does not already start with the brand name. This keeps
  // "Apple iPhone 16" → "apple-iphone-16" while preventing two
  // differently-branded "1.5 Ton 5 Star Split AC"s from colliding.
  const titleSlug = slugify(data.title);
  const brandSlug = slugify(data.brand);
  const slug = titleSlug.startsWith(`${brandSlug}-`)
    ? titleSlug
    : `${brandSlug}-${titleSlug}`;

  const discount =
    data.originalPrice && data.originalPrice > data.price
      ? Math.round(
          ((data.originalPrice - data.price) /
            data.originalPrice) *
            100,
        )
      : undefined;

  const quantity = data.stock ?? 20;

  return {
    id,
    slug,
    title: data.title,
    description: data.description,

    brand: data.brand,
    category: data.category,

    image: data.image,
    images: [image(id * 10, data.image, data.title)],

    price: data.price,
    originalPrice: data.originalPrice,
    discount,

    rating: data.rating ?? 4.5,
    reviews: data.reviews ?? 100,

    stock: quantity,

    inventory: {
      quantity,
      reservedQty: 0,
      available: quantity,
    },

    variants: data.variants,

    featured: data.featured ?? false,
    bestseller: data.bestseller ?? false,
    newArrival: data.newArrival ?? false,

    highlights: data.highlights ?? [],
    specifications: data.specifications ?? {},

    keywords: data.keywords ?? [
      data.brand.toLowerCase(),
      data.category.toLowerCase(),
    ],

    color: data.color,
    warranty: data.warranty,
    delivery: data.delivery ?? "Free Delivery",
  };
};

/* =========================================================
   IMAGE ASSETS
   =========================================================
   Every entry below MUST point to a file that exists under
   frontend/public/. The product image registry in
   `utils/productImages.ts` is the canonical resolver, but keeping the
   raw mock data self-consistent protects every direct consumer of
   `data/products` (tests, future scripts) from 400s. */

const images = {
  iphone16: "/products/mobiles/iphone16.png",
  iphone16pro: "/products/mobiles/iphone16pro.png",
  s25ultra: "/products/mobiles/s25ultra.png",
  a56: "/products/mobiles/a56.png",
  /* Mobiles that do not have a per-product photo fall back to the
     closest real asset (s25ultra / a56). */
  oneplus13: "/products/mobiles/s25ultra.png",
  pixel10: "/products/mobiles/iphone16.png",
  nothing3: "/products/mobiles/iphone16pro.png",
  xiaomi15: "/products/mobiles/s25ultra.png",
  realme8: "/products/mobiles/a56.png",
  motorola60: "/products/mobiles/iphone16pro.png",
};

const fallbackImages = {
  laptop: "/products/laptops/macbook.png",
  tablet: images.iphone16,
  audio: "/products/electronics/headphones.png",
  tv: "/products/tv.png",
  appliance: "/products/tv.png",
  fashion: "/products/tshirt.png",
  footwear: "/products/shoes.png",
  home: "/products/watch/AppleWatchSeries11.png",
  beauty: "/products/bag.png",
  grocery: "/products/bag.png",
  gaming: "/products/electronics/headphones.png",
  sports: "/products/shoes.png",
  books: "/products/bag.png",
  kids: "/products/bag.png",
};

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Important:
 * The tuple type prevents TypeScript from inferring
 * title/brand/price as string | number.
 */
type BasicSeed = readonly [title: string, brand: string, price: number];

const makeBasicSeeds = (
  rows: readonly BasicSeed[],
  config: {
    category: string;
    description: (title: string, brand: string) => string;
    image: string;
    multiplier?: number;
    ratingBase?: number;
    reviewBase?: number;
    stockBase?: number;
    featured?: (index: number) => boolean;
    bestseller?: (index: number) => boolean;
    newArrival?: (index: number) => boolean;
    keywords?: (title: string, brand: string) => string[];
  },
): SeedDefinition[] =>
  rows.map(([title, brand, price], index) => ({
    title,
    brand,
    category: config.category,
    description: config.description(title, brand),
    price,
    originalPrice: Math.round(
      price * (config.multiplier ?? 1.15),
    ),
    image: config.image,
    rating:
      (config.ratingBase ?? 4.2) +
      ((index % 5) * 0.1),
    reviews:
      (config.reviewBase ?? 100) +
      index * 25,
    stock:
      (config.stockBase ?? 15) +
      index,
    featured: config.featured?.(index) ?? false,
    bestseller: config.bestseller?.(index) ?? false,
    newArrival: config.newArrival?.(index) ?? false,
    keywords:
      config.keywords?.(title, brand) ?? [
        title.toLowerCase(),
        brand.toLowerCase(),
        config.category.toLowerCase(),
      ],
  }));

/* =========================================================
   MOBILE PHONES
   ========================================================= */

const mobiles: SeedDefinition[] = [
  {
    title: "Apple iPhone 16",
    brand: "Apple",
    category: "Mobiles",
    description:
      "Apple iPhone 16 with A18 chip, advanced camera system and Super Retina XDR display.",
    price: 79999,
    originalPrice: 89999,
    image: images.iphone16,
    rating: 4.8,
    reviews: 523,
    featured: true,
    bestseller: true,
    stock: 20,
    color: "Black",
    warranty: "1 Year Apple Warranty",
    highlights: [
      "Apple A18 Chip",
      "48MP Fusion Camera",
      "Super Retina XDR Display",
      "Face ID",
      "5G Connectivity",
    ],
    keywords: [
      "iphone",
      "apple",
      "ios",
      "smartphone",
      "mobile",
      "camera",
      "5g",
    ],
    variants: [
      variant(1001, "IP16-128-BLK", {
        storage: "128 GB",
        color: "Black",
        price: 79999,
      }),
      variant(1002, "IP16-256-BLU", {
        storage: "256 GB",
        color: "Blue",
        price: 89999,
        quantity: 14,
      }),
    ],
    specifications: {
      Display: "6.3-inch Super Retina XDR OLED",
      Processor: "Apple A18",
      RAM: "8 GB",
      Storage: "128 GB",
      Camera: "48MP + 12MP",
      OS: "iOS",
    },
  },
  {
    title: "Apple iPhone 16 Pro",
    brand: "Apple",
    category: "Mobiles",
    description:
      "Premium titanium iPhone with A18 Pro chip and professional camera system.",
    price: 119999,
    originalPrice: 129999,
    image: images.iphone16pro,
    rating: 4.9,
    reviews: 391,
    featured: true,
    bestseller: true,
    newArrival: true,
    stock: 12,
    color: "Natural Titanium",
    warranty: "1 Year Apple Warranty",
    highlights: [
      "Titanium Frame",
      "A18 Pro Chip",
      "ProMotion Display",
      "48MP Pro Camera",
      "5G Connectivity",
    ],
    keywords: [
      "iphone",
      "iphone pro",
      "apple",
      "a18 pro",
      "smartphone",
    ],
    variants: [
      variant(1101, "IP16P-128-TIT", {
        storage: "128 GB",
        color: "Titanium",
        price: 119999,
      }),
      variant(1102, "IP16P-256-BLK", {
        storage: "256 GB",
        color: "Black Titanium",
        price: 129999,
      }),
      variant(1103, "IP16P-512-NAT", {
        storage: "512 GB",
        color: "Natural Titanium",
        price: 149999,
      }),
    ],
  },
  {
    title: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    category: "Mobiles",
    description:
      "Samsung flagship smartphone with advanced AI features, S Pen and 200MP camera.",
    price: 124999,
    originalPrice: 134999,
    image: images.s25ultra,
    rating: 4.9,
    reviews: 864,
    featured: true,
    bestseller: true,
    newArrival: true,
    stock: 15,
    color: "Titanium Gray",
    warranty: "1 Year Samsung Warranty",
    highlights: [
      "200MP Camera",
      "S Pen",
      "Galaxy AI",
      "AMOLED Display",
      "5G Connectivity",
    ],
    keywords: [
      "samsung",
      "galaxy",
      "s25",
      "ultra",
      "android",
      "smartphone",
    ],
  },
  {
    title: "Samsung Galaxy A56 5G",
    brand: "Samsung",
    category: "Mobiles",
    description:
      "Feature-packed Samsung mid-range smartphone with AMOLED display and 5G.",
    price: 36999,
    originalPrice: 39999,
    image: images.a56,
    rating: 4.7,
    reviews: 245,
    bestseller: true,
    stock: 30,
    color: "Blue",
    warranty: "1 Year Samsung Warranty",
  },
  {
    title: "OnePlus 13",
    brand: "OnePlus",
    category: "Mobiles",
    description:
      "High-performance OnePlus flagship with fast charging and premium AMOLED display.",
    price: 69999,
    originalPrice: 74999,
    image: images.oneplus13,
    rating: 4.8,
    reviews: 310,
    featured: true,
    newArrival: true,
    stock: 28,
    color: "Black",
    warranty: "1 Year OnePlus Warranty",
  },
  {
    title: "Google Pixel 10",
    brand: "Google",
    category: "Mobiles",
    description:
      "Google Pixel smartphone with advanced AI photography and clean Android experience.",
    price: 84999,
    originalPrice: 89999,
    image: images.pixel10,
    rating: 4.8,
    reviews: 182,
    featured: true,
    newArrival: true,
    stock: 18,
    color: "White",
    warranty: "1 Year Google Warranty",
  },
  {
    title: "Nothing Phone 3",
    brand: "Nothing",
    category: "Mobiles",
    description:
      "Distinctive smartphone with transparent-inspired design and Glyph interface.",
    price: 54999,
    originalPrice: 59999,
    image: images.nothing3,
    rating: 4.7,
    reviews: 170,
    bestseller: true,
    newArrival: true,
    stock: 20,
    color: "White",
    warranty: "1 Year Warranty",
  },
  {
    title: "Xiaomi 15 Ultra",
    brand: "Xiaomi",
    category: "Mobiles",
    description:
      "Premium Xiaomi flagship with Leica camera system and high-performance processor.",
    price: 89999,
    originalPrice: 95999,
    image: images.xiaomi15,
    rating: 4.8,
    reviews: 143,
    featured: true,
    newArrival: true,
    stock: 16,
    color: "Silver",
  },
  {
    title: "Realme GT 8 Pro",
    brand: "Realme",
    category: "Mobiles",
    description:
      "Performance-focused smartphone designed for gaming and demanding applications.",
    price: 52999,
    originalPrice: 57999,
    image: images.realme8,
    rating: 4.6,
    reviews: 201,
    bestseller: true,
    newArrival: true,
    stock: 22,
  },
  {
    title: "Motorola Edge 60 Pro",
    brand: "Motorola",
    category: "Mobiles",
    description:
      "Premium Motorola smartphone with curved display and clean Android experience.",
    price: 45999,
    originalPrice: 49999,
    image: images.motorola60,
    rating: 4.6,
    reviews: 167,
    newArrival: true,
    stock: 25,
  },
];

/* =========================================================
   LAPTOPS
   ========================================================= */

const laptopsSeed: readonly BasicSeed[] = [
  ["MacBook Air M4", "Apple", 99999],
  ["MacBook Pro M4", "Apple", 169999],
  ["Galaxy Book5 Pro", "Samsung", 129999],
  ["Dell XPS 14", "Dell", 139999],
  ["Dell Inspiron 14", "Dell", 69999],
  ["HP Pavilion Plus", "HP", 74999],
  ["HP Victus Gaming", "HP", 89999],
  ["Lenovo IdeaPad Slim 5", "Lenovo", 64999],
  ["Lenovo Legion 5", "Lenovo", 109999],
  ["ASUS ROG Strix G16", "ASUS", 119999],
  ["ASUS Vivobook 15", "ASUS", 59999],
  ["Acer Aspire 5", "Acer", 54999],
];

const laptops: SeedDefinition[] = laptopsSeed.map(
  ([title, brand, price], index) => ({
    title,
    brand,
    category: "Laptops",
    description: `${brand} ${title} laptop with modern performance, display and battery life.`,
    price,
    originalPrice: Math.round(price * 1.1),
    // We have a single laptop photo on disk. The product image registry
    // maps a few specific slugs (MacBook, Dell) to their closest real
    // asset; everything else falls back to macbook.png here. The
    // on-disk reality is preserved at the data layer.
    image: fallbackImages.laptop,
    rating: 4.5,
    reviews: 100 + index * 10,
    stock: 20,
    featured: index < 3,
    bestseller: index < 2,
    newArrival: index >= 3,
    keywords: [
      title.toLowerCase(),
      brand.toLowerCase(),
      "laptop",
    ],
  }),
);

/* =========================================================
   TABLETS
   ========================================================= */

const tablets = makeBasicSeeds(
  [
    ["Apple iPad Air", "Apple", 59999],
    ["Apple iPad Pro", "Apple", 99999],
    ["Samsung Galaxy Tab S10", "Samsung", 74999],
    ["Samsung Galaxy Tab A9+", "Samsung", 21999],
    ["OnePlus Pad 2", "OnePlus", 39999],
    ["Xiaomi Pad 7", "Xiaomi", 29999],
    ["Lenovo Tab P12", "Lenovo", 32999],
    ["Lenovo Tab M11", "Lenovo", 17999],
    ["Realme Pad 2", "Realme", 19999],
    ["Honor Pad 10", "Honor", 24999],
  ],
  {
    category: "Tablets",
    description: (title, brand) =>
      `${brand} ${title} tablet with a large display, long battery life and modern performance.`,
    image: fallbackImages.tablet,
    multiplier: 1.08,
    ratingBase: 4.4,
    reviewBase: 90,
    stockBase: 12,
    featured: (i) => i < 2,
    bestseller: (i) => i % 3 === 0,
    newArrival: (i) => i % 2 === 0,
  },
);

/* =========================================================
   AUDIO
   ========================================================= */

const audio = makeBasicSeeds(
  [
    ["Apple AirPods Pro", "Apple", 24999],
    ["Apple AirPods 4", "Apple", 12999],
    ["Samsung Galaxy Buds3 Pro", "Samsung", 17999],
    ["OnePlus Buds Pro 3", "OnePlus", 9999],
    ["Sony WH-1000XM6", "Sony", 29999],
    ["Sony WF-1000XM5", "Sony", 19999],
    ["JBL Live 770NC", "JBL", 8999],
    ["JBL Tune 770NC", "JBL", 5999],
    ["Boat Nirvana Ion", "boAt", 2499],
    ["Boat Rockerz 450", "boAt", 1999],
    ["Nothing Ear", "Nothing", 8999],
    ["Sennheiser Momentum 4", "Sennheiser", 24999],
  ],
  {
    category: "Audio",
    description: (title, brand) =>
      `${brand} ${title} wireless audio device with immersive sound and all-day listening.`,
    image: fallbackImages.audio,
    multiplier: 1.15,
    ratingBase: 4.2,
    reviewBase: 300,
    stockBase: 15,
    bestseller: (i) => i % 2 === 0,
    newArrival: (i) => i % 4 === 0,
    keywords: (_, brand) => [
      "headphones",
      "earbuds",
      "audio",
      brand.toLowerCase(),
    ],
  },
);

/* =========================================================
   TELEVISIONS
   ========================================================= */

const televisions = makeBasicSeeds(
  [
    ["Samsung 55-inch 4K Smart TV", "Samsung", 54999],
    ["Samsung 65-inch Neo QLED TV", "Samsung", 119999],
    ["LG 55-inch OLED evo", "LG", 89999],
    ["LG 65-inch 4K UHD Smart TV", "LG", 74999],
    ["Sony Bravia 55-inch 4K", "Sony", 79999],
    ["Sony Bravia 65-inch OLED", "Sony", 149999],
    ["OnePlus 55-inch QLED TV", "OnePlus", 39999],
    ["TCL 55-inch C-Series QLED", "TCL", 44999],
    ["Xiaomi 55-inch X Pro", "Xiaomi", 42999],
    ["Vu 55-inch Masterpiece TV", "Vu", 49999],
  ],
  {
    category: "Televisions",
    description: (title, brand) =>
      `${brand} ${title} with smart features, high-resolution picture and immersive entertainment.`,
    image: fallbackImages.tv,
    multiplier: 1.12,
    ratingBase: 4.3,
    reviewBase: 150,
    stockBase: 5,
    featured: (i) => i < 3,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   HOME & KITCHEN
   ========================================================= */

const homeKitchen = makeBasicSeeds(
  [
    ["Prestige Electric Kettle", "Prestige", 1499],
    ["Philips Air Fryer", "Philips", 6999],
    ["Bajaj Mixer Grinder", "Bajaj", 3999],
    ["Prestige Induction Cooktop", "Prestige", 2299],
    ["Milton Thermosteel Bottle", "Milton", 899],
    ["Pigeon Electric Chopper", "Pigeon", 1199],
    ["Butterfly Gas Stove", "Butterfly", 2999],
    ["Havells Air Purifier", "Havells", 9999],
    ["IKEA Study Table", "IKEA", 8999],
    ["IKEA Office Chair", "IKEA", 7499],
    ["Wakefit Memory Foam Pillow", "Wakefit", 1299],
    ["Wakefit Mattress", "Wakefit", 11999],
    ["Cello Storage Container Set", "Cello", 799],
    ["Solimo Kitchen Rack", "Solimo", 1499],
  ],
  {
    category: "Home & Kitchen",
    description: (title, brand) =>
      `${brand} ${title} designed for practical everyday home use.`,
    image: fallbackImages.home,
    multiplier: 1.2,
    ratingBase: 4.1,
    reviewBase: 80,
    stockBase: 20,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   FASHION
   ========================================================= */

const mensFashion = makeBasicSeeds(
  [
    ["Regular Fit Cotton T-Shirt", "Roadster", 699],
    ["Slim Fit Casual Shirt", "Highlander", 1199],
    ["Men's Running Jacket", "HRX", 1999],
    ["Men's Slim Fit Jeans", "Levis", 2499],
    ["Men's Casual Chinos", "Allen Solly", 1799],
    ["Men's Polo T-Shirt", "U.S. Polo Assn.", 1299],
    ["Men's Formal Shirt", "Van Heusen", 1899],
    ["Men's Hooded Sweatshirt", "Puma", 2199],
    ["Men's Track Pants", "Adidas", 1999],
    ["Men's Winter Jacket", "Wildcraft", 2999],
  ],
  {
    category: "Men's Fashion",
    description: (title, brand) =>
      `${brand} ${title} made with comfortable materials for everyday wear.`,
    image: fallbackImages.fashion,
    multiplier: 1.35,
    ratingBase: 4.1,
    reviewBase: 120,
    stockBase: 30,
    bestseller: (i) => i % 3 === 0,
    newArrival: (i) => i % 4 === 0,
  },
).map((product, index) => ({
  ...product,
  variants: [
    variant(5000 + index, `${product.brand}-${index}-M-BLK`, {
      size: "M",
      color: "Black",
      price: product.price,
      quantity: 20,
    }),
    variant(5100 + index, `${product.brand}-${index}-L-BLU`, {
      size: "L",
      color: "Blue",
      price: product.price,
      quantity: 15,
    }),
  ],
}));

const womensFashion = makeBasicSeeds(
  [
    ["Women's Floral Kurta", "Biba", 1499],
    ["Women's Straight Fit Jeans", "Levis", 2299],
    ["Women's Casual Top", "ONLY", 1299],
    ["Women's Anarkali Kurta", "W", 2499],
    ["Women's Printed Saree", "Libas", 1899],
    ["Women's Denim Jacket", "ONLY", 2999],
    ["Women's Cotton Dress", "H&M", 1999],
    ["Women's Palazzo Pants", "Biba", 1299],
    ["Women's Winter Sweater", "Vero Moda", 2199],
    ["Women's Casual Shirt", "Zink London", 1599],
  ],
  {
    category: "Women's Fashion",
    description: (title, brand) =>
      `${brand} ${title} with a contemporary design and comfortable everyday fit.`,
    image: fallbackImages.fashion,
    multiplier: 1.3,
    ratingBase: 4.2,
    reviewBase: 140,
    stockBase: 25,
    bestseller: (i) => i % 3 === 0,
    newArrival: (i) => i % 2 === 0,
  },
);

/* =========================================================
   FOOTWEAR
   ========================================================= */

const footwear = makeBasicSeeds(
  [
    ["Men's Running Shoes", "Nike", 4999],
    ["Men's Air Max", "Nike", 8999],
    ["Men's Sports Shoes", "Adidas", 4499],
    ["Men's Casual Sneakers", "Puma", 2999],
    ["Women's Running Shoes", "Adidas", 3999],
    ["Women's Walking Shoes", "Skechers", 4999],
    ["Women's Casual Sneakers", "Puma", 2999],
    ["Men's Formal Shoes", "Bata", 2499],
    ["Women's Formal Heels", "Metro", 2299],
    ["Women's Sandals", "Mochi", 1799],
    ["Men's Flip Flops", "Sparx", 699],
    ["Kids Running Shoes", "Nike", 2499],
  ],
  {
    category: "Footwear",
    description: (title, brand) =>
      `${brand} ${title} designed for comfort, durability and everyday movement.`,
    image: fallbackImages.footwear,
    multiplier: 1.25,
    ratingBase: 4.2,
    reviewBase: 100,
    stockBase: 20,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   BEAUTY
   ========================================================= */

const beauty = makeBasicSeeds(
  [
    ["Vitamin C Face Serum", "Minimalist", 699],
    ["Hydrating Face Wash", "Cetaphil", 599],
    ["Moisturizing Cream", "CeraVe", 1199],
    ["Sunscreen SPF 50", "The Derma Co", 499],
    ["Hair Repair Shampoo", "L'Oreal", 699],
    ["Hair Conditioner", "Dove", 399],
    ["Lip Balm", "Nivea", 199],
    ["Body Lotion", "Vaseline", 349],
    ["Perfume Eau de Parfum", "Fogg", 899],
    ["Beard Trimmer", "Philips", 1699],
  ],
  {
    category: "Beauty & Personal Care",
    description: (title, brand) =>
      `${brand} ${title} for convenient everyday personal care.`,
    image: fallbackImages.beauty,
    multiplier: 1.2,
    ratingBase: 4.1,
    reviewBase: 90,
    stockBase: 30,
    bestseller: (i) => i % 2 === 0,
  },
);

/* =========================================================
   GROCERY
   ========================================================= */

const grocery = makeBasicSeeds(
  [
    ["Premium Basmati Rice 5kg", "India Gate", 699],
    ["Toor Dal 1kg", "Tata Sampann", 179],
    ["Fortune Sunflower Oil 5L", "Fortune", 699],
    ["Aashirvaad Atta 5kg", "Aashirvaad", 299],
    ["Tata Salt 1kg", "Tata", 28],
    ["Red Label Tea 1kg", "Brooke Bond", 499],
    ["Nescafe Classic Coffee", "Nescafe", 399],
    ["Corn Flakes 500g", "Kelloggs", 249],
    ["Oreo Biscuits Pack", "Oreo", 120],
    ["Mixed Dry Fruits 500g", "Happilo", 699],
    ["Honey 500g", "Dabur", 299],
    ["Peanut Butter 1kg", "Pintola", 549],
  ],
  {
    category: "Grocery",
    description: (title, brand) =>
      `${brand} ${title} suitable for everyday household consumption.`,
    image: fallbackImages.grocery,
    multiplier: 1.1,
    ratingBase: 4.2,
    reviewBase: 200,
    stockBase: 50,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   GAMING
   ========================================================= */

const gaming = makeBasicSeeds(
  [
    ["PlayStation 5 Slim", "Sony", 54999],
    ["Xbox Series X", "Microsoft", 54999],
    ["Nintendo Switch OLED", "Nintendo", 34999],
    ["DualSense Wireless Controller", "Sony", 5999],
    ["Xbox Wireless Controller", "Microsoft", 5499],
    ["Razer DeathAdder V3", "Razer", 6999],
    ["Logitech G502 Gaming Mouse", "Logitech", 5999],
    ["Razer BlackShark Headset", "Razer", 8999],
    ["Mechanical Gaming Keyboard", "Redragon", 3499],
    ["Gaming Monitor 27-inch", "LG", 19999],
  ],
  {
    category: "Gaming",
    description: (title, brand) =>
      `${brand} ${title} designed for immersive gaming and high-performance play.`,
    image: fallbackImages.gaming,
    multiplier: 1.12,
    ratingBase: 4.3,
    reviewBase: 150,
    stockBase: 8,
    featured: (i) => i < 3,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   SPORTS
   ========================================================= */

const sports = makeBasicSeeds(
  [
    ["Adjustable Dumbbell Set", "Amazon Basics", 4999],
    ["Yoga Mat 6mm", "Boldfit", 799],
    ["Resistance Bands Set", "Strauss", 599],
    ["Cricket Bat English Willow", "SG", 6999],
    ["Cricket Helmet", "SS", 2499],
    ["Football Size 5", "Nivia", 899],
    ["Badminton Racket", "Yonex", 2999],
    ["Tennis Racket", "Wilson", 5999],
    ["Running Shoes", "Asics", 6499],
    ["Fitness Smart Watch", "Amazfit", 7999],
  ],
  {
    category: "Sports & Fitness",
    description: (title, brand) =>
      `${brand} ${title} designed for sports, fitness and active lifestyles.`,
    image: fallbackImages.sports,
    multiplier: 1.2,
    ratingBase: 4.1,
    reviewBase: 80,
    stockBase: 15,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   BOOKS
   ========================================================= */

const books = makeBasicSeeds(
  [
    ["Atomic Habits", "James Clear", 499],
    ["The Psychology of Money", "Morgan Housel", 399],
    ["Ikigai", "Hector Garcia", 299],
    ["Rich Dad Poor Dad", "Robert Kiyosaki", 349],
    ["Clean Code", "Robert C. Martin", 799],
    ["The Pragmatic Programmer", "David Thomas", 899],
    ["Java: The Complete Reference", "Herbert Schildt", 999],
    ["You Don't Know JS", "Kyle Simpson", 599],
    ["Designing Data-Intensive Applications", "Martin Kleppmann", 1199],
    ["Introduction to Algorithms", "Thomas H. Cormen", 1499],
  ],
  {
    category: "Books",
    description: (title) =>
      `${title} — a popular book for readers interested in learning, technology and personal growth.`,
    image: fallbackImages.books,
    multiplier: 1.15,
    ratingBase: 4.4,
    reviewBase: 250,
    stockBase: 20,
    bestseller: () => true,
  },
);

/* =========================================================
   KIDS
   ========================================================= */

const kids = makeBasicSeeds(
  [
    ["Building Blocks Set", "LEGO", 2499],
    ["Remote Control Car", "Hot Wheels", 1499],
    ["Educational STEM Kit", "Smartivity", 1999],
    ["Kids Drawing Set", "Faber-Castell", 699],
    ["Plush Teddy Bear", "Hamleys", 999],
    ["Kids Puzzle Set", "Funskool", 499],
    ["Kids Bicycle", "Hero", 4999],
    ["Board Game", "Hasbro", 1299],
    ["Kids School Backpack", "Wildcraft", 1499],
    ["Kids Sports Shoes", "Skechers", 2499],
  ],
  {
    category: "Kids",
    description: (title, brand) =>
      `${brand} ${title} designed for learning, entertainment and everyday use.`,
    image: fallbackImages.kids,
    multiplier: 1.2,
    ratingBase: 4.2,
    reviewBase: 80,
    stockBase: 15,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   APPLIANCES
   ========================================================= */

const appliances = makeBasicSeeds(
  [
    ["1.5 Ton 5 Star Split AC", "LG", 44999],
    ["1.5 Ton 5 Star Split AC", "Daikin", 49999],
    ["Double Door Refrigerator 300L", "Samsung", 39999],
    ["Double Door Refrigerator 340L", "LG", 42999],
    ["Front Load Washing Machine 8kg", "LG", 34999],
    ["Front Load Washing Machine 9kg", "Samsung", 37999],
    ["Fully Automatic Washing Machine", "Whirlpool", 26999],
    ["Microwave Oven 28L", "IFB", 10999],
    ["Microwave Oven 25L", "Samsung", 9999],
    ["Dishwasher 14 Place", "Bosch", 49999],
    ["Water Purifier RO", "Kent", 12999],
    ["Water Purifier RO+UV", "Aquaguard", 14999],
  ],
  {
    category: "Appliances",
    description: (title, brand) =>
      `${brand} ${title} designed for efficient and convenient home living.`,
    image: fallbackImages.appliance,
    multiplier: 1.12,
    ratingBase: 4.2,
    reviewBase: 120,
    stockBase: 5,
    featured: (i) => i < 3,
    bestseller: (i) => i % 3 === 0,
  },
);

/* =========================================================
   FINAL CATALOGUE
   ========================================================= */

const seedProducts: SeedDefinition[] = [
  ...mobiles,
  ...laptops,
  ...tablets,
  ...audio,
  ...televisions,
  ...homeKitchen,
  ...mensFashion,
  ...womensFashion,
  ...footwear,
  ...beauty,
  ...grocery,
  ...gaming,
  ...sports,
  ...books,
  ...kids,
  ...appliances,
];

const products: Product[] = seedProducts.map(
  (product, index) => createProduct(index + 1, product),
);

export default products;