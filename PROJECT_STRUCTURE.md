# etihadtours.com — Project Structure

**Stack:** React 18 · TypeScript · Tailwind CSS v4 · React Router v7 · Vite

---

## Directory Tree

```
src/
├── app/
│   ├── App.tsx                          ← Main entry point (routing setup)
│   │
│   ├── components/                      ← Reusable UI components
│   │   ├── CookieBanner.tsx             ← GDPR/cookie consent banner
│   │   ├── EmojiFlag.tsx                ← Country flag emoji component
│   │   ├── Footer.tsx                   ← Site footer
│   │   ├── ImageUploadField.tsx         ← Reusable image upload (URL or file)
│   │   ├── Logo.tsx                     ← Brand logo
│   │   ├── Navbar.tsx                   ← Navigation bar (transparent on Home)
│   │   ├── PackageCard.tsx              ← Travel package card
│   │   ├── SearchBar.tsx                ← Multi-tab search bar (Home page)
│   │   ├── SocialIcons.tsx              ← Social media icons
│   │   ├── TopBanner.tsx                ← Top announcement banner
│   │   ├── WhatsAppButton.tsx           ← Floating WhatsApp button
│   │   │
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx    ← Safe image component with fallback
│   │   │
│   │   └── ui/                          ← shadcn/ui base components (Radix UI)
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── tooltip.tsx
│   │       └── ...more
│   │
│   ├── context/                         ← Global state (React Context)
│   │   ├── AdminAuthContext.tsx         ← Admin login/auth state
│   │   ├── DataContext.tsx              ← Site-wide data & settings
│   │   └── LanguageContext.tsx          ← AR/EN language toggle
│   │
│   ├── data/                            ← Static/mock data
│   │   ├── mockData.ts                  ← Packages, team, articles mock data
│   │   └── visaData.ts                  ← E-Visa countries & info (Ya Hala)
│   │
│   ├── pages/                           ← Public-facing pages
│   │   ├── Root.tsx                     ← Root layout + DataProvider wrapper
│   │   ├── Home.tsx                     ← Homepage with hero & search bar
│   │   ├── About.tsx                    ← About us page
│   │   ├── Contact.tsx                  ← Contact page
│   │   ├── Services.tsx                 ← Services page
│   │   ├── Packages.tsx                 ← Travel packages listing
│   │   ├── PackageDetail.tsx            ← Single package detail page
│   │   ├── News.tsx                     ← News/articles listing
│   │   ├── NewsDetail.tsx               ← Single article detail page
│   │   ├── EVisaPage.tsx                ← E-Visa page (Ya Hala integration)
│   │   ├── Search.tsx                   ← Search results page
│   │   └── NotFound.tsx                 ← 404 page
│   │
│   ├── pages/admin/                     ← Admin dashboard (protected)
│   │   ├── AdminLayout.tsx              ← Admin sidebar layout
│   │   ├── AdminLogin.tsx               ← Admin login screen
│   │   ├── AdminDashboard.tsx           ← Dashboard overview
│   │   ├── AdminPackages.tsx            ← Packages list management
│   │   ├── AdminPackageForm.tsx         ← Add/edit package form
│   │   ├── AdminArticles.tsx            ← Articles list management
│   │   ├── AdminArticleForm.tsx         ← Add/edit article form
│   │   ├── AdminTeam.tsx                ← Team members management
│   │   ├── AdminAbout.tsx               ← About page content management
│   │   ├── AdminSettings.tsx            ← Global site settings
│   │   ├── AdminUsers.tsx               ← Users management
│   │   └── AdminBulkImport.tsx          ← Bulk data import (XLSX)
│   │
│   └── routes.ts                        ← All route paths defined here
│
├── imports/                             ← Figma design imports
│   ├── Frame67.tsx / Frame68.tsx        ← Imported Figma frames
│   ├── Frame_67.svg / Frame_68.svg      ← Imported SVG assets
│   ├── svg-hbhcmaonuq.ts               ← SVG path data
│   ├── svg-uj7yeyk226.ts               ← SVG path data
│   ├── image.png                        ← Imported image asset
│   └── al-etihad-website-prompt.md      ← Original site brief
│
└── styles/                              ← Global CSS
    ├── fonts.css                        ← Font imports (IBM Plex Sans Arabic)
    ├── theme.css                        ← Design tokens (colors, spacing, etc.)
    ├── globals.css                      ← Global base styles
    ├── index.css                        ← Main CSS entry
    └── tailwind.css                     ← Tailwind v4 setup
```

---

## Pages & Routes

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Hero + multi-tab SearchBar, transparent Navbar |
| `/about` | About | Company info, team section |
| `/services` | Services | Services offered |
| `/packages` | Packages | Travel packages grid |
| `/packages/:id` | PackageDetail | Single package |
| `/news` | News | Articles/blog listing |
| `/news/:id` | NewsDetail | Single article |
| `/evisa` | EVisaPage | Ya Hala e-visa integration |
| `/search` | Search | Search results |
| `/admin` | AdminLogin | Protected admin area |
| `/admin/dashboard` | AdminDashboard | — |
| `/admin/packages` | AdminPackages | — |
| `/admin/articles` | AdminArticles | — |
| `/admin/team` | AdminTeam | — |
| `/admin/about` | AdminAbout | — |
| `/admin/settings` | AdminSettings | — |
| `/admin/users` | AdminUsers | — |

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `react-router` v7 | Page routing |
| `lucide-react` | Icons |
| `recharts` | Charts (admin dashboard) |
| `motion` | Animations |
| `react-hook-form` | Form handling |
| `sonner` | Toast notifications |
| `xlsx` | Bulk import (Excel files) |
| `@mui/material` | Some UI components |
| Radix UI (`@radix-ui/*`) | Accessible UI primitives (shadcn base) |

---

## Bilingual Support

- Language toggle: **Arabic (AR) / English (EN)**
- Font: **IBM Plex Sans Arabic**
- RTL layout supported via `LanguageContext`
- All content strings have AR/EN variants

---

## Notes

- The Navbar is **transparent** on the Home page only, solid on all other pages.
- `DataContext` holds global site settings (logo, contact info, colors, etc.) managed via `AdminSettings`.
- `ImageUploadField` supports both **direct file upload** and **URL input** with live preview.
- The E-Visa tab in SearchBar is integrated with the **Ya Hala** platform.
- Admin area is protected via `AdminAuthContext`.
