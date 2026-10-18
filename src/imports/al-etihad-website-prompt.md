Figma Make – Full Website Prompt
Al-Etihad for Travel & Tourism | الاتحاد للسفر والسياحة

🎯 PROJECT OVERVIEW
Build a complete, production-ready travel & tourism website for Al-Etihad Tours — a Saudi/Jordan-based agency offering international trips, visa services, car rental, and corporate travel. The site must be fully bilingual (Arabic RTL + English LTR), feel premium and trustworthy, and be structured to later connect to Supabase for dynamic data (packages, bookings, news).

🎨 DESIGN SYSTEM
Brand Colors
Primary Red:     #D32F2F  (dominant — 60%)
Deep Red:        #9A0007  (dark variant, hover states)
Light Red:       #FF6659  (accent, highlights)
Black:           #0D0D0D  (background dark mode)
Off-White:       #F5F0EB  (background light mode, body text on dark)
Warm Gray:       #8C8076  (secondary text, borders)
Card Background: #161616  (dark cards)
Success Green:   #2E7D32
Typography
Display / Headings (EN): "Playfair Display" — serif, bold, 700–900
Body (EN):               "DM Sans" — clean, 300–500 weight
Arabic Display:          "Noto Naskh Arabic" or "Cairo" — elegant, bold
Arabic Body:             "Tajawal" — highly readable, modern
Design Aesthetic: "Luxury Editorial Travel"

Dark hero sections with full-bleed photography
White/cream content sections — clean, breathable
Red used as a bold accent, not filler
Cards with subtle shadow and border, warm tones
Generous whitespace with intentional density on listing pages
Micro-animations: fade-up on scroll, image zoom on hover, smooth page transitions
RTL/LTR layout mirror: all spacing, icons, arrows flip correctly

Grid & Spacing
Max content width: 1280px
Column grid: 12-column
Gutter: 24px
Base spacing unit: 8px
Section padding: 80px top/bottom (40px mobile)
Border radius: 4px (sharp) for cards, 99px for badges/tags

📱 RESPONSIVE BREAKPOINTS
Mobile:  320px – 767px
Tablet:  768px – 1023px
Desktop: 1024px – 1280px
Wide:    1281px+

🗂️ PAGES TO BUILD

PAGE 1: HOMEPAGE /
Hero Section

Full-viewport height hero with a large destination photo background (dark overlay 50%)
Centered headline: large serif display font

AR: "اكتشف العالم معنا"
EN: "Discover the World With Us"


Subheadline: "رحلات، تأشيرات، إقامات — كل شيء في مكان واحد"
Primary CTA button (red filled): "استعرض رحلاتنا / Browse Trips"
Secondary CTA (outlined white): "تواصل معنا / Contact Us"
Sticky header overlays the hero (transparent → solid on scroll)

Quick Search / Filter Bar

Horizontal bar just below the hero (or overlapping at bottom of hero)
Fields: Destination dropdown | Date picker | Trip duration | Number of travelers
Red "Search" button
Note: wire up to Supabase packages table filter later

Stats / Trust Bar

4 counters in a horizontal row with red accent numbers:

عملاء راضون / Happy Clients: [from Supabase stats table]
رحلة منظمة / Trips Organized: [dynamic]
سنة خبرة / Years Experience: [dynamic]
وجهة سياحية / Destinations: [dynamic]


White background, thin top/bottom red border line

Our Services Section

Section title: "خدماتنا المميزة / Our Services"
4 cards in a 2×2 grid (mobile: 1 col, tablet: 2 col, desktop: 4 col):

✈️ رحلات خارجية / International Trips
🗺️ رحلات داخلية / Domestic Trips
📋 خدمات التأشيرات / Visa Services
🚗 تأجير السيارات / Car Rental


Each card: icon + title + 2-line description + red arrow link "اعرف أكثر"
Hover: card lifts, red bottom border appears

Featured Packages Section

Section title: "أبرز عروضنا / Top Packages"
Grid of 6 package cards (3 per row desktop, 1 mobile)
Each card (from Supabase packages table):

Destination photo (full card top)
Destination country flag icon
Trip title (AR + EN)
Duration badge: "7 أيام"
Price badge (red): "3,500 ر.س"
"احجز الآن / Book Now" button


"عرض جميع الرحلات / View All" link below grid

Why Choose Us Section

Dark background (black/very dark gray)
3-column layout with large icons:

🛡️ ضمان أفضل سعر / Best Price Guarantee
🎧 دعم 24/7 / 24/7 Support
🏆 خبرة موثوقة / Trusted Experience


White text on dark, red accent on icon circles

Latest News / Blog Teaser

Section title: "أخبار السياحة / Travel News"
3 blog cards in a row (from Supabase articles table):

Thumbnail image
Category tag (red pill)
Article title
2-line excerpt
Date + "اقرأ المزيد / Read More" link


"كل الأخبار / All News" button

Footer

4 columns:

Logo + tagline + social icons (Instagram, Twitter/X, WhatsApp, Facebook)
Quick Links: Home, About, Packages, Services, News, Contact
Services: Trips, Visas, Car Rental, Exhibitions
Contact Info: 📞 KSA: +966 560 074 845 | 📞 JO: +962 XXX XXX | ✉️ info@etihadtours.com


Bottom bar: copyright + Privacy Policy + Terms links
Red top border on footer


PAGE 2: TOUR PACKAGES LISTING /packages
Page Header

Section hero (400px height) with background image + dark overlay
Title: "عروض الرحلات / Tour Packages"
Breadcrumb: Home > Packages

Filters Sidebar + Package Grid

Layout: Left sidebar (300px) + main content area
Sidebar filters (will connect to Supabase query params):

Destination (dropdown or checkbox list)
Price range (dual slider: min–max)
Duration (checkboxes: 1-3 days, 4-7, 8-14, 14+)
Trip type (International / Domestic)
Clear Filters button


Sort bar above grid: "ترتيب حسب: السعر / المدة / الأحدث"
Package Cards Grid: 3 columns desktop, 2 tablet, 1 mobile
Each card (same as homepage but larger):

Image with country flag overlay
Trip name (AR/EN)
Duration | Departure city | Max travelers
Price (large, red)
"تفاصيل وحجز / Details & Book" button


Pagination: numbered (or infinite scroll)

Supabase integration note in code:
// Table: packages
// Columns: id, title_ar, title_en, description_ar, description_en,
//          destination_ar, destination_en, price, currency, duration_days,
//          departure_city, max_travelers, cover_image_url, is_featured,
//          trip_type (internal/external), created_at, is_active

PAGE 3: SINGLE PACKAGE DETAIL /packages/[slug]
Hero Image

Full-width image (500px height) with destination name overlay
Breadcrumb: Home > Packages > [Trip Name]

Two-Column Content Layout

Left (65%): Trip details

Title (large, AR + EN)
Tags: Duration | Departure | Trip Type
Rich text itinerary (day-by-day program)
Photo gallery (4-image grid with lightbox)
Includes / Excludes list (checkmarks + X marks)
Map embed placeholder


Right (35%, sticky):

Price card (white card, elevated shadow):

Large price display
Availability badge (green: "متاح / Available")
Date picker
Travelers counter
Total price calculation
"احجز الآن / Book Now" → opens booking modal
WhatsApp button (secondary)





Booking Modal

Full-screen overlay modal (centered card)
Fields:

Full name (AR label)
Phone number (with country code selector)
Email
Departure date (date picker)
Number of adults / children
Special requests (textarea)
Terms checkbox


Submit button → POST to Supabase bookings table

// Table: bookings
// Columns: id, package_id, full_name, phone, email, departure_date,
//          adults, children, special_requests, status (pending/confirmed/cancelled),
//          total_price, created_at

Success state: green confirmation message + WhatsApp follow-up link

Related Packages Section (below the detail)

3 cards: "قد يعجبك أيضاً / You May Also Like"


PAGE 4: SERVICES /services
Page Header

Same hero style as packages

Services Grid

2×2 grid of large service cards:

Card 1: رحلات خارجية / International Trips

Description, what's included, CTA → links to /packages?type=external

Card 2: رحلات داخلية / Domestic Trips

CTA → /packages?type=internal

Card 3: خدمات التأشيرات / Visa Services

Visa types offered: Schengen, USA/Canada, UK, GCC, etc.
Starting price display for each
"تواصل للاستفسار / Inquire" CTA → opens enquiry form

Card 4: تأجير السيارات / Car Rental

Fleet types available
Rental terms summary
Inquiry CTA

Card 5: المعارض والمؤتمرات / Exhibitions & Conferences

Full-width card at the bottom
Corporate travel services description
"اطلب عرض سعر / Request Quote" button

Enquiry Form Section (bottom of page)

Floating card form:

Name | Phone | Email
Service interested in (dropdown)
Message (textarea)
Submit → POST to Supabase inquiries table



// Table: inquiries
// Columns: id, name, phone, email, service_type, message, status, created_at

PAGE 5: ABOUT US /about
Hero Section

Split layout: left = large photo of team/office, right = text
Headline: "نحن الاتحاد للسفر والسياحة"
Founding story paragraph

Stats Section (dynamic from Supabase stats table)

4 large animated counters on red background
White text, serif numbers

Our Values / Why Us

3-column icon cards (white background)

Team Section

Grid of team member cards:

Photo (circular)
Name
Role (AR + EN)


From Supabase team_members table (optional, can be static)

Certifications / Partners

Logo strip: partner logos in grayscale


PAGE 6: NEWS & BLOG /news
Page Header (same hero style)
Articles Grid

First article: Large featured card (full width, horizontal layout with big image)
Remaining: 3-column grid
Each article from Supabase articles table:

// Table: articles
// Columns: id, title_ar, title_en, content_ar, content_en,
//          excerpt_ar, excerpt_en, cover_image_url, category,
//          author, published_at, slug, is_published

Category filter tabs: كل المقالات | نصائح سفر | وجهات | أخبار

Single Article Page /news/[slug]

Full-width hero image
Article title + metadata (author, date, category)
Rich text content (RTL Arabic + LTR English)
Social share buttons
Related package CTA box at end of article:

"هل أعجبتك هذه الوجهة؟ / Interested in this destination?"
Shows a relevant package card + Book button


Comments section (optional, or disable)


PAGE 7: CONTACT /contact
Split Layout

Left (50%): Contact form

Full Name | Phone (with +966 / +962 selector) | Email
Subject dropdown: General Inquiry / Package / Visa / Car Rental / Other
Message textarea
Send button → Supabase inquiries table
Success toast notification


Right (50%): Contact info

📍 Saudi Office address
📍 Jordan Office address
📞 KSA: +966 560 074 845
📞 Jordan: +962 [number]
✉️ info@etihadtours.com
WhatsApp CTA button (large, green)
Working hours
Embedded Google Map




PAGE 8: UTILITY PAGES
Custom 404 Page

Dark background with large "404" in red serif
Arabic: "عذراً، الصفحة غير موجودة"
English: "Page Not Found"
Search bar
Quick links: Home | Packages | Contact
Fun travel illustration or destination photo

Search Results Page /search?q=

Search bar (auto-populated)
Results split into tabs: Packages | Articles | Services
Empty state illustration if no results


🔗 GLOBAL COMPONENTS
Navbar

Logo (left on LTR, right on RTL)
Nav links: الرئيسية | من نحن | رحلاتنا | خدماتنا | أخبار | تواصل معنا
Language toggle button: AR | EN (fully functional, switches direction)
WhatsApp icon button (green, always visible)
Hamburger on mobile → full-screen drawer menu
Behavior: transparent on hero pages, solid white (with shadow) on scroll

Footer
(Described in Homepage section above)
Floating WhatsApp Button

Fixed bottom-right (bottom-left in RTL)
Green circle with WhatsApp icon
Pulse animation
Links to: https://wa.me/966560074845

Cookie Consent Banner

Bottom bar on first visit
"نستخدم ملفات الكوكيز / We use cookies"
Accept / Decline buttons


🗄️ SUPABASE SCHEMA SUMMARY
sql-- packages (trip listings)
CREATE TABLE packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_ar text, title_en text,
  description_ar text, description_en text,
  destination_ar text, destination_en text,
  price numeric, currency text DEFAULT 'SAR',
  duration_days int,
  departure_city text,
  max_travelers int,
  cover_image_url text,
  gallery_urls text[],
  includes_ar text[], includes_en text[],
  excludes_ar text[], excludes_en text[],
  trip_type text CHECK (trip_type IN ('internal','external')),
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- bookings
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  departure_date date,
  adults int DEFAULT 1,
  children int DEFAULT 0,
  special_requests text,
  total_price numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- inquiries
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, phone text, email text,
  service_type text, message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- articles (blog/news)
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_ar text, title_en text,
  content_ar text, content_en text,
  excerpt_ar text, excerpt_en text,
  cover_image_url text,
  category text,
  author text,
  published_at timestamptz,
  is_published boolean DEFAULT false
);

-- stats (trust counters)
CREATE TABLE stats (
  id int PRIMARY KEY DEFAULT 1,
  happy_clients int,
  trips_organized int,
  years_experience int,
  destinations int
);

-- team_members (optional)
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text, name_en text,
  role_ar text, role_en text,
  photo_url text,
  display_order int
);

⚙️ TECHNICAL STACK (for Figma Make → code export)

Framework: React (Next.js 14+ App Router preferred)
Styling: Tailwind CSS + CSS variables for brand colors
Language toggle: i18n via next-intl or react-i18next, RTL via dir="rtl" on <html>
Database: Supabase (PostgreSQL + Realtime + Storage for images)
Forms: React Hook Form + Zod validation
Animations: Framer Motion for page transitions + scroll reveals
Image optimization: Next.js <Image /> + Supabase Storage CDN
Fonts: Google Fonts (Playfair Display + DM Sans + Cairo/Tajawal)


🚀 UX BEST PRACTICES TO IMPLEMENT

Bilingual consistency: Every string has an AR and EN version. Language persists across navigation via localStorage + URL prefix (/ar/ or /en/)
Form validation: Inline errors in Arabic on AR mode, English on EN mode. Required fields highlighted in red.
Loading states: Skeleton loaders on all dynamic content (packages, news)
Empty states: Friendly illustrations when no results found
Accessibility: aria-label on all icon buttons, proper lang attribute, keyboard navigation, min contrast ratio 4.5:1
SEO: <title> + <meta description> per page, canonical tags, Open Graph tags for social sharing
Performance: Lazy-load images, code splitting per route, preload hero image
Mobile-first: All interactions designed for thumb reach, WhatsApp CTA always accessible
Trust signals: Real statistics (from Supabase), no placeholder zeros, reviews/testimonials section
Conversion optimization: Sticky Book Now button on package detail (mobile), WhatsApp as a backup conversion on every page


🖼️ IMAGE PLACEHOLDERS (until real photos added)
Use high-quality travel destination placeholders from:

https://source.unsplash.com/1600x900/?travel,destination
Or use Supabase Storage bucket: travel-images


✅ PRIORITY BUILD ORDER FOR FIGMA MAKE

Design System (colors, typography, components library)
Homepage (highest traffic, first impression)
Package Listing + Single Package + Booking Modal
Contact Page
Services Page
About Page
News Listing + Single Article
Utility (404, Search)


Prompt prepared for Figma Make — Al-Etihad Tours Website Redesign
Based on UI/UX Audit (Nov 2025) + Site Map
Ready for Supabase integration post-design