import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plane, Building2, Tent, FileText, Globe, Package,
  Circle, MapPin, ArrowLeftRight, Calendar, Users,
  ChevronDown, ChevronLeft, ChevronRight, Search,
  Flag, CreditCard, X, Minus, Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import type { SiteSettings } from '../context/DataContext';
import { EmojiFlag } from './EmojiFlag';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'flights' | 'hotels' | 'chalets' | 'evisa' | 'destinations' | 'packages';

interface TabDef {
  id: TabId;
  icon: React.ElementType;
  label_ar: string;
  label_en: string;
  badge_ar?: string;
  badge_en?: string;
  settingKey: keyof SiteSettings;
}

const ALL_TABS: TabDef[] = [
  { id: 'flights',      icon: Plane,      label_ar: 'الطيران',           label_en: 'Flights',      settingKey: 'search_tab_flights' },
  { id: 'hotels',       icon: Building2,  label_ar: 'الفنادق',           label_en: 'Hotels',       settingKey: 'search_tab_hotels' },
  { id: 'chalets',      icon: Tent,       label_ar: 'شاليهات',           label_en: 'Chalets',      settingKey: 'search_tab_chalets', badge_ar: 'جديد', badge_en: 'New' },
  { id: 'evisa',        icon: FileText,   label_ar: 'تأشيرة إلكترونية', label_en: 'e-Visa',       settingKey: 'search_tab_evisa' },
  { id: 'destinations', icon: Globe,      label_ar: 'الوجهات',           label_en: 'Destinations', settingKey: 'search_tab_destinations' },
  { id: 'packages',     icon: Package,    label_ar: 'الباقات',           label_en: 'Packages',     settingKey: 'search_tab_packages' },
];

// ─── Country / Nationality data ───────────────────────────────────────────────

const NATIONALITIES = [
  { code: 'SA', flag: '🇸🇦', ar: 'سعودي',       en: 'Saudi Arabian' },
  { code: 'AE', flag: '🇦🇪', ar: 'إماراتي',      en: 'Emirati' },
  { code: 'KW', flag: '🇰🇼', ar: 'كويتي',        en: 'Kuwaiti' },
  { code: 'QA', flag: '🇶🇦', ar: 'قطري',         en: 'Qatari' },
  { code: 'BH', flag: '🇧🇭', ar: 'بحريني',       en: 'Bahraini' },
  { code: 'OM', flag: '🇴🇲', ar: 'عُماني',        en: 'Omani' },
  { code: 'JO', flag: '🇯🇴', ar: 'أردني',        en: 'Jordanian' },
  { code: 'EG', flag: '🇪🇬', ar: 'مصري',         en: 'Egyptian' },
  { code: 'SY', flag: '🇸🇾', ar: 'سوري',         en: 'Syrian' },
  { code: 'LB', flag: '🇱🇧', ar: 'لبناني',       en: 'Lebanese' },
  { code: 'IQ', flag: '🇮🇶', ar: 'عراقي',        en: 'Iraqi' },
  { code: 'YE', flag: '🇾🇪', ar: 'يمني',         en: 'Yemeni' },
  { code: 'SD', flag: '🇸🇩', ar: 'سوداني',       en: 'Sudanese' },
  { code: 'LY', flag: '🇱🇾', ar: 'ليبي',         en: 'Libyan' },
  { code: 'TN', flag: '🇹🇳', ar: 'تونسي',        en: 'Tunisian' },
  { code: 'DZ', flag: '🇩🇿', ar: 'جزائري',       en: 'Algerian' },
  { code: 'MA', flag: '🇲🇦', ar: 'مغربي',        en: 'Moroccan' },
  { code: 'PK', flag: '🇵🇰', ar: 'باكستاني',     en: 'Pakistani' },
  { code: 'IN', flag: '🇮🇳', ar: 'هندي',         en: 'Indian' },
  { code: 'BD', flag: '🇧🇩', ar: 'بنغلاديشي',    en: 'Bangladeshi' },
  { code: 'PH', flag: '🇵🇭', ar: 'فلبيني',       en: 'Filipino' },
  { code: 'ID', flag: '🇮🇩', ar: 'إندونيسي',     en: 'Indonesian' },
  { code: 'MY', flag: '🇲🇾', ar: 'ماليزي',       en: 'Malaysian' },
  { code: 'TR', flag: '🇹🇷', ar: 'تركي',         en: 'Turkish' },
  { code: 'US', flag: '🇺🇸', ar: 'أمريكي',       en: 'American' },
  { code: 'GB', flag: '🇬🇧', ar: 'بريطانيااني',      en: 'British' },
  { code: 'DE', flag: '🇩🇪', ar: 'ألماني',       en: 'German' },
  { code: 'FR', flag: '🇫🇷', ar: 'فرنسي',        en: 'French' },
  { code: 'CN', flag: '🇨🇳', ar: 'صيني',         en: 'Chinese' },
  { code: 'RU', flag: '🇷🇺', ar: 'روسي',         en: 'Russian' },
];

const EVISA_COUNTRIES = [
  { code: 'JP', flag: '🇯🇵', ar: 'اليابان',          en: 'Japan' },
  { code: 'GB', flag: '🇬🇧', ar: 'المملكة المتحدة',  en: 'United Kingdom' },
  { code: 'US', flag: '🇺🇸', ar: 'الولايات المتحدة', en: 'United States' },
  { code: 'DE', flag: '🇩🇪', ar: 'ألمانيا',          en: 'Germany' },
  { code: 'FR', flag: '🇫🇷', ar: 'فرنسا',            en: 'France' },
  { code: 'TR', flag: '🇹🇷', ar: 'تركيا',            en: 'Turkey' },
  { code: 'ID', flag: '🇮🇩', ar: 'إندونيسيا',        en: 'Indonesia' },
  { code: 'MV', flag: '🇲🇻', ar: 'جزر المالديف',     en: 'Maldives' },
  { code: 'MA', flag: '🇲🇦', ar: 'المغرب',           en: 'Morocco' },
  { code: 'AE', flag: '🇦🇪', ar: 'الإمارات',         en: 'UAE' },
  { code: 'MY', flag: '🇲🇾', ar: 'ماليزيا',          en: 'Malaysia' },
  { code: 'TH', flag: '🇹🇭', ar: 'تايلاند',          en: 'Thailand' },
  { code: 'IT', flag: '🇮🇹', ar: 'إيطاليا',          en: 'Italy' },
  { code: 'ES', flag: '🇪🇸', ar: 'إسبانيا',          en: 'Spain' },
  { code: 'NL', flag: '🇳🇱', ar: 'هولندا',           en: 'Netherlands' },
  { code: 'CH', flag: '🇨🇭', ar: 'سويسرا',           en: 'Switzerland' },
  { code: 'GR', flag: '🇬🇷', ar: 'اليونان',          en: 'Greece' },
  { code: 'PT', flag: '🇵🇹', ar: 'البرتغال',         en: 'Portugal' },
  { code: 'AU', flag: '🇦🇺', ar: 'أستراليا',         en: 'Australia' },
  { code: 'CA', flag: '🇨🇦', ar: 'كندا',             en: 'Canada' },
];

// ─── Hook: click-outside dropdown ─────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return { open, setOpen, ref };
}

// ─── Primitive: FieldBox ──────────────────────────────────────────────────────

function FieldBox({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center bg-[#f4f6f8] rounded-xl px-3 border border-gray-100 h-[50px] transition-all ${onClick ? 'cursor-pointer hover:bg-gray-100' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

function FIcon({ icon: Icon }: { icon: React.ElementType }) {
  return <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 me-2" />;
}

// ─── Primitive: Dropdown Panel ────────────────────────────────────────────────

function DropdownPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute top-[calc(100%+6px)] start-0 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ─── Static Placeholder Field (for tabs not yet connected) ────────────────────

function StaticField({
  icon: Icon,
  label,
  className = '',
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center bg-[#f4f6f8] rounded-xl px-3 border border-gray-100 h-[50px] ${className}`}>
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 me-2" />
      <span className="text-[14px] text-gray-400 flex-1 truncate">{label}</span>
      <ChevronDown className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
    </div>
  );
}

// ─── Interactive: Searchable List Dropdown ────────────────────────────────────

interface ListItem {
  code: string;
  flag: string;
  ar: string;
  en: string;
}

function SearchableDropdownField({
  icon: Icon,
  placeholder,
  items,
  isRTL,
  className = '',
  onSelect,
}: {
  icon: React.ElementType;
  placeholder: string;
  items: ListItem[];
  isRTL: boolean;
  className?: string;
  onSelect?: (item: ListItem) => void;
}) {
  const { open, setOpen, ref } = useDropdown();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ListItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const display = selected ? (isRTL ? selected.ar : selected.en) : '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.ar.includes(query) ||
        it.en.toLowerCase().includes(q)
    );
  }, [query, items]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <FieldBox onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}>
        <FIcon icon={Icon} />
        <input
          ref={inputRef}
          value={open ? query : display}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400 text-[14px] min-w-0"
          autoComplete="off"
        />
        {selected && !open ? (
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(null); setQuery(''); }}
            className="text-gray-300 hover:text-gray-500 ms-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </FieldBox>

      {open && (
        <DropdownPanel className="w-full min-w-[200px]">
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-gray-400 text-center">
                {isRTL ? 'لا توجد نتائج' : 'No results'}
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.code}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelected(item);
                    setQuery('');
                    setOpen(false);
                    onSelect?.(item);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#fff3f6] text-start transition-colors ${
                    selected?.code === item.code ? 'bg-[#fff3f6] text-[#fd2452]' : 'text-gray-700'
                  }`}
                >
                  <EmojiFlag emoji={item.flag} className="text-base leading-none" />
                  <span className="text-[14px]">{isRTL ? item.ar : item.en}</span>
                </button>
              ))
            )}
          </div>
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── Interactive: Destination Search (from packages data) ─────────────────────

function DestinationSearchField({ isRTL, className = '' }: { isRTL: boolean; className?: string }) {
  const { packages } = useData();
  const { open, setOpen, ref } = useDropdown();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Unique destinations grouped by destination_en
  const destinations = useMemo(() => {
    const map = new Map<string, { ar: string; en: string; flag: string; count: number; titles_ar: string[]; titles_en: string[] }>();
    packages
      .filter((p) => p.is_active)
      .forEach((p) => {
        const key = p.destination_en;
        if (!map.has(key)) {
          map.set(key, { ar: p.destination_ar, en: p.destination_en, flag: p.flag, count: 0, titles_ar: [], titles_en: [] });
        }
        const entry = map.get(key)!;
        entry.count++;
        entry.titles_ar.push(p.title_ar);
        entry.titles_en.push(p.title_en);
      });
    return Array.from(map.values());
  }, [packages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.ar.includes(query) ||
        d.en.toLowerCase().includes(q) ||
        d.titles_ar.some((t) => t.includes(query)) ||
        d.titles_en.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, destinations]);

  const placeholder = isRTL ? 'الوجهة أو اسم الباقة' : 'Destination or Package name';
  const display = selected || '';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <FieldBox onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}>
        <FIcon icon={MapPin} />
        <input
          ref={inputRef}
          value={open ? query : display}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400 text-[14px] min-w-0"
          autoComplete="off"
        />
        {selected && !open ? (
          <button
            onMouseDown={(e) => { e.preventDefault(); setSelected(''); setQuery(''); }}
            className="text-gray-300 hover:text-gray-500 ms-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </FieldBox>

      {open && (
        <DropdownPanel className="w-full min-w-[280px]">
          {filtered.length === 0 ? (
            <div className="px-4 py-4 text-[13px] text-gray-400 text-center">
              {isRTL ? 'لا توجد باقات لهذه الوجهة' : 'No packages found for this destination'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {/* Optional "all" row */}
              <button
                onMouseDown={(e) => { e.preventDefault(); setSelected(''); setQuery(''); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fff3f6] text-start border-b border-gray-100 ${!selected ? 'text-[#fd2452]' : 'text-gray-500'}`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-[13px]">{isRTL ? 'جميع الوجهات' : 'All Destinations'}</span>
              </button>

              {filtered.map((dest) => (
                <button
                  key={dest.en}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelected(isRTL ? dest.ar : dest.en);
                    setQuery('');
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fff3f6] text-start transition-colors ${
                    selected === (isRTL ? dest.ar : dest.en) ? 'bg-[#fff3f6]' : ''
                  }`}
                >
                  <EmojiFlag emoji={dest.flag} className="text-xl leading-none" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] text-gray-800 font-medium truncate">
                      {isRTL ? dest.ar : dest.en}
                    </div>
                    <div className="text-[12px] text-gray-400 truncate">
                      {dest.count} {isRTL ? (dest.count === 1 ? 'باقة متاحة' : 'باقات متاحة') : (dest.count === 1 ? 'package' : 'packages')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── Interactive: Mini Calendar + Date Field ──────────────────────────────────

function MiniCalendar({
  value,
  onChange,
  isRTL,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  isRTL: boolean;
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(
    isRTL ? 'ar-SA-u-nu-latn' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const dayNames = isRTL
    ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isSelected = (day: number) =>
    value !== null &&
    value.getFullYear() === viewYear &&
    value.getMonth() === viewMonth &&
    value.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  return (
    <div className="p-3 w-[270px]" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[14px] font-medium text-gray-700">{monthLabel}</span>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[11px] text-gray-400 py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { if (!isPast(day)) onChange(new Date(viewYear, viewMonth, day)); }}
              disabled={isPast(day)}
              className={`w-full aspect-square flex items-center justify-center rounded-full text-[13px] transition-colors
                ${isPast(day) ? 'text-gray-300 cursor-not-allowed' : ''}
                ${isSelected(day) ? 'bg-[#fd2452] text-white font-medium' : ''}
                ${isToday(day) && !isSelected(day) ? 'border border-[#fd2452] text-[#fd2452]' : ''}
                ${!isPast(day) && !isSelected(day) ? 'hover:bg-[#fd2452]/10 text-gray-700' : ''}
              `}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function DateField({
  value,
  onChange,
  placeholder,
  isRTL,
  className = '',
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder: string;
  isRTL: boolean;
  className?: string;
}) {
  const { open, setOpen, ref } = useDropdown();

  const label = value
    ? value.toLocaleDateString(isRTL ? 'ar-SA-u-nu-latn' : 'en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <FieldBox onClick={() => setOpen((o) => !o)}>
        <FIcon icon={Calendar} />
        <span className={`text-[14px] flex-1 truncate ${label ? 'text-gray-700' : 'text-gray-400'}`}>
          {label ?? placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </FieldBox>

      {open && (
        <DropdownPanel>
          <MiniCalendar
            value={value}
            onChange={(d) => { onChange(d); setOpen(false); }}
            isRTL={isRTL}
          />
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── Interactive: Duration Field ──────────────────────────────────────────────

function DurationField({
  value,
  onChange,
  isRTL,
  className = '',
}: {
  value: number | null;
  onChange: (d: number | null) => void;
  isRTL: boolean;
  className?: string;
}) {
  const { packages } = useData();
  const { open, setOpen, ref } = useDropdown();

  // Unique sorted durations from active packages
  const durations = useMemo(
    () => [...new Set(packages.filter((p) => p.is_active).map((p) => p.duration_days))].sort((a, b) => a - b),
    [packages]
  );

  const fmtDays = (d: number) =>
    isRTL
      ? `${d} ${d === 1 ? 'يوم' : d < 11 ? 'أيام' : 'يوم'}`
      : `${d} ${d === 1 ? 'Day' : 'Days'}`;

  const label = value != null ? fmtDays(value) : (isRTL ? 'أي مدة' : 'Any Duration');

  return (
    <div ref={ref} className={`relative ${className}`}>
      <FieldBox onClick={() => setOpen((o) => !o)}>
        <FIcon icon={Calendar} />
        <span className={`text-[14px] flex-1 truncate ${value != null ? 'text-gray-700' : 'text-gray-400'}`}>
          {label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </FieldBox>

      {open && (
        <DropdownPanel className="w-full min-w-[150px]">
          <div className="py-1">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(null); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-start text-[14px] hover:bg-[#fff3f6] transition-colors ${value == null ? 'text-[#fd2452] font-medium' : 'text-gray-700'}`}
            >
              {isRTL ? 'أي مدة' : 'Any Duration'}
            </button>
            {durations.map((d) => (
              <button
                key={d}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(d); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-start text-[14px] hover:bg-[#fff3f6] transition-colors ${value === d ? 'text-[#fd2452] font-medium bg-[#fff3f6]' : 'text-gray-700'}`}
              >
                {fmtDays(d)}
              </button>
            ))}
          </div>
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── Interactive: Travelers Field ─────────────────────────────────────────────

function TravelersField({ isRTL, className = '' }: { isRTL: boolean; className?: string }) {
  const { open, setOpen, ref } = useDropdown();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const total = adults + children;
  const label = isRTL
    ? `${total} ${total === 1 ? 'مسافر' : 'مسافرين'}`
    : `${total} ${total === 1 ? 'Traveler' : 'Travelers'}`;

  function Counter({
    value,
    onDec,
    onInc,
    min = 0,
  }: { value: number; onDec: () => void; onInc: () => void; min?: number }) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onDec}
          disabled={value <= min}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#fd2452] hover:text-[#fd2452] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center text-[14px] font-medium text-gray-800">{value}</span>
        <button
          onClick={onInc}
          disabled={value >= 10}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#fd2452] hover:text-[#fd2452] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <FieldBox onClick={() => setOpen((o) => !o)}>
        <FIcon icon={Users} />
        <span className="text-[14px] flex-1 truncate text-gray-700">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </FieldBox>

      {open && (
        <DropdownPanel className="w-[230px] end-0 start-auto">
          <div className="p-4 flex flex-col gap-4">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-gray-800">{isRTL ? 'بالغون' : 'Adults'}</div>
                <div className="text-[11px] text-gray-400">{isRTL ? '٢٠ سنة فأكثر' : '20 years and above'}</div>
              </div>
              <Counter value={adults} min={1} onDec={() => setAdults((a) => Math.max(1, a - 1))} onInc={() => setAdults((a) => Math.min(10, a + 1))} />
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-gray-800">{isRTL ? 'أطفال' : 'Children'}</div>
                <div className="text-[11px] text-gray-400">{isRTL ? '٢–١١ سنة' : '2–11 years'}</div>
              </div>
              <Counter value={children} onDec={() => setChildren((c) => Math.max(0, c - 1))} onInc={() => setChildren((c) => Math.min(10, c + 1))} />
            </div>

            {/* Confirm */}
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 bg-[#fd2452] text-white rounded-lg text-[13px] font-medium hover:bg-[#e61b46] transition-colors"
            >
              {isRTL ? 'تأكيد' : 'Done'}
            </button>
          </div>
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── Tab Form: Packages (fully interactive) ───────────────────────────────────

function PackagesForm({ isRTL }: { isRTL: boolean }) {
  const [date, setDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <DestinationSearchField
        isRTL={isRTL}
        className="w-full sm:flex-1 sm:min-w-[150px]"
      />
      <DateField
        value={date}
        onChange={setDate}
        placeholder={isRTL ? 'تاريخ السفر' : 'Travel Date'}
        isRTL={isRTL}
        className="w-full sm:w-[155px]"
      />
      <DurationField
        value={duration}
        onChange={setDuration}
        isRTL={isRTL}
        className="w-full sm:w-[140px]"
      />
      <TravelersField isRTL={isRTL} className="w-full sm:w-[135px]" />
    </div>
  );
}

// ─── Tab Form: e-Visa (interactive nationality + country) ─────────────────────

function EVisaForm({
  isRTL,
  onCountryChange,
  onNationalityChange,
}: {
  isRTL: boolean;
  onCountryChange: (code: string) => void;
  onNationalityChange: (code: string) => void;
}) {
  const handleCountrySelect = (item: ListItem) => onCountryChange(item.code);
  const handleNationalitySelect = (item: ListItem) => onNationalityChange(item.code);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <SearchableDropdownField
        icon={Globe}
        placeholder={isRTL ? 'الدولة المقصودة' : 'Destination Country'}
        items={EVISA_COUNTRIES}
        isRTL={isRTL}
        className="w-full sm:flex-1"
        onSelect={handleCountrySelect}
      />
      <SearchableDropdownField
        icon={Flag}
        placeholder={isRTL ? 'جنسيتك' : 'Your Nationality'}
        items={NATIONALITIES}
        isRTL={isRTL}
        className="w-full sm:w-[185px]"
        onSelect={handleNationalitySelect}
      />
      <FieldBox className="w-full sm:w-[185px]">
        <FIcon icon={CreditCard} />
        <input
          type="text"
          placeholder={isRTL ? 'رقم جواز السفر' : 'Passport Number'}
          className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400 text-[14px] min-w-0 w-full"
          autoComplete="off"
        />
      </FieldBox>
    </div>
  );
}

// ─── Tab Forms: Static placeholders (API integration pending) ─────────────────

function FlightsForm({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <StaticField icon={Circle}   label={isRTL ? 'من: المدينة أو المطار' : 'From: City or Airport'} className="w-full sm:flex-1 sm:min-w-[130px]" />
      <StaticField icon={MapPin}   label={isRTL ? 'إلى: المدينة أو المطار' : 'To: City or Airport'}  className="w-full sm:flex-1 sm:min-w-[130px]" />
      <StaticField icon={Calendar} label={isRTL ? 'تاريخ المغادرة' : 'Departure Date'}               className="w-full sm:w-[155px]" />
      <StaticField icon={Users}    label={isRTL ? '٢ مسافر' : '2 Travelers'}                          className="w-full sm:w-[125px]" />
    </div>
  );
}

function HotelsForm({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <StaticField icon={MapPin}   label={isRTL ? 'المدينة أو الفندق' : 'City or Hotel name'}  className="w-full sm:flex-1" />
      <StaticField icon={Calendar} label={isRTL ? 'تسجيل الوصول' : 'Check-in'}                 className="w-full sm:w-[150px]" />
      <StaticField icon={Calendar} label={isRTL ? 'تسجيل المغادرة' : 'Check-out'}               className="w-full sm:w-[150px]" />
      <StaticField icon={Users}    label={isRTL ? '٢ غرف، ٤ ضيوف' : '2 Rooms, 4 Guests'}       className="w-full sm:w-[140px]" />
    </div>
  );
}

function ChaletsForm({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <StaticField icon={MapPin}   label={isRTL ? 'المنطقة أو المدينة' : 'Region or City'}   className="w-full sm:flex-1" />
      <StaticField icon={Calendar} label={isRTL ? 'تاريخ الوصول' : 'Arrival Date'}            className="w-full sm:w-[150px]" />
      <StaticField icon={Calendar} label={isRTL ? 'تاريخ المغادرة' : 'Departure Date'}        className="w-full sm:w-[150px]" />
      <StaticField icon={Users}    label={isRTL ? '٢ ضيوف' : '2 Guests'}                      className="w-full sm:w-[125px]" />
    </div>
  );
}

function DestinationsForm({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
      <StaticField icon={Search}   label={isRTL ? 'ابحث عن وجهة سياحية...' : 'Search a destination...'} className="w-full sm:flex-1" />
      <StaticField icon={Globe}    label={isRTL ? 'القارة أو المنطقة' : 'Continent / Region'}            className="w-full sm:w-[185px]" />
      <StaticField icon={Calendar} label={isRTL ? 'الموسم المفضل' : 'Preferred Season'}                   className="w-full sm:w-[170px]" />
    </div>
  );
}

// ─── Main SearchBar ───────────────────────────────────────────────────────────

export function SearchBar() {
  const { isRTL, lang } = useLanguage();
  const { settings } = useData();
  const navigate = useNavigate();

  // Unintegrated search tabs must never appear as operational booking engines.
  const visibleTabs = ALL_TABS.filter((tab) => ['packages', 'evisa'].includes(tab.id) && settings[tab.settingKey]);
  const tabs = visibleTabs.length > 0 ? visibleTabs : ALL_TABS.filter(tab => tab.id === 'packages');

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id ?? 'packages');
  const resolvedTab: TabId = tabs.find((t) => t.id === activeTab) ? activeTab : tabs[0]?.id ?? 'packages';

  // e-Visa selections (lifted here so handleSearch can use them)
  const [eVisaCountry, setEVisaCountry] = useState('');
  const [eVisaNationality, setEVisaNationality] = useState('SA');

  const renderForm = () => {
    switch (resolvedTab) {
      case 'flights':      return <FlightsForm isRTL={isRTL} />;
      case 'hotels':       return <HotelsForm isRTL={isRTL} />;
      case 'chalets':      return <ChaletsForm isRTL={isRTL} />;
      case 'evisa':
        return (
          <EVisaForm
            isRTL={isRTL}
            onCountryChange={setEVisaCountry}
            onNationalityChange={setEVisaNationality}
          />
        );
      case 'destinations': return <DestinationsForm isRTL={isRTL} />;
      case 'packages':     return <PackagesForm isRTL={isRTL} />;
      default:             return <PackagesForm isRTL={isRTL} />;
    }
  };

  const handleSearch = () => {
    if (resolvedTab === 'packages') {
      navigate('/packages');
    } else if (resolvedTab === 'evisa') {
      const params = new URLSearchParams();
      if (eVisaCountry) params.set('country', eVisaCountry);
      if (eVisaNationality) params.set('nationality', eVisaNationality);
      navigate(`/evisa?${params.toString()}`);
    } else if (resolvedTab === 'destinations') {
      navigate('/packages');
    }
  };

  return (
    <div className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Tab strip — horizontally scrollable on mobile ── */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex w-max min-w-full select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = resolvedTab === tab.id;
            const label = lang === 'ar' ? tab.label_ar : tab.label_en;
            const badge = lang === 'ar' ? tab.badge_ar : tab.badge_en;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 px-3 sm:px-5 py-2.5 sm:py-3 min-w-[64px] sm:min-w-[80px] rounded-t-xl text-[11px] sm:text-[13px] font-medium transition-all duration-150 focus:outline-none flex-1 sm:flex-none ${
                  isActive
                    ? 'bg-white text-[#fd2452] shadow-[inset_0_-2px_0_0_#fd2452]'
                    : 'bg-white/70 text-gray-500 hover:bg-white hover:text-[#fd2452]'
                }`}
              >
                {badge && (
                  <span className="absolute top-1 end-1 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded-sm font-bold leading-none">
                    {badge}
                  </span>
                )}
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Card — stacks vertically on mobile, horizontal on sm+ ── */}
      <div className="bg-white rounded-b-2xl rounded-e-2xl border-2 border-[#fd2452] shadow-[0_12px_35px_-8px_rgba(253,36,82,0.18)] flex flex-col sm:flex-row overflow-visible">

        {/* Form content */}
        <div className="flex-1 p-3 sm:p-4 relative overflow-visible">
          {renderForm()}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-[#fd2452] hover:bg-[#e61b46] active:bg-[#c4143a] text-white px-6 py-3.5 sm:py-0 flex items-center justify-center gap-2 sm:flex-col sm:gap-1.5 flex-shrink-0 rounded-b-2xl sm:rounded-b-none sm:rounded-e-2xl transition-colors focus:outline-none sm:min-w-[80px] mt-0"
        >
          <Search className="w-5 h-5" />
          <span className="text-[13px] font-medium">{isRTL ? 'ابحث' : 'Search'}</span>
        </button>
      </div>
    </div>
  );
}

export default SearchBar;