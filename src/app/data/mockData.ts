// Mock data mirroring the Supabase schema
// Replace with real Supabase queries when connected

export interface Package {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  destination_ar: string;
  destination_en: string;
  price: number;
  currency: string;
  pricing_model?: 'fixed' | 'rate_matrix';
  rate_matrix?: unknown[];
  duration_days: number;
  departure_city: string;
  max_travelers: number;
  cover_image_url: string;
  gallery_urls: string[];
  includes_ar: string[];
  includes_en: string[];
  excludes_ar: string[];
  excludes_en: string[];
  trip_type: 'internal' | 'external';
  is_featured: boolean;
  is_active: boolean;
  status?: 'draft' | 'published' | 'archived';
  version?: number;
  updated_at?: string;
  published_at?: string | null;
  archived_at?: string | null;
  travel_dates?: string;
  availability?: string;
  expiry_date?: string;
  seo_title_en?: string;
  seo_title_ar?: string;
  seo_description_en?: string;
  seo_description_ar?: string;
  created_at: string;
  flag: string;
  itinerary_en: { day: number; title: string; description: string }[];
  itinerary_ar: { day: number; title: string; description: string }[];
}

export interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  content_ar: string;
  content_en: string;
  cover_image_url: string;
  category: string;
  author: string;
  published_at: string;
  is_published: boolean;
}

export interface TeamMember {
  approval_status?: 'draft' | 'pending' | 'approved';
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  photo_url: string;
  display_order: number;
}

export interface Stats {
  happy_clients: number;
  trips_organized: number;
  years_experience: number;
  destinations: number;
}

export const stats: Stats = {
  happy_clients: 12500,
  trips_organized: 3800,
  years_experience: 15,
  destinations: 65,
};

export const packages: Package[] = [
  {
    id: '1',
    slug: 'maldives-luxury-7',
    title_ar: 'جزر المالديف الفاخرة',
    title_en: 'Luxury Maldives Escape',
    description_ar: 'استمتع بأروع الشعاب المرجانية وأبيض رمال المالديف في إقامة فاخرة بالفيلا المائية.',
    description_en: 'Immerse yourself in crystal-clear waters and pristine beaches with an overwater villa stay in the Maldives.',
    destination_ar: 'جزر المالديف',
    destination_en: 'Maldives',
    price: 8500,
    currency: 'SAR',
    duration_days: 7,
    departure_city: 'Riyadh',
    max_travelers: 20,
    cover_image_url: 'https://images.unsplash.com/photo-1751699123652-c2c585e19d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [
      'https://images.unsplash.com/photo-1578754067449-838743bcec20?w=800',
      'https://images.unsplash.com/photo-1602681797891-a1003186de8c?w=800',
      'https://images.unsplash.com/photo-1655736829976-f6d7745b8619?w=800',
      'https://images.unsplash.com/photo-1662633271445-ccd34aa2fc8c?w=800',
    ],
    includes_en: ['Round-trip flights', 'Airport transfers', '7 nights overwater villa', 'Daily breakfast & dinner', 'Snorkeling equipment', 'Spa access'],
    includes_ar: ['رحلات جوية ذهاباً وإياباً', 'النقل من/إلى المطار', '٧ ليالٍ في فيلا فوق الماء', 'إفطار وعشاء يومي', 'معدات الغطس', 'دخول منتجع الصحة'],
    excludes_en: ['Personal expenses', 'Travel insurance', 'Optional excursions'],
    excludes_ar: ['المصاريف الشخصية', 'تأمين السفر', 'الجولات الاختيارية'],
    trip_type: 'external',
    is_featured: true,
    is_active: true,
    created_at: '2026-01-15T00:00:00Z',
    flag: '🇲🇻',
    itinerary_en: [
      { day: 1, title: 'Arrival & Welcome', description: 'Arrive in Malé, seaplane transfer to your resort. Check-in and welcome dinner.' },
      { day: 2, title: 'Beach & Snorkeling', description: 'Morning snorkeling tour, afternoon on the beach, sunset cocktails.' },
      { day: 3, title: 'Spa & Relaxation', description: 'Full spa day with traditional treatments and private pool access.' },
      { day: 4, title: 'Island Hopping', description: 'Visit nearby local islands, dolphin watching cruise at sunset.' },
      { day: 5, title: 'Water Sports', description: 'Kayaking, paddle boarding, and glass-bottom boat tour.' },
      { day: 6, title: 'Free Day', description: 'Leisure day — explore the resort or book optional excursions.' },
      { day: 7, title: 'Departure', description: 'Breakfast, check-out, seaplane transfer to Malé airport.' },
    ],
    itinerary_ar: [
      { day: 1, title: 'الوصول والترحيب', description: 'الوصول إلى ماليه، انتقال بالطائرة المائية إلى المنتجع. تسجيل الوصول وعشاء الترحيب.' },
      { day: 2, title: 'الشاطئ والغطس', description: 'جولة غطس صباحية، بعد الظهر على الشاطئ، كوكتيلات غروب الشمس.' },
      { day: 3, title: 'السبا والاسترخاء', description: 'يوم كامل في السبا مع علاجات تقليدية وإمكانية الوصول إلى المسبح الخاص.' },
      { day: 4, title: 'التنقل بين الجزر', description: 'زيارة الجزر المحلية المجاورة، رحلة مشاهدة الدلافين عند الغروب.' },
      { day: 5, title: 'الرياضات المائية', description: 'التجديف، التزلج على الماء، وجولة بالقارب ذو القاع الزجاجي.' },
      { day: 6, title: 'يوم حر', description: 'يوم للترفيه — استكشف المنتجع أو احجز رحلات اختيارية.' },
      { day: 7, title: 'المغادرة', description: 'إفطار، تسجيل المغادرة، انتقال بالطائرة المائية إلى مطار ماليه.' },
    ],
  },
  {
    id: '2',
    slug: 'paris-europe-10',
    title_ar: 'باريس وأوروبا الساحرة',
    title_en: 'Paris & European Charm',
    description_ar: 'اكتشف سحر باريس وأجمل المدن الأوروبية في جولة عشرة أيام لا تُنسى.',
    description_en: 'Experience the romance of Paris and charm of Europe\'s finest cities in this 10-day grand tour.',
    destination_ar: 'فرنسا / أوروبا',
    destination_en: 'France / Europe',
    price: 12000,
    currency: 'SAR',
    duration_days: 10,
    departure_city: 'Jeddah',
    max_travelers: 25,
    cover_image_url: 'https://images.unsplash.com/photo-1655736829976-f6d7745b8619?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [
      'https://images.unsplash.com/photo-1662633271445-ccd34aa2fc8c?w=800',
      'https://images.unsplash.com/photo-1751699123652-c2c585e19d97?w=800',
    ],
    includes_en: ['Flights from Jeddah', 'Hotel accommodations (4-star)', 'Daily breakfast', 'Guided city tours', 'Museum entries', 'Eurostar/TGV rail tickets'],
    includes_ar: ['رحلات من جدة', 'إقامة فندقية (٤ نجوم)', 'إفطار يومي', 'جولات مع مرشد سياحي', 'دخول المتاحف', 'تذاكر القطار السريع'],
    excludes_en: ['Lunch & dinner', 'Personal shopping', 'Optional activities'],
    excludes_ar: ['الغداء والعشاء', 'التسوق الشخصي', 'الأنشطة الاختيارية'],
    trip_type: 'external',
    is_featured: true,
    is_active: true,
    created_at: '2026-01-20T00:00:00Z',
    flag: '🇫🇷',
    itinerary_en: [
      { day: 1, title: 'Arrival in Paris', description: 'Arrive at CDG, transfer to hotel, evening Seine river cruise.' },
      { day: 2, title: 'Paris Icons', description: 'Eiffel Tower, Louvre Museum, Champs-Élysées stroll.' },
      { day: 3, title: 'Versailles Day Trip', description: 'Full day at Palace of Versailles and its magnificent gardens.' },
      { day: 4, title: 'Montmartre & Art', description: 'Sacré-Cœur, artist quarter, and Musée d\'Orsay.' },
      { day: 5, title: 'Travel to Amsterdam', description: 'High-speed Thalys train to Amsterdam. Canal boat tour.' },
    ],
    itinerary_ar: [
      { day: 1, title: 'الوصول إلى باريس', description: 'الوصول إلى مطار CDG، انتقال إلى الفندق، جولة نهر السين مساءً.' },
      { day: 2, title: 'معالم باريس', description: 'برج إيفل، متحف اللوفر، جولة على شانزيليزيه.' },
    ],
  },
  {
    id: '3',
    slug: 'istanbul-heritage-5',
    title_ar: 'إسطنبول الحضارة والتاريخ',
    title_en: 'Istanbul Heritage Journey',
    description_ar: 'اغمر نفسك في عراقة إسطنبول، حيث تلتقي القارات وتتداخل الحضارات.',
    description_en: 'Immerse yourself in Istanbul\'s rich history where continents and civilizations meet.',
    destination_ar: 'تركيا',
    destination_en: 'Turkey',
    price: 4500,
    currency: 'SAR',
    duration_days: 5,
    departure_city: 'Riyadh',
    max_travelers: 30,
    cover_image_url: 'https://images.unsplash.com/photo-1662633271445-ccd34aa2fc8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [],
    includes_en: ['Round-trip flights', '5-star hotel', 'Daily breakfast', 'Guided Bosphorus tour', 'Hagia Sophia & Blue Mosque entry'],
    includes_ar: ['رحلات جوية ذهاباً وإياباً', 'فندق ٥ نجوم', 'إفطار يومي', 'جولة البوسفور مع مرشد', 'دخول آيا صوفيا والجامع الأزرق'],
    excludes_en: ['Lunch & dinner', 'Shopping', 'Tips'],
    excludes_ar: ['الغداء والعشاء', 'التسوق', 'الإكراميات'],
    trip_type: 'external',
    is_featured: true,
    is_active: true,
    created_at: '2026-02-01T00:00:00Z',
    flag: '🇹🇷',
    itinerary_en: [
      { day: 1, title: 'Welcome to Istanbul', description: 'Airport pickup, hotel check-in, evening in Sultanahmet.' },
      { day: 2, title: 'Old City Tour', description: 'Hagia Sophia, Blue Mosque, Topkapi Palace, Grand Bazaar.' },
    ],
    itinerary_ar: [
      { day: 1, title: 'أهلاً في إسطنبول', description: 'الاستقبال من المطار، تسجيل الوصول، مساء في السلطانأحمد.' },
    ],
  },
  {
    id: '4',
    slug: 'bali-nature-8',
    title_ar: 'بالي الطبيعة والروح',
    title_en: 'Bali Nature & Spirit',
    description_ar: 'اكتشف سحر جزيرة الآلهة مع مدرجاتها الخضراء ومعابدها الساحرة.',
    description_en: 'Discover the Island of the Gods with its emerald rice terraces and mystical temples.',
    destination_ar: 'إندونيسيا',
    destination_en: 'Indonesia',
    price: 6200,
    currency: 'SAR',
    duration_days: 8,
    departure_city: 'Riyadh',
    max_travelers: 20,
    cover_image_url: 'https://images.unsplash.com/photo-1578754067449-838743bcec20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [],
    includes_en: ['Flights', 'Villa accommodation', 'Daily breakfast', 'Ubud tour', 'Tanah Lot sunset tour', 'Airport transfers'],
    includes_ar: ['الرحلات الجوية', 'إقامة في فيلا', 'إفطار يومي', 'جولة أوبود', 'جولة تاناه لوت عند الغروب', 'نقل من/إلى المطار'],
    excludes_en: ['Meals not mentioned', 'Personal expenses'],
    excludes_ar: ['الوجبات غير المذكورة', 'المصاريف الشخصية'],
    trip_type: 'external',
    is_featured: true,
    is_active: true,
    created_at: '2026-02-10T00:00:00Z',
    flag: '🇮🇩',
    itinerary_en: [{ day: 1, title: 'Arrival in Bali', description: 'Airport transfer, resort check-in, welcome dinner.' }],
    itinerary_ar: [{ day: 1, title: 'الوصول إلى بالي', description: 'انتقال من المطار، تسجيل الوصول في المنتجع، عشاء ترحيبي.' }],
  },
  {
    id: '5',
    slug: 'japan-cherry-12',
    title_ar: 'اليابان أرض الكرز والعجائب',
    title_en: 'Japan Cherry Blossom Journey',
    description_ar: 'تجربة اليابان في أبهى صورها خلال موسم أزهار الكرز وبين مدنها العريقة.',
    description_en: 'Experience Japan at its most beautiful during cherry blossom season through its ancient cities.',
    destination_ar: 'اليابان',
    destination_en: 'Japan',
    price: 15000,
    currency: 'SAR',
    duration_days: 12,
    departure_city: 'Riyadh',
    max_travelers: 15,
    cover_image_url: 'https://images.unsplash.com/photo-1616496677370-e7e95e63b693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [],
    includes_en: ['Flights', '4-star hotels', 'JR Pass (14-day)', 'Daily breakfast', 'Tokyo & Kyoto tours', 'Tea ceremony'],
    includes_ar: ['الرحلات الجوية', 'فنادق ٤ نجوم', 'تصريح JR (١٤ يوماً)', 'إفطار يومي', 'جولات طوكيو وكيوتو', 'حفل الشاي'],
    excludes_en: ['Visa fees', 'Most meals', 'Personal expenses'],
    excludes_ar: ['رسوم التأشيرة', 'معظم الوجبات', 'المصاريف الشخصية'],
    trip_type: 'external',
    is_featured: true,
    is_active: true,
    created_at: '2026-02-15T00:00:00Z',
    flag: '🇯🇵',
    itinerary_en: [{ day: 1, title: 'Arrival in Tokyo', description: 'Land at Narita, Shinjuku hotel, evening Shibuya crossing.' }],
    itinerary_ar: [{ day: 1, title: 'الوصول إلى طوكيو', description: 'المطار، فندق شينجوكو، مساء في تقاطع شيبويا.' }],
  },
  {
    id: '6',
    slug: 'morocco-culture-6',
    title_ar: 'المغرب روح الحضارة',
    title_en: 'Morocco Cultural Odyssey',
    description_ar: 'استكشف أزقة المدينة القديمة في مراكش وفاس واكتشف سحر المغرب الخلاب.',
    description_en: 'Explore the winding medinas of Marrakech and Fes, and discover the enchanting beauty of Morocco.',
    destination_ar: 'المغرب',
    destination_en: 'Morocco',
    price: 5800,
    currency: 'SAR',
    duration_days: 6,
    departure_city: 'Jeddah',
    max_travelers: 25,
    cover_image_url: 'https://images.unsplash.com/photo-1602681797891-a1003186de8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [],
    includes_en: ['Flights', 'Riad accommodation', 'Daily breakfast', 'Marrakech & Fes tours', 'Desert excursion', 'Transfers'],
    includes_ar: ['الرحلات الجوية', 'إقامة في الرياض', 'إفطار يومي', 'جولات مراكش وفاس', 'رحلة الصحراء', 'المواصلات'],
    excludes_en: ['Visa (if applicable)', 'Dinners', 'Shopping'],
    excludes_ar: ['التأشيرة (إن وجدت)', 'العشاء', 'التسوق'],
    trip_type: 'external',
    is_featured: true,
    is_active: true,
    created_at: '2026-02-20T00:00:00Z',
    flag: '🇲🇦',
    itinerary_en: [{ day: 1, title: 'Arrival in Marrakech', description: 'Arrive, transfer to Riad, evening Djemaa el-Fna tour.' }],
    itinerary_ar: [{ day: 1, title: 'الوصول إلى مراكش', description: 'الوصول، انتقال إلى الرياض، جولة مساء في ساحة جامع الفنا.' }],
  },
  {
    id: '7',
    slug: 'dubai-weekend-3',
    title_ar: 'دبي عطلة الأسبوع الفاخرة',
    title_en: 'Dubai Luxury Weekend',
    description_ar: 'عطلة نهاية أسبوع فاخرة في دبي تجمع بين التسوق والترفيه وأرقى الفنادق.',
    description_en: 'A premium weekend getaway in Dubai combining world-class shopping, entertainment, and luxury hotels.',
    destination_ar: 'الإمارات',
    destination_en: 'UAE',
    price: 2800,
    currency: 'SAR',
    duration_days: 3,
    departure_city: 'Riyadh',
    max_travelers: 40,
    cover_image_url: 'https://images.unsplash.com/photo-1768069794857-9306ac167c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [],
    includes_en: ['Flights', '5-star hotel (3 nights)', 'Breakfast', 'Dubai Mall & Burj Khalifa entry', 'Desert safari'],
    includes_ar: ['الرحلات الجوية', 'فندق ٥ نجوم (٣ ليالٍ)', 'إفطار', 'دخول دبي مول وبرج خليفة', 'سفاري الصحراء'],
    excludes_en: ['Dinners', 'Personal shopping', 'Optional tours'],
    excludes_ar: ['العشاء', 'التسوق الشخصي', 'الجولات الاختيارية'],
    trip_type: 'external',
    is_featured: false,
    is_active: true,
    created_at: '2026-02-25T00:00:00Z',
    flag: '🇦🇪',
    itinerary_en: [{ day: 1, title: 'Arrival in Dubai', description: 'Fly in, hotel check-in, evening at Dubai Marina.' }],
    itinerary_ar: [{ day: 1, title: 'الوصول إلى دبي', description: 'الوصول، تسجيل الوصول، مساء في مرسى دبي.' }],
  },
  {
    id: '8',
    slug: 'saudi-al-ula-4',
    title_ar: 'العُلا كنز الجزيرة العربية',
    title_en: 'AlUla – Arabia\'s Hidden Gem',
    description_ar: 'استكشف روائع العُلا الأثرية ومقبرة الحِجر وجمال الصخور الوردية في رحلة لا تُنسى.',
    description_en: 'Explore the archaeological wonders of AlUla, Hegra, and the breathtaking pink rock formations.',
    destination_ar: 'السعودية – العُلا',
    destination_en: 'Saudi Arabia – AlUla',
    price: 3200,
    currency: 'SAR',
    duration_days: 4,
    departure_city: 'Riyadh',
    max_travelers: 20,
    cover_image_url: 'https://images.unsplash.com/photo-1734293047434-82b605dd29b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    gallery_urls: [],
    includes_en: ['Domestic flight or transport', 'Luxury camp stay', 'All meals', 'Guided Hegra tour', 'Elephant Rock visit', 'Stargazing experience'],
    includes_ar: ['رحلة داخلية أو مواصلات', 'إقامة في المخيم الفاخر', 'جميع الوجبات', 'جولة الحِجر مع مرشد', 'زيارة صخرة الفيل', 'تجربة مراقبة النجوم'],
    excludes_en: ['Personal expenses', 'Souvenirs'],
    excludes_ar: ['المصاريف الشخصية', 'التذكارات'],
    trip_type: 'internal',
    is_featured: false,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
    flag: '🇸🇦',
    itinerary_en: [{ day: 1, title: 'Arrival in AlUla', description: 'Fly to AlUla, camp check-in, sunset at Elephant Rock.' }],
    itinerary_ar: [{ day: 1, title: 'الوصول إلى العُلا', description: 'الوصول، تسجيل الوصول في المخيم، غروب الشمس عند صخرة الفيل.' }],
  },
];

export const articles: Article[] = [
  {
    id: '1',
    slug: 'top-destinations-2026',
    title_ar: 'أفضل ١٠ وجهات سياحية لعام ٢٠٢٦',
    title_en: 'Top 10 Travel Destinations for 2026',
    excerpt_ar: 'اكتشف الوجهات الأكثر طلباً هذا العام، من شواطئ المالديف إلى مدن أوروبا التاريخية.',
    excerpt_en: 'Discover the most sought-after destinations this year, from Maldives beaches to Europe\'s historic cities.',
    content_ar: 'محتوى المقال التفصيلي باللغة العربية... يُعدّ عام ٢٠٢٦ من أكثر الأعوام إثارة في عالم السياحة، حيث تتصدر جزر المالديف قائمة الوجهات الأكثر طلباً للأزواج والعائلات على حد سواء.',
    content_en: 'Detailed article content in English... The year 2026 is shaping up to be one of the most exciting years in travel, with the Maldives topping wish lists for couples and families alike. From the romance of Paris to the ancient wonders of Japan, this year\'s top destinations offer something for every type of traveler.',
    cover_image_url: 'https://images.unsplash.com/photo-1751699123652-c2c585e19d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'destinations',
    author: 'Editorial Team',
    published_at: '2026-01-15T00:00:00Z',
    is_published: true,
  },
  {
    id: '2',
    slug: 'schengen-visa-tips',
    title_ar: 'نصائح ذهبية للحصول على تأشيرة شنغن',
    title_en: 'Golden Tips for Getting Your Schengen Visa',
    excerpt_ar: 'دليلك الشامل لتقديم طلب تأشيرة شنغن بنجاح من المملكة العربية السعودية والأردن.',
    excerpt_en: 'Your complete guide to successfully applying for a Schengen visa from Saudi Arabia and Jordan.',
    content_ar: 'محتوى تفصيلي عن التأشيرة الشنغن...',
    content_en: 'Detailed content about Schengen visa process...',
    cover_image_url: 'https://images.unsplash.com/photo-1672831131396-72c5e85aba44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'tips',
    author: 'Visa Team',
    published_at: '2026-01-28T00:00:00Z',
    is_published: true,
  },
  {
    id: '3',
    slug: 'family-travel-guide',
    title_ar: 'دليل السفر العائلي: أفضل الوجهات للأطفال',
    title_en: 'Family Travel Guide: Best Destinations for Kids',
    excerpt_ar: 'اختر الوجهة المثالية لعائلتك مع أفضل الأماكن ترفيهاً وسلامةً للأطفال.',
    excerpt_en: 'Choose the perfect family destination with the safest and most fun places for children.',
    content_ar: 'محتوى دليل السفر العائلي...',
    content_en: 'Family travel guide content...',
    cover_image_url: 'https://images.unsplash.com/photo-1578754067449-838743bcec20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'tips',
    author: 'Travel Experts',
    published_at: '2026-02-05T00:00:00Z',
    is_published: true,
  },
  {
    id: '4',
    slug: 'japan-cherry-blossom-season',
    title_ar: 'موسم الكرز في اليابان: متى وكيف تسافر؟',
    title_en: 'Japan Cherry Blossom Season: When and How to Visit',
    excerpt_ar: 'كل ما تحتاج معرفته لتخطيط رحلتك إلى اليابان خلال موسم أزهار الكرز.',
    excerpt_en: 'Everything you need to know to plan your Japan trip during the cherry blossom season.',
    content_ar: 'محتوى عن موسم الكرز في اليابان...',
    content_en: 'Cherry blossom season content...',
    cover_image_url: 'https://images.unsplash.com/photo-1616496677370-e7e95e63b693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'destinations',
    author: 'Asia Desk',
    published_at: '2026-02-20T00:00:00Z',
    is_published: true,
  },
];

export const teamMembers: TeamMember[] = [
  { id: 'approved-abdullah', name_ar: 'عبدالله الطوالبة', name_en: 'Abdullah Al Tawalbeh', role_ar: 'المدير العام', role_en: 'General Manager', photo_url: '', display_order: 1, approval_status: 'approved' },
  { id: 'approved-nabeel', name_ar: 'نبيل أحمد', name_en: 'Nabeel Ahmad', role_ar: 'مسؤول التذاكر', role_en: 'Ticketing Officer', photo_url: '', display_order: 2, approval_status: 'approved' },
  { id: 'approved-farhan', name_ar: 'فرحان إسحاق', name_en: 'Farhan Ishaq', role_ar: 'مسؤول التذاكر', role_en: 'Ticketing Officer', photo_url: '', display_order: 3, approval_status: 'approved' },
];
