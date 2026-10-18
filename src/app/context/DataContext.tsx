import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { packages as mockPackages, articles as mockArticles, teamMembers as mockTeam, stats as mockStats } from '../data/mockData';
import type { Package, Article, TeamMember, Stats } from '../data/mockData';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cf64f9a2`;

export interface SiteSettings {
  whatsapp: string;
  phone: string;
  email: string;
  address_ar: string;
  address_en: string;
  address2_ar: string;
  address2_en: string;
  working_hours_ar: string;
  working_hours_en: string;
  stats_happy_clients: number;
  stats_trips_organized: number;
  stats_years_experience: number;
  stats_destinations: number;
  company_name_ar: string;
  company_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  show_popular_destinations: boolean;
  // Homepage hero is curated from published package IDs, maximum three.
  hero_package_ids: string[];
  // Search bar tab toggles
  search_tab_flights: boolean;
  search_tab_hotels: boolean;
  search_tab_chalets: boolean;
  search_tab_evisa: boolean;
  search_tab_destinations: boolean;
  search_tab_packages: boolean;
  show_whatsapp_button: boolean;
  // Measurement / ownership configuration. Values are validated server-side.
  google_tag_id: string;
  search_console_verification: string;
  // Social media links
  social_instagram: string;
  social_instagram_enabled: boolean;
  social_twitter: string;
  social_twitter_enabled: boolean;
  social_facebook: string;
  social_facebook_enabled: boolean;
  social_tiktok: string;
  social_tiktok_enabled: boolean;
  social_snapchat: string;
  social_snapchat_enabled: boolean;
  // Top banner
  banner_enabled: boolean;
  banner_message_ar: string;
  banner_message_en: string;
  banner_link: string;
  banner_link_label_ar: string;
  banner_link_label_en: string;
  // About page
  about_image_url: string;
  about_story_label_en: string;
  about_story_label_ar: string;
  about_title_en: string;
  about_title_ar: string;
  about_story_en: string;
  about_story_ar: string;
  about_story2_en: string;
  about_story2_ar: string;
  about_values_title_en: string;
  about_values_title_ar: string;
  about_value1_title_en: string;
  about_value1_title_ar: string;
  about_value1_desc_en: string;
  about_value1_desc_ar: string;
  about_value2_title_en: string;
  about_value2_title_ar: string;
  about_value2_desc_en: string;
  about_value2_desc_ar: string;
  about_value3_title_en: string;
  about_value3_title_ar: string;
  about_value3_desc_en: string;
  about_value3_desc_ar: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp: '966560074845',
  phone: '+966 560 074 845',
  email: 'info@etihadtours.com',
  address_ar: 'طريق الملك عبدالعزيز، الخالدية، عرعر 73211، المملكة العربية السعودية',
  address_en: 'King Abdulaziz Road, Alkhalidiyah, Arar 73211, Saudi Arabia',
  address2_ar: '',
  address2_en: '',
  working_hours_ar: 'الأحد–الخميس: ٩ ص – ٦ م',
  working_hours_en: 'Sun–Thu: 9:00 AM – 6:00 PM',
  stats_happy_clients: 12500,
  stats_trips_organized: 3800,
  stats_years_experience: 15,
  stats_destinations: 65,
  company_name_ar: 'الاتحاد للسفر والسياحة',
  company_name_en: 'Al-Etihad for Travel & Tourism',
  tagline_ar: 'شريكك الموثوق في السفر عبر المنطقة والعالم.',
  tagline_en: 'Your trusted travel partner across the region and beyond.',
  show_popular_destinations: true,
  hero_package_ids: [],
  // Search bar tabs — only packages enabled by default
  search_tab_flights: false,
  search_tab_hotels: false,
  search_tab_chalets: false,
  search_tab_evisa: false,
  search_tab_destinations: false,
  search_tab_packages: true,
  show_whatsapp_button: true,
  google_tag_id: '',
  search_console_verification: '',
  // Social media — empty URLs, all disabled by default
  social_instagram: '',
  social_instagram_enabled: false,
  social_twitter: '',
  social_twitter_enabled: false,
  social_facebook: '',
  social_facebook_enabled: false,
  social_tiktok: '',
  social_tiktok_enabled: false,
  social_snapchat: '',
  social_snapchat_enabled: false,
  // Top banner — disabled by default
  banner_enabled: false,
  banner_message_ar: '',
  banner_message_en: '',
  banner_link: '',
  banner_link_label_ar: 'اقرأ المزيد',
  banner_link_label_en: 'Read More',
  // About page defaults
  about_image_url: 'https://images.unsplash.com/photo-1650784854945-264d5b0b6b07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900',
  about_story_label_en: 'Our Story',
  about_story_label_ar: 'قصتنا',
  about_title_en: 'Al-Etihad for Travel & Tourism',
  about_title_ar: 'نحن الاتحاد للسفر والسياحة',
  about_story_en: 'Founded in Saudi Arabia with deep roots in Jordan, Al-Etihad Tours has been crafting unforgettable journeys for over 15 years. From luxury international getaways to seamless visa services, we handle every detail so you can focus on the experience.',
  about_story_ar: 'تأسست شركة الاتحاد للسفر والسياحة في المملكة العربية السعودية بجذور راسخة في الأردن، وقد عملنا على صياغة رحلات لا تُنسى لأكثر من ٠٥ عاماً. من الرحلات الدولية الفاخرة إلى خدمات التأشيرات السلسة، نتولى كل التفاصيل حتى تتفرغ للتجربة.',
  about_story2_en: 'We proudly serve over 3,500 satisfied clients across Saudi Arabia, Jordan, and the wider Gulf region, committed to delivering exceptional travel experiences that reflect our core values of quality and integrity.',
  about_story2_ar: 'نفخر بخدمة أكثر من 3,500 عميل راضٍ من المملكة العربية السعودية والأردن وسائر دول الخليج، ونلتزم بتقديم تجارب سفر استثنائية تعكس قيمنا في الجودة والنزاهة.',
  about_values_title_en: 'Our Values',
  about_values_title_ar: 'قيمنا',
  about_value1_title_en: 'Excellence',
  about_value1_title_ar: 'التميز',
  about_value1_desc_en: 'We deliver top-tier service in every aspect of travel.',
  about_value1_desc_ar: 'نقدم خدمة عالية المستوى في كل جانب من جوانب السفر.',
  about_value2_title_en: 'Trust',
  about_value2_title_ar: 'الثقة',
  about_value2_desc_en: 'Transparency and integrity are at the heart of everything we do.',
  about_value2_desc_ar: 'الشفافية والنزاهة في صميم كل ما نقوم به.',
  about_value3_title_en: 'Innovation',
  about_value3_title_ar: 'الابتكار',
  about_value3_desc_en: 'We continuously evolve to exceed your expectations.',
  about_value3_desc_ar: 'نتطور باستمرار لنتجاوز توقعاتك دائماً.',
};

interface DataContextType {
  packages: Package[];
  articles: Article[];
  team: TeamMember[];
  settings: SiteSettings;
  stats: Stats;
  loading: boolean;
  refresh: () => void;
}

const DataContext = createContext<DataContextType>({
  packages: mockPackages,
  articles: mockArticles,
  team: mockTeam,
  settings: DEFAULT_SETTINGS,
  stats: mockStats,
  loading: false,
  refresh: () => {},
});

async function apiFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, artRes, teamRes, settingsRes] = await Promise.allSettled([
        apiFetch('/packages'),
        apiFetch('/articles'),
        apiFetch('/team'),
        apiFetch('/settings'),
      ]);

      if (pkgRes.status === 'fulfilled' && pkgRes.value.packages?.length) {
        setPackages(pkgRes.value.packages);
      }
      if (artRes.status === 'fulfilled' && artRes.value.articles?.length) {
        setArticles(artRes.value.articles);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value.team?.length) {
        setTeam(teamRes.value.team);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.settings) {
        setSettings(settingsRes.value.settings);
      }
    } catch (e) {
      console.log('DataContext fetch error (falling back to mock data):', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats: Stats = {
    happy_clients: settings.stats_happy_clients,
    trips_organized: settings.stats_trips_organized,
    years_experience: settings.stats_years_experience,
    destinations: settings.stats_destinations,
  };

  return (
    <DataContext.Provider value={{ packages, articles, team, settings, stats, loading, refresh: fetchAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}