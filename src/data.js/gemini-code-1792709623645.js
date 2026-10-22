export const INITIAL_CATEGORIES = [
  {
    id: 'daily_needs',
    name: 'Daily Home Needs',
    badge: '10-20 Min Express',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
    flow: 'instant_goods'
  },
  {
    id: 'construction',
    name: 'Construction & Hardware',
    badge: 'Heavy / Auto Dispatch',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=80',
    flow: 'heavy_goods'
  },
  {
    id: 'medicines',
    name: 'Medicines & Pharmacy',
    badge: 'Priority Rx Delivery',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    flow: 'instant_goods'
  },
  {
    id: 'decorations',
    name: 'Decoration & Events',
    badge: 'Escrow & Live Bidding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80',
    flow: 'event_decor'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    categoryId: 'daily_needs',
    subCategoryBrand: 'Aashirvaad Select Sharbati Atta',
    shopName: 'Sri Laxmi Supermart',
    distanceKm: 0.8,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
    status: 'approved',
    variants: [
      { id: 'v1', label: '1 kg Pack', price: 58, weightGrams: 1000 },
      { id: 'v2', label: '5 kg Pack', price: 245, weightGrams: 5000 },
      { id: 'v3', label: '10 kg Sack', price: 475, weightGrams: 10000 }
    ]
  },
  {
    id: 'prod_2',
    categoryId: 'daily_needs',
    subCategoryBrand: 'Rytu Farm Fresh Red Onions',
    shopName: 'Adilabad Rytu Mandi',
    distanceKm: 0.6,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&auto=format&fit=crop&q=80',
    status: 'approved',
    variants: [
      { id: 'v4', label: '500 g', price: 18, weightGrams: 500 },
      { id: 'v5', label: '1 kg', price: 32, weightGrams: 1000 },
      { id: 'v6', label: '5 kg Bag', price: 150, weightGrams: 5000 },
      { id: 'v7', label: '25 kg Wholesale Sack', price: 700, weightGrams: 25000 }
    ]
  },
  {
    id: 'prod_3',
    categoryId: 'daily_needs',
    subCategoryBrand: 'Freedom Refined Sunflower Oil',
    shopName: 'Sri Laxmi Supermart',
    distanceKm: 0.8,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80',
    status: 'approved',
    variants: [
      { id: 'v8', label: '500 ml Pouch', price: 72, weightGrams: 500 },
      { id: 'v9', label: '1 Litre Pouch', price: 140, weightGrams: 1000 },
      { id: 'v10', label: '5 Litre Can', price: 685, weightGrams: 5000 },
      { id: 'v11', label: '15 Litre Tin', price: 2010, weightGrams: 15000 }
    ]
  },
  {
    id: 'prod_4',
    categoryId: 'construction',
    subCategoryBrand: 'UltraTech Super Cement (Grade 53)',
    shopName: 'Shri Ram Hardware & Steel',
    distanceKm: 1.9,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    status: 'approved',
    variants: [
      { id: 'v12', label: '1 Bag (50 kg)', price: 390, weightGrams: 50000 },
      { id: 'v13', label: '5 Bags (250 kg - 3W Auto)', price: 1920, weightGrams: 250000 },
      { id: 'v14', label: '20 Bags (1 Ton - Heavy Transport)', price: 7500, weightGrams: 1000000 }
    ]
  },
  {
    id: 'prod_5',
    categoryId: 'construction',
    subCategoryBrand: 'Tata Tiscon 550SD TMT Steel Bars',
    shopName: 'Shri Ram Hardware & Steel',
    distanceKm: 1.9,
    image: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=300&auto=format&fit=crop&q=80',
    status: 'approved',
    variants: [
      { id: 'v15', label: '8mm Rod Bundle (40 kg)', price: 2650, weightGrams: 40000 },
      { id: 'v16', label: '12mm Rod Quintal (100 kg)', price: 6400, weightGrams: 100000 },
      { id: 'v17', label: '16mm Full Lot (500 kg)', price: 31500, weightGrams: 500000 }
    ]
  },
  {
    id: 'prod_6',
    categoryId: 'medicines',
    subCategoryBrand: 'Dolo 650 & First-Aid Essentials Pack',
    shopName: 'Apollo Town Medics',
    distanceKm: 0.5,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    status: 'approved',
    variants: [
      { id: 'v18', label: '1 Strip (15 Tablets)', price: 32, weightGrams: 50 },
      { id: 'v19', label: '3 Strips Pack', price: 92, weightGrams: 150 },
      { id: 'v20', label: 'Home First-Aid Box', price: 340, weightGrams: 600 }
    ]
  }
];

export const INITIAL_FUNCTION_HALLS = [
  {
    id: 'hall_1',
    name: 'Royal Palace Function Hall, Adilabad',
    capacity: '800 Guests',
    pricePerDay: 45000,
    collateralVerified: true,
    bookedDates: ['2026-10-28'],
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'hall_2',
    name: 'Sri Sai Gardens & AC Convention',
    capacity: '1200 Guests',
    pricePerDay: 65000,
    collateralVerified: true,
    bookedDates: [],
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&auto=format&fit=crop&q=80'
  }
];

// Anonymous Decoration Service Modules (Provider names strictly hidden from consumer)
export const DECORATION_SERVICE_MODULES = [
  {
    id: 'dec_stage',
    title: 'Grand Royal Stage Decoration',
    programType: 'Wedding / Reception Stage',
    baseEstimate: 25000,
    features: ['Fresh Imported Orchids & Roses', 'LED Truss Warm Lighting', 'Velvet Maharaja Sofa & Backdrop'],
    samplePhotos: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'dec_haldi',
    title: 'Vibrant Marigold Haldi Setup',
    programType: 'Haldi Ceremony',
    baseEstimate: 12000,
    features: ['Yellow & Orange Marigold Canopy', 'Brass Urli Tub Setup', 'Floral Photo Booth Frame'],
    samplePhotos: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'dec_mehndi',
    title: 'Rajasthani Jhula Mehndi Decor',
    programType: 'Mehndi Night',
    baseEstimate: 14500,
    features: ['Decorated Floral Swing (Jhula)', 'Colorful Umbrella Ceiling', 'Bolster Cushion Seating'],
    samplePhotos: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'dec_sangeet',
    title: 'Concert LED Sangeet & Sound Stage',
    programType: 'Sangeet Ceremony',
    baseEstimate: 32000,
    features: ['P3 Matrix LED Wall', 'Cold Pyro & CO2 Jet Entry', 'JBL Line Array DJ Sound'],
    samplePhotos: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80'
    ]
  }
];

export const REJECTION_REASONS = [
  'Unclear or Low-Resolution Product Image',
  'Measurement / Weight Variant Missing',
  'Price Exceeds Local Town MRP Guidelines',
  'Incorrect Category Declaration',
  'Duplicate Brand Listing'
];