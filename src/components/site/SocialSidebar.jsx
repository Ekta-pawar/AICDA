import { Facebook, Twitter, Youtube, Phone, MapPin } from "lucide-react";

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.876.514 3.632 1.409 5.135L2 22l5.03-1.379A9.958 9.958 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.2a8.17 8.17 0 01-4.166-1.14l-.299-.177-3.096.848.827-3.02-.194-.31A8.163 8.163 0 013.8 12c0-4.53 3.671-8.2 8.201-8.2 4.529 0 8.2 3.67 8.2 8.2 0 4.53-3.671 8.2-8.2 8.2z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/j.s.nayol.2025/",
    label: "Facebook",
    bg: "#1877F2",
  },
  {
    icon: Twitter,
    href: "https://x.com/jsnayol?t=kpZp7oAjFZN6ZXUwSHQ56g&s=08",
    label: "Twitter",
    bg: "#1DA1F2",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@jagjeetnayol1187",
    label: "YouTube",
    bg: "#FF0000",
  },
  {
    icon: WhatsAppIcon,
    href: "https://api.whatsapp.com/send?phone=8587036564",
    label: "WhatsApp",
    bg: "#25D366",
  },
  { icon: Phone, href: "tel:+918587036564", label: "Call us", bg: "#22C55E" },
  {
    icon: MapPin,
    href: "https://www.google.com/maps/place/All+India+Car+Dealers+Association/@28.7140637,77.148982,612m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390d015f4101483d:0xe958df023b5b757b!8m2!3d28.714059!4d77.1515525!16s%2Fg%2F11rncx4950?hl=en",
    label: "Location",
    bg: "#EA4335",
  },
];

export function SocialSidebar() {
  return (
    <div className="fixed right-1 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1.5 sm:right-2 sm:gap-2">
      {SOCIAL_LINKS.map(({ icon: Icon, href, label, bg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          style={{ backgroundColor: bg }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition hover:scale-110 sm:h-10 sm:w-10"
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
      ))}
    </div>
  );
}
