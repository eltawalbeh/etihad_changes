import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { buildWhatsAppUrl, recordWhatsAppClick } from '../lib/siteTracking';

export function WhatsAppButton() {
  const { isRTL } = useLanguage();
  const { settings } = useData();
  const whatsappNumber = settings?.whatsapp || '966560074845';

  // Hidden when admin has turned off the WhatsApp button
  if (settings?.show_whatsapp_button === false) return null;

  return (
    <a
      href={buildWhatsAppUrl(whatsappNumber)}
      onClick={() => recordWhatsAppClick({ source: 'floating_button' })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed bottom-6 z-50 group ${isRTL ? 'left-6' : 'right-6'}`}
    >
      <div className="relative">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 animation-delay-300" />
        {/* Button */}
        <div className="relative w-14 h-14 bg-[#25D366] hover:bg-[#1fba59] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110">
          <MessageCircle size={26} className="text-white" fill="white" />
        </div>
      </div>
    </a>
  );
}