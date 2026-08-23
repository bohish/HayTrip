import React, { useState, useEffect } from "react";
import {
  Search, Plane, Building2, Star, MapPin, Calendar, Users,
  ChevronRight, ChevronLeft, Share2, TrendingDown, Zap,
  Award, Check, Heart, User, Home as HomeIcon, Plus, Settings as SettingsIcon,
  MessageCircle, Luggage, SlidersHorizontal, ArrowUpRight, ShieldCheck,
  BadgeCheck, ChevronDown, Bookmark, Wifi, BatteryFull, History, HelpCircle,
  LogOut, Bell, ExternalLink, Wand2
} from "lucide-react";

/* HayTrip's own AI visual language — a travel path with an integrated
   airplane, used everywhere a generic "AI sparkle" would normally go. */
/* HayTrip's signature AI/route mark — echoes the logo's own diagonal
   travel path (not a generic straight dashed line), so the "AI is
   working" indicator is visibly the same brand mark everywhere. */
function RouteMark({ size = 16, color = "#22C55E" }) {
  const w = size * 1.9;
  return (
    <svg width={w} height={size * 1.05} viewBox="0 0 36 19" style={{ flexShrink: 0 }}>
      <circle cx="3" cy="15.5" r="2.3" fill={color} />
      <path d="M6 15 C 15 15.5, 21 9, 27 5" stroke={color} strokeWidth="1.6" strokeDasharray="2.4 2.8" fill="none" strokeLinecap="round" opacity="0.55" />
      <g transform="translate(29.5,4) rotate(50)">
        <path d="M0,-5.6 L3.5,3.7 L0,1.7 L-3.5,3.7 Z" fill={color} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Approved brand tokens                                               */
/* ------------------------------------------------------------------ */
const C = {
  navy: "#0B1523",
  green: "#16C784",
  greenDark: "#0FA46C",
  teal: "#0F766E",
  off: "#F2F4F7",
  white: "#FFFFFF",
  line: "#E4E8ED",
  ink: "#10161F",
  muted: "#74808C",
  greenSoft: "#E8FBF3",
  navySoft: "#EAEEF2",
  cream: "#FFF3E0",
  creamInk: "#8A5A17",
  warning: "#F59E0B",
  error: "#E11D48",
};
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@300;400;500;700&display=swap";

/* ------------------------------------------------------------------ */
/* Mock data                                                            */
/* ------------------------------------------------------------------ */
const U = (id) => `https://images.unsplash.com/photo-${id}?w=1000&q=80&auto=format&fit=crop`;
const IMG = {
  istanbul: [U("1524231757912-21f4fe3a7200"), U("1524292332709-9527df22e1e6"), U("1541432901042-2d8bd64b4a9b")],
  istanbul2: [U("1541432901042-2d8bd64b4a9b"), U("1601921004897-b7d582002468")],
  paris: [U("1502602898657-3e91760cbb34"), U("1499856871958-5b9627545d1a"), U("1431274172761-fca41d930114")],
  tokyo: [U("1540959733332-eab4deabeeaf"), U("1503899036084-c55cdd92da26"), U("1490761668535-35497054764d")],
  london: [U("1513635269975-59663e0ac1ad"), U("1486299267070-83823f5448dd")],
  hotel1: [U("1566073771259-6a8506099945"), U("1571003123894-1f0594d2b5d9")],
  hotel2: [U("1551882547-ff40c63fe5fa"), U("1445019980597-93fa8acb246c")],
  bosphorus: [U("1527838832700-5059252407fa"), U("1524231757912-21f4fe3a7200")],
};

const DESTINATIONS = [
  { id: "ist", ar: "إسطنبول", en: "Istanbul", flag: "🇹🇷", img: IMG.istanbul, tag: "الأكثر بحثًا" },
  { id: "par", ar: "باريس", en: "Paris", flag: "🇫🇷", img: IMG.paris, tag: "رومانسية" },
  { id: "tok", ar: "طوكيو", en: "Tokyo", flag: "🇯🇵", img: IMG.tokyo, tag: "تجربة مختلفة" },
  { id: "lon", ar: "لندن", en: "London", flag: "🇬🇧", img: IMG.london, tag: "ثقافية" },
];

/* ------------------------------------------------------------------ */
/* Trip fixture - stands in for TripRequest until Phase 2 populates it   */
/* from parsed natural language. Every screen reads trip facts from      */
/* here; no screen hardcodes a destination, date, or traveler count.     */
/* ------------------------------------------------------------------ */
const TRIP = {
  originCity: "جدة",
  originCode: "JED",
  destinationCity: "إسطنبول",
  destinationCountry: "تركيا",
  destinationEn: "ISTANBUL",
  destinationCode: "IST",
  flag: "🇹🇷",
  datesAr: "20 – 24 أكتوبر",
  datesEn: "20–24 OCTOBER",
  days: 5,
  nights: 4,
  travelers: 2,
  travelersAr: "شخصان",
  budget: 7000,
  currency: "SAR",
};

/* Mock data is shaped to the Phase 3 normalized models (provider, currency,
   deepLink included) so provider adapters can replace these constants
   without any component changes.

   PRICE SEMANTICS (defined during the Phase 1 review):
   - FlightResult.price            = total for the whole party
   - FlightResult.pricePerTraveler = per person
   - HotelResult.pricePerNight     = per night; stay total = pricePerNight * TRIP.nights
   Nothing multiplies these again at render time. */
const FLIGHTS = [
  { id: "f1", provider: "saudia-direct", airline: "الخطوط السعودية", code: "SV", color: C.greenDark, origin: "JED", destination: "IST", depart: "10:30", arrive: "14:20", duration: "6س 20د", durationMin: 380, stops: "مباشر", stopCount: 0, baggage: "23kg", pricePerTraveler: 1420, price: 2840, currency: "SAR", cls: "اقتصادية", tag: "أفضل قيمة", deepLink: "https://www.saudia.com/booking?ref=haytrip&itin=f1" },
  { id: "f2", provider: "flynas-direct", airline: "طيران ناس", code: "XY", color: C.navy, origin: "JED", destination: "IST", depart: "07:15", arrive: "11:35", duration: "6س 50د", durationMin: 410, stops: "مباشر", stopCount: 0, baggage: "20kg", pricePerTraveler: 1195, price: 2390, currency: "SAR", cls: "اقتصادية", tag: "الأرخص", deepLink: "https://www.flynas.com/booking?ref=haytrip&itin=f2" },
  { id: "f3", provider: "turkish-direct", airline: "تركيش إيرلاينز", code: "TK", color: "#B91C3B", origin: "JED", destination: "IST", depart: "23:40", arrive: "05:10", duration: "7س 00د", durationMin: 420, stops: "توقف واحد", stopCount: 1, baggage: "30kg", pricePerTraveler: 1575, price: 3150, currency: "SAR", cls: "اقتصادية", tag: "الأسرع", deepLink: "https://www.turkishairlines.com/booking?ref=haytrip&itin=f3" },
  { id: "f4", provider: "emirates-direct", airline: "طيران الإمارات", code: "EK", color: "#B08900", origin: "JED", destination: "IST", depart: "16:20", arrive: "23:45", duration: "9س 55د", durationMin: 595, stops: "توقف واحد", stopCount: 1, baggage: "30kg", pricePerTraveler: 1740, price: 3480, currency: "SAR", cls: "بزنس", tag: null, deepLink: "https://www.emirates.com/booking?ref=haytrip&itin=f4" },
];


const HOTELS = [
  { id: "h1", provider: "booking", providerLabel: "Booking.com", name: "CVK Park Bosphorus", rating: 4.7, reviews: 2140, pricePerNight: 780, currency: "SAR", img: IMG.hotel1, area: "تقسيم · قريب من الأماكن السياحية", room: "غرفة ديلوكس · سرير كبير", amen: ["إفطار مجاني", "مسبح", "سبا"], cancel: "إلغاء مجاني حتى 48 ساعة", deepLink: "https://www.booking.com/hotel/cvk-park?aid=haytrip" },
  { id: "h2", provider: "agoda", providerLabel: "Agoda", name: "The Ottoman Palace Hotel", rating: 4.5, reviews: 1380, pricePerNight: 590, currency: "SAR", img: IMG.hotel2, area: "السلطان أحمد · قلب المدينة القديمة", room: "غرفة مزدوجة كلاسيك", amen: ["إفطار مجاني", "إطلالة بحر"], cancel: "غير قابل للاسترجاع", deepLink: "https://www.agoda.com/ottoman-palace?cid=haytrip" },
  { id: "h3", provider: "official", providerLabel: "الموقع الرسمي", name: "Bosphorus Grand Suites", rating: 4.8, reviews: 960, pricePerNight: 1050, currency: "SAR", img: IMG.bosphorus, area: "بشكطاش · إطلالة على المضيق", room: "جناح بإطلالة على المضيق", amen: ["مسبح", "نادي رياضي", "سبا"], cancel: "إلغاء مجاني حتى 24 ساعة", deepLink: "https://bosphorusgrand.com/reserve?ref=haytrip" },
];

/* Provider price comparison for the recommended hotel. The best row must
   equal HOTELS[h1].pricePerNight — the headline price IS the best price found. */
const SOURCES = [
  { name: "Booking.com", price: 780, note: "إلغاء مجاني" },
  { name: "Agoda", price: 795, note: "خصم أعضاء" },
  { name: "Expedia", price: 812, note: "دفع عند الوصول" },
  { name: "الموقع الرسمي", price: 830, note: "بدون رسوم إضافية" },
];

/* Recommendation model — reasonAr is required by design. A recommendation
   without an explanation is not a valid recommendation (§06).
   Deltas below are asserted against the actual result objects by
   assertFixtureConsistency() so the copy can never drift from the data. */
const RECOMMENDATIONS = {
  flight: {
    targetId: "f1",
    category: "bestValue",
    reasonAr: "رشحت لك هذا الخيار لأنه أفضل توازن بين السعر والراحة. هو أغلى من أرخص خيار بـ450 ريال فقط، لكنه مباشر ويصل نهارًا — يوفّر عليك ليلة كاملة في المطار.",
    comparedTo: { id: "f2", priceDelta: 450 },
  },
  hotel: {
    targetId: "h1",
    category: "best",
    reasonAr: "رشحت لك هذا الفندق لأنه في تقسيم — قريب من الأماكن التي طلبتها في خطتك، وتقييمه 4.7 مع إلغاء مجاني، ويبقى ضمن ميزانيتك بعد حساب الطيران.",
    comparedTo: { id: "h2", priceDelta: 190 },
  },
};

const CHEAPEST_NOT_BEST = "الأرخص ليس بالضرورة الأفضل — قارنّا السعر مع مدة الرحلة والتوقفات والأمتعة.";

/* Single source of truth for trip cost. Used by the itinerary, the share
   card, and (in Phase 2) the recommendation engine's budget check. */
const ACTIVITIES_ESTIMATE = 900;
function computeTripBudget(flight, hotel) {
  const flights = flight.price;                        // already party total
  const stay = hotel.pricePerNight * TRIP.nights;
  const activities = ACTIVITIES_ESTIMATE;
  const total = flights + stay + activities;
  return {
    flights, stay, activities, total,
    currency: TRIP.currency,
    withinBudget: total <= TRIP.budget,
    remaining: TRIP.budget - total,
  };
}

/* Dev-time guard: the mock fixtures must stay internally consistent, because
   Phase 2's reasoning engine will treat them as ground truth. */
function assertFixtureConsistency() {
  const out = [];
  const f = FLIGHTS.find((x) => x.id === RECOMMENDATIONS.flight.targetId);
  const fc = FLIGHTS.find((x) => x.id === RECOMMENDATIONS.flight.comparedTo.id);
  if (f.price - fc.price !== RECOMMENDATIONS.flight.comparedTo.priceDelta) out.push("flight priceDelta");
  FLIGHTS.forEach((x) => { if (x.pricePerTraveler * TRIP.travelers !== x.price) out.push("flight price split: " + x.id); });
  const h = HOTELS.find((x) => x.id === RECOMMENDATIONS.hotel.targetId);
  const hc = HOTELS.find((x) => x.id === RECOMMENDATIONS.hotel.comparedTo.id);
  if (h.pricePerNight - hc.pricePerNight !== RECOMMENDATIONS.hotel.comparedTo.priceDelta) out.push("hotel priceDelta");
  if (Math.min(...SOURCES.map((x) => x.price)) !== h.pricePerNight) out.push("hotel best source price");
  if (!computeTripBudget(f, h).withinBudget) out.push("recommended trip exceeds stated budget");
  if (ITINERARY_DAYS.length !== TRIP.days) out.push("itinerary day count");
  if (out.length && typeof console !== "undefined") console.warn("HayTrip fixture inconsistency:", out);
  return out;
}

const ITINERARY_DAYS = [
  { title: "الوصول والاستقرار", date: "20 أكتوبر", img: IMG.istanbul,
    items: [
      { key: "arrive", time: "10:30", icon: Plane, activity: "الوصول إلى إسطنبول", loc: "مطار إسطنبول الدولي", desc: "استلام الحقائب والانتقال إلى الجمارك.", tip: "أنصحك بحجز سيارة استقبال مسبقًا لتفادي الازدحام عند الخروج." },
      { key: "transfer", time: "12:00", icon: MapPin, activity: "الانتقال إلى الفندق", loc: "تقسيم", desc: "الانتقال من المطار إلى الفندق." },
      { key: "checkin", time: "14:00", icon: BadgeCheck, activity: "تسجيل الدخول", loc: "الفندق", desc: "راحة قصيرة قبل استكشاف المنطقة." },
      { time: "18:00", icon: MapPin, activity: "جولة في المنطقة", loc: "تقسيم واستقلال", desc: "تعرف على محيط الفندق مشيًا." },
      { time: "20:00", icon: Star, activity: "عشاء ترحيبي", loc: "مطعم Mikla", desc: "إطلالة بانورامية على المدينة." },
    ] },
  { title: "استكشاف إسطنبول القديمة", date: "21 أكتوبر", img: IMG.bosphorus,
    items: [
      { time: "09:00", icon: MapPin, activity: "آيا صوفيا", loc: "السلطان أحمد", desc: "جولة تاريخية داخل أحد أهم معالم العالم.", tip: "أنصحك بزيارة آيا صوفيا قبل الساعة 11 لتجنب الازدحام." },
      { time: "11:00", icon: MapPin, activity: "المسجد الأزرق", loc: "السلطان أحمد", desc: "تحفة معمارية عثمانية." },
      { time: "13:00", icon: Star, activity: "غداء تركي تقليدي", loc: "مطعم Deraliye", desc: "أطباق من المطبخ العثماني الأصيل." },
      { time: "15:30", icon: MapPin, activity: "البازار الكبير", loc: "Grand Bazaar", desc: "تسوق وتجربة أسواق مغطاة تاريخية." },
      { time: "20:00", icon: Star, activity: "عشاء وجولة نيلية", loc: "مضيق البوسفور", desc: "رحلة بحرية مسائية مع عشاء." },
    ] },
  { title: "الجانب الآسيوي والتسوق", date: "22 أكتوبر", img: IMG.istanbul2,
    items: [
      { time: "10:00", icon: MapPin, activity: "حي كاديكوي", loc: "الجانب الآسيوي", desc: "أجواء محلية وأسواق نابضة بالحياة." },
      { time: "13:00", icon: Star, activity: "غداء مأكولات بحرية", loc: "ميناء كاديكوي", desc: "أطباق طازجة على الواجهة البحرية." },
      { time: "16:00", icon: MapPin, activity: "شارع الاستقلال", loc: "تقسيم", desc: "تسوق وترام تاريخي." },
    ] },
  { title: "قصر توبكابي والقصور", date: "23 أكتوبر", img: IMG.bosphorus,
    items: [
      { time: "09:30", icon: MapPin, activity: "قصر توبكابي", loc: "السلطان أحمد", desc: "مقر السلاطين العثمانيين لقرون." },
      { time: "13:00", icon: Star, activity: "غداء", loc: "منطقة القصر", desc: "استراحة غداء خفيفة." },
      { time: "15:00", icon: MapPin, activity: "قصر دولمابهتشة", loc: "بشكطاش", desc: "قصر أوروبي الطراز على البوسفور." },
      { time: "19:30", icon: Star, activity: "عشاء وداعي", loc: "مطعم 360 Istanbul", desc: "أمسية أخيرة بإطلالة مميزة." },
    ] },
  { title: "المغادرة", date: "24 أكتوبر", img: IMG.istanbul,
    items: [
      { key: "checkout", time: "09:00", icon: BadgeCheck, activity: "تسجيل الخروج", loc: "الفندق", desc: "تجهيز الحقائب والمغادرة." },
      { time: "10:30", icon: MapPin, activity: "وقت حر للتسوق", loc: "تقسيم", desc: "هدايا تذكارية أخيرة." },
      { key: "depart", time: "14:00", icon: Plane, activity: "التوجه للمطار", loc: "مطار إسطنبول الدولي", desc: "الرحلة عودة إلى نقطة الانطلاق." },
    ] },
];

/* Day 1 and the final day depend on the flight the user actually chose and
   the hotel they actually selected. Everything else is destination content.
   Phase 2 replaces this with generated days; the shape stays the same. */
function buildItineraryDays(flight, hotel) {
  return ITINERARY_DAYS.map((day, i) => {
    if (i === 0) {
      return { ...day, items: day.items.map((it) => {
        if (it.key === "arrive") return { ...it, time: flight.arrive, activity: `الوصول إلى ${TRIP.destinationCity}` };
        if (it.key === "transfer") return { ...it, desc: `الانتقال من المطار إلى ${hotel.name}.` };
        if (it.key === "checkin") return { ...it, loc: hotel.name };
        return it;
      }) };
    }
    if (i === ITINERARY_DAYS.length - 1) {
      return { ...day, items: day.items.map((it) => {
        if (it.key === "checkout") return { ...it, loc: hotel.name };
        if (it.key === "depart") return { ...it, desc: `الرحلة عودة إلى ${TRIP.originCity} مع ${flight.airline}.` };
        return it;
      }) };
    }
    return day;
  });
}

const MY_TRIPS = [
  { id: "t1", ar: TRIP.destinationCity, en: "Istanbul", flag: TRIP.flag, img: IMG.istanbul, dates: TRIP.datesAr, status: "قادمة", statusColor: C.greenDark },
  { id: "t2", ar: "باريس", en: "Paris", flag: "🇫🇷", img: IMG.paris, dates: "15 – 22 سبتمبر", status: "منتهية", statusColor: C.muted },
];

const UNDERSTAND_STEPS = ["فهم الوجهة", "فهم التواريخ", "فهم الميزانية", "فهم عدد المسافرين", "فهم تفضيلاتك"];
const SEARCH_STEPS = ["البحث عن الرحلات", "مقارنة الأسعار", "البحث عن الفنادق", "مقارنة الأسعار", "تحليل الخيارات", "تجهيز التوصيات"];

const WHAT_IF_OPTIONS = [
  { icon: TrendingDown, label: "أرخص" },
  { icon: Zap, label: "بدون توقف" },
  { icon: Calendar, label: "غيّر التاريخ" },
  { icon: Building2, label: "فندق أرخص" },
  { icon: Star, label: "فندق أفضل" },
];

const FEATURES = [
  { icon: Wand2, label: "ذكاء اصطناعي يفهمك" },
  { icon: Search, label: "بحث ومقارنة الأسعار" },
  { icon: Calendar, label: "خطة رحلة متكاملة" },
  { icon: HelpCircle, label: "دعم على مدار الساعة" },
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */
function Img({ src, className, style }) {
  const list = Array.isArray(src) ? src : [src];
  const [idx, setIdx] = useState(0);
  if (idx >= list.length) {
    return (
      <div className={className} style={{ ...style, background: `linear-gradient(135deg, ${C.navy}, ${C.greenDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MapPin color="#fff" opacity={0.6} size={26} />
      </div>
    );
  }
  return <img src={list[idx]} className={className} style={style} onError={() => setIdx((i) => i + 1)} />;
}
function Riyal({ v }) { return <span>{v.toLocaleString("en")} ر.س</span>; }

/* Logo — approved mark: bold H with a green travel path curving through it, ending in an integrated airplane */
function Logo({ size = 30, dark = false, wordmark = true }) {
  const strong = dark ? "#F5F1E6" : C.navy;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size * 1.1 }}>
        <svg width={size} height={size * 1.1} viewBox="0 0 40 44">
          <rect x="6" y="3" width="7" height="38" rx="3" fill={strong} />
          <rect x="27" y="3" width="7" height="38" rx="3" fill={strong} />
          <rect x="6" y="18.5" width="28" height="7" rx="3" fill={strong} />
          <path d="M10 39 C 16 29, 22 22, 30 9" stroke={C.green} strokeWidth="3.6" fill="none" strokeLinecap="round" />
        </svg>
        <Plane size={size * 0.32} color={C.green} fill={C.green} strokeWidth={0.5} style={{ position: "absolute", top: -size * 0.06, right: -size * 0.1, transform: "rotate(48deg)" }} />
      </div>
      {wordmark && (
        <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: size * 0.58, color: strong, letterSpacing: 0.2 }}>
          Hay<span style={{ color: C.green }}>Trip</span>
        </span>
      )}
    </div>
  );
}

function PrimaryButton({ children, onClick, style, icon: Icon, full = true }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: C.green, color: "#fff", border: "none", borderRadius: 16, padding: "14px 20px",
        fontFamily: "Cairo", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8, width: full ? "100%" : "auto",
        boxShadow: "0 10px 20px -8px rgba(34,197,94,0.5)", cursor: "pointer", ...style,
      }}
    >
      {children} {Icon && <Icon size={17} />}
    </button>
  );
}
function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ background: C.white, color: C.navy, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "13px 18px", fontFamily: "Cairo", fontWeight: 700, fontSize: 14, width: "100%", cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}
function Header({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", background: C.off, position: "sticky", top: 0, zIndex: 20 }}>
      <button onClick={onBack} style={{ background: C.white, border: `1px solid ${C.line}`, width: 34, height: 34, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ChevronRight size={17} color={C.navy} />
      </button>
      <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 15, color: C.navy }}>{title}</div>
      <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{right}</div>
    </div>
  );
}
function Badge({ children, bg = C.greenSoft, color = C.greenDark, icon: Icon }) {
  return (
    <span style={{ background: bg, color, fontFamily: "Tajawal", fontWeight: 700, fontSize: 11.5, padding: "4.5px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
      {Icon && <Icon size={11} />} {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 01 — Splash                                                   */
/* ------------------------------------------------------------------ */
function ScreenSplash({ go }) {
  useEffect(() => {
    const t = setTimeout(() => go("home"), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div onClick={() => go("home")} style={{ height: "100%", background: `linear-gradient(175deg, ${C.navy}, #0F2A3C)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.22), transparent 70%)", top: -40 }} />
      <div style={{ animation: "fadeUp .9s ease" }}>
        <Logo size={64} dark wordmark={false} />
      </div>
      <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 34, color: "#F5F1E6", marginTop: 18, animation: "fadeUp 1s ease .1s both" }}>
        Hay<span style={{ color: C.green }}>Trip</span>
      </div>
      <div style={{ fontFamily: "Tajawal", fontSize: 13, color: "rgba(245,241,230,0.65)", marginTop: 4, letterSpacing: 1 }}>AI TRAVEL AGENT</div>
      <div style={{ fontFamily: "Cairo", fontWeight: 600, fontSize: 15, color: "#fff", marginTop: 24, textAlign: "center", animation: "fadeUp 1s ease .2s both" }}>
        رحلتك تبدأ بفكرة.. ونكملها لك
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 30, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 1s ease .3s both" }}>
        {FEATURES.map((f) => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 72 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <f.icon size={16} color={C.green} />
            </div>
            <span style={{ fontFamily: "Tajawal", fontSize: 9.5, color: "rgba(245,241,230,0.7)", textAlign: "center", lineHeight: 1.3 }}>{f.label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 26, width: 32, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
      <style>{`@keyframes fadeUp{from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);}}`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 02 — Home                                                     */
/* ------------------------------------------------------------------ */
function ScreenHome({ go, chat, setChat, favorites, toggleFav }) {
  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ background: `linear-gradient(165deg, ${C.navy}, #0F2A3C)`, padding: "18px 16px 92px", borderRadius: "0 0 30px 30px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -40, top: -40, width: 170, height: 170, borderRadius: "50%", background: "rgba(34,197,94,0.16)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <Logo dark size={26} />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}>
              <Bell size={15} color="#fff" />
            </button>
            <button onClick={() => go("profile")} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}>
              <User size={15} color="#fff" />
            </button>
          </div>
        </div>
        <div style={{ marginTop: 24, position: "relative" }}>
          <h1 style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 25, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: 0.2 }}>وين ودك تروح؟</h1>
          <p style={{ fontFamily: "Tajawal", color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 5, fontWeight: 300 }}>خل HayTrip تخططها لك</p>
        </div>
      </div>

      <div style={{ margin: "-70px 16px 0", background: C.white, borderRadius: 20, padding: 18, boxShadow: "0 18px 36px -18px rgba(11,29,42,0.4)", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <Logo wordmark={false} size={22} />
          <div>
            <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 13.5, color: C.navy, lineHeight: 1.1 }}>HayTrip</div>
            <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.teal, fontWeight: 500, marginTop: 1 }}>وكيل سفرك الذكي</div>
          </div>
        </div>
        <textarea
          value={chat} onChange={(e) => setChat(e.target.value)} rows={3}
          placeholder="اكتب طلب رحلتك بطريقتك... مثال: أبي أروح إسطنبول 5 أيام لشخصين وبميزانية 7,000 ريال"
          style={{ width: "100%", resize: "none", border: `1.5px solid ${C.line}`, borderRadius: 13, padding: 12, fontFamily: "Tajawal", fontSize: 13, color: C.ink, outline: "none", background: C.off, boxSizing: "border-box", lineHeight: 1.7 }}
        />
        <div style={{ marginTop: 13 }}>
          <PrimaryButton icon={Plane} onClick={() => go(chat.trim() ? "aiChat" : "aiChat")}>ابدأ مع HayTrip AI</PrimaryButton>
        </div>
        <button onClick={() => go("manualChoice")} style={{ background: "none", border: "none", width: "100%", textAlign: "center", marginTop: 9, fontFamily: "Tajawal", fontSize: 12.5, color: C.muted, cursor: "pointer" }}>
          تبي تبحث بنفسك؟
        </button>
      </div>

      <div style={{ padding: "26px 16px 0" }}>
        <div style={{ fontFamily: "Tajawal", fontSize: 11.5, color: C.muted, marginBottom: 9 }}>أو ابحث يدويًا</div>
        <div style={{ display: "flex", gap: 9 }}>
          <button onClick={() => go("manualFlights")} style={{ flex: 1, background: C.off, border: "none", borderRadius: 14, padding: "11px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Plane size={14} color={C.navy} />
            <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.navy }}>الرحلات</span>
          </button>
          <button onClick={() => go("manualHotels")} style={{ flex: 1, background: C.off, border: "none", borderRadius: 14, padding: "11px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Building2 size={14} color={C.navy} />
            <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.navy }}>الفنادق</span>
          </button>
        </div>
      </div>

      <div style={{ padding: "30px 16px 0" }}>
        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 11 }}>وجهات ملهمة</div>
        <div style={{ display: "flex", gap: 11, overflowX: "auto", paddingBottom: 6, marginInline: -16, paddingInline: 16 }}>
          {DESTINATIONS.map((d) => (
            <div key={d.id} onClick={() => { setChat(`أبي أروح ${d.ar} 5 أيام لشخصين`); go("aiChat"); }} style={{ minWidth: 142, borderRadius: 17, overflow: "hidden", position: "relative", height: 178, cursor: "pointer", flexShrink: 0 }}>
              <Img src={d.img} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,29,42,0.85), transparent 55%)" }} />
              <button onClick={(e) => { e.stopPropagation(); toggleFav(d.id); }} style={{ position: "absolute", top: 9, left: 9, width: 27, height: 27, borderRadius: 9, background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}>
                <Heart size={12.5} color="#fff" fill={favorites.has(d.id) ? "#fff" : "none"} />
              </button>
              <div style={{ position: "absolute", top: 9, right: 9 }}><Badge bg="rgba(255,255,255,0.92)" color={C.navy}>{d.tag}</Badge></div>
              <div style={{ position: "absolute", bottom: 11, right: 11, left: 11 }}>
                <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 15, color: "#fff" }}>{d.flag} {d.ar}</div>
                <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>{d.en}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 03 — AI Travel Agent (conversation + understanding summary)  */
/* ------------------------------------------------------------------ */
function ScreenAIChat({ go, back, chat }) {
  const msg = chat.trim() || "أبي أروح إسطنبول 5 أيام لشخصين وميزانيتي 7 آلاف وأبي فندق قريب من الأماكن السياحية.";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="HayTrip" onBack={back} right={<Logo wordmark={false} size={17} />} />
      <div style={{ textAlign: "center", fontFamily: "Tajawal", fontSize: 11.5, color: C.teal, fontWeight: 500, marginTop: -6, marginBottom: 6 }}>وكيل سفرك الذكي</div>
      <div style={{ flex: 1, padding: "0 16px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <div style={{ background: C.navy, color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "11px 14px", maxWidth: "84%", fontFamily: "Tajawal", fontSize: 13, lineHeight: 1.7 }}>{msg}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: 9, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Logo wordmark={false} size={13} dark />
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "16px 16px 16px 4px", padding: "13px 14px", maxWidth: "86%" }}>
            <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: C.navy, marginBottom: 8 }}>تمام، فهمت طلبك</div>
            {[["الوجهة", `${TRIP.destinationCity}، ${TRIP.destinationCountry}`], ["المدة", `${TRIP.days} أيام / ${TRIP.nights} ليالٍ`], ["المسافرون", TRIP.travelersAr], ["الميزانية", `${TRIP.budget.toLocaleString("en")} ريال`], ["تفضيلات الفندق", "قريب من الأماكن السياحية"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>{k}</span>
                <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.navy }}>{v}</span>
              </div>
            ))}
            <div style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.ink, marginTop: 10 }}>أبدأ البحث لك؟</div>
          </div>
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", gap: 10, background: C.off }}>
        <div style={{ flex: 1 }}><GhostButton onClick={back}>تعديل الطلب</GhostButton></div>
        <div style={{ flex: 1.3 }}><PrimaryButton icon={Plane} onClick={() => go("aiThinking")}>ابدأ البحث</PrimaryButton></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screens 04+05 — Understanding + Searching (combined progressive)     */
/* ------------------------------------------------------------------ */
function ScreenAIThinking({ go }) {
  const ALL = [...UNDERSTAND_STEPS.map((s) => ({ label: s, phase: 1 })), ...SEARCH_STEPS.map((s) => ({ label: s, phase: 2 }))];
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step < ALL.length) {
      const t = setTimeout(() => setStep(step + 1), 430);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => go("aiResults"), 450);
      return () => clearTimeout(t);
    }
  }, [step]);
  const phase = step < UNDERSTAND_STEPS.length ? 1 : 2;
  const progress = Math.min(step / ALL.length, 1);
  return (
    <div style={{ height: "100%", background: `linear-gradient(175deg, ${C.navy}, #0F2A3C)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <Logo wordmark={false} size={40} dark />
      <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 15.5, color: "#fff", marginTop: 18, marginBottom: 2 }}>
        {phase === 1 ? "HayTrip يفهم طلبك..." : "HayTrip تبحث لك..."}
      </div>
      <div style={{ fontFamily: "Tajawal", fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 22 }}>لحظات ونجهز لك التوصيات</div>

      {/* HayTrip travel-path progress — a plane journeying along the route, not a generic spinner */}
      <div style={{ width: 220, height: 26, position: "relative", marginBottom: 26 }}>
        <div style={{ position: "absolute", top: "50%", left: 4, right: 4, height: 2, background: "rgba(255,255,255,0.14)", borderRadius: 2, transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: 4, width: `calc(${progress * 100}% - 8px)`, height: 2, background: C.green, borderRadius: 2, transform: "translateY(-50%)", transition: "width .4s ease" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, width: 8, height: 8, borderRadius: "50%", background: C.green, transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", right: 0, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.25)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: `calc(${progress * 100}% - 9px)`, transform: "translateY(-50%) rotate(90deg)", transition: "left .4s ease" }}>
          <Plane size={18} color={C.green} fill={C.green} strokeWidth={0} />
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: 11 }}>
        {ALL.map((s, i) => (
          <div key={s.label + i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: i <= step ? 1 : 0.3, transition: "opacity .25s" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: i < step ? C.green : i === step ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {i < step ? <Check size={11} color="#fff" /> : i === step ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "blink 1s infinite" }} /> : null}
            </div>
            <span style={{ fontFamily: "Tajawal", fontSize: 12.5, color: "#fff" }}>{s.label}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 06 — AI Recommendation                                        */
/* ------------------------------------------------------------------ */
function FlightCard({ f, onClick, selected }) {
  return (
    <div onClick={onClick} style={{ background: C.white, border: `1.5px solid ${selected ? C.green : C.line}`, borderRadius: 17, padding: 15, cursor: "pointer", position: "relative" }}>
      {f.tag && <div style={{ position: "absolute", top: -9, right: 14 }}><Badge bg={C.navy} color="#fff">{f.tag}</Badge></div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Cairo", fontWeight: 800, fontSize: 10.5 }}>{f.code}</div>
          <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: C.navy }}>{f.airline}</span>
        </div>
        <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 15.5, color: C.greenDark }}><Riyal v={f.price} /></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14, color: C.navy }}>{f.depart}</div>
          <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>جدة</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>{f.duration}</div>
          <div style={{ height: 1, background: C.line, margin: "4px 0" }} />
          <div style={{ fontFamily: "Tajawal", fontSize: 10, color: f.stops === "مباشر" ? C.greenDark : C.muted }}>{f.stops}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14, color: C.navy }}>{f.arrive}</div>
          <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>إسطنبول</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
        <Badge bg={C.off} color={C.muted} icon={Luggage}>{f.baggage}</Badge>
        <Badge bg={C.off} color={C.muted}>{f.cls}</Badge>
      </div>
    </div>
  );
}
function HotelCard({ h, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 17, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ height: 130, position: "relative" }}>
        <Img src={h.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 9, right: 9 }}><Badge bg="rgba(255,255,255,0.92)" color={C.navy} icon={Star}>{h.rating}</Badge></div>
      </div>
      <div style={{ padding: 13 }}>
        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13.5, color: C.navy }}>{h.name}</div>
        <div style={{ fontFamily: "Tajawal", fontSize: 11.5, color: C.muted, marginTop: 3 }}>{h.area}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{h.amen.map((a) => <Badge key={a} bg={C.off} color={C.muted}>{a}</Badge>)}</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 11 }}>
          <span style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>يبدأ من</span>
          <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 16, color: C.greenDark }}><Riyal v={h.pricePerNight} /> <span style={{ fontFamily: "Tajawal", fontWeight: 400, fontSize: 10.5, color: C.muted }}>/ الليلة</span></span>
        </div>
      </div>
    </div>
  );
}

/* The WHY block — reused for both flight and hotel recommendations so the
   explanation is structurally part of every recommendation, not ad-hoc. */
function WhyBlock({ reason }) {
  return (
    <div style={{ background: C.cream, borderRadius: 13, padding: 12, marginTop: 11, display: "flex", gap: 9 }}>
      <div style={{ marginTop: 3, flexShrink: 0 }}><RouteMark size={12} color={C.creamInk} /></div>
      <div>
        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 11.5, color: C.creamInk, marginBottom: 3 }}>لماذا اخترنا هذا؟</div>
        <span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.creamInk, lineHeight: 1.7 }}>{reason}</span>
      </div>
    </div>
  );
}

function ScreenAIResults({ go, back, selectedFlight, selectedHotel, setSelectedFlight, setSelectedHotel, setWhatIfOpen }) {
  const best = FLIGHTS.find((f) => f.id === RECOMMENDATIONS.flight.targetId);
  const bestHotel = HOTELS.find((h) => h.id === RECOMMENDATIONS.hotel.targetId);
  const flightPick = selectedFlight || best;
  const hotelPick = selectedHotel || bestHotel;
  return (
    <div style={{ paddingBottom: 24 }}>
      <Header title="توصية HayTrip" onBack={back} right={<MessageCircle size={15} color={C.navy} />} />
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: C.greenSoft, borderRadius: 15, padding: 13, display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 15 }}>
          <div style={{ marginTop: 4, flexShrink: 0 }}><RouteMark size={13} color={C.greenDark} /></div>
          <div style={{ fontFamily: "Tajawal", fontSize: 12, color: C.ink, lineHeight: 1.6 }}>
            <b style={{ fontFamily: "Cairo", color: C.navy }}>حللنا لك الخيارات.</b> {TRIP.destinationCity}، {TRIP.days} أيام، {TRIP.travelersAr}، ميزانية {TRIP.budget.toLocaleString("en")} ريال. هذا أفضل ترشيح لك:
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}><Award size={15} color={C.green} /><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14, color: C.navy }}>اختيار HayTrip لك</span></div>
        <FlightCard f={best} selected={flightPick.id === best.id} onClick={() => { setSelectedFlight(best); go("flightDetails"); }} />

        <WhyBlock reason={RECOMMENDATIONS.flight.reasonAr} />

        <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
          {[{ icon: TrendingDown, label: "الأرخص", price: 2390 }, { icon: Zap, label: "الأسرع", price: 3150 }, { icon: Star, label: "أفضل قيمة", price: 2840, strong: true }].map((c) => (
            <div key={c.label} style={{ flex: 1, background: C.white, border: `1px solid ${c.strong ? C.green : C.line}`, borderRadius: 13, padding: "11px 6px", textAlign: "center" }}>
              <c.icon size={15} color={c.strong ? C.greenDark : C.navy} style={{ marginBottom: 5 }} />
              <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>{c.label}</div>
              <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 12, color: C.navy }}><Riyal v={c.price} /></div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "Tajawal", fontSize: 11, color: C.muted, marginTop: 9, lineHeight: 1.6 }}>{CHEAPEST_NOT_BEST}</div>

        <div style={{ marginTop: 15 }}><GhostButton onClick={() => go("flightResults")}>عرض جميع نتائج الرحلات</GhostButton></div>

        <button onClick={() => setWhatIfOpen(true)} style={{ width: "100%", background: C.navySoft, border: "none", borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><RouteMark size={13} color={C.greenDark} /><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.navy }}>جرّب سيناريو آخر</span></div>
          <ChevronLeft size={15} color={C.navy} />
        </button>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}><Building2 size={15} color={C.green} /><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14, color: C.navy }}>وترشيح الفندق</span></div>
        <HotelCard h={bestHotel} onClick={() => { setSelectedHotel(bestHotel); go("hotelDetails"); }} />
        <WhyBlock reason={RECOMMENDATIONS.hotel.reasonAr} />
        <div style={{ marginTop: 10 }}><GhostButton onClick={() => go("hotelResults")}>عرض جميع الفنادق</GhostButton></div>

        <div style={{ marginTop: 18 }}><PrimaryButton icon={Plane} onClick={() => { setSelectedFlight(flightPick); setSelectedHotel(hotelPick); go("tripSetup"); }}>هذا الاختيار — كمّل الرحلة</PrimaryButton></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Manual search                                                        */
/* ------------------------------------------------------------------ */
function ScreenManualChoice({ go, back }) {
  return (
    <div>
      <Header title="ابحث بنفسك" onBack={back} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {[["manualFlights", Plane, C.navySoft, C.navy, "✈️ الرحلات", "ابحث وقارن الرحلات يدويًا"], ["manualHotels", Building2, C.greenSoft, C.greenDark, "🏨 الفنادق", "ابحث وقارن الفنادق يدويًا"]].map(([key, Icon, bg, col, title, sub]) => (
          <div key={key} onClick={() => go(key)} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 17, padding: 16, display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={20} color={col} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14, color: C.navy }}>{title}</div>
              <div style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>
            </div>
            <ChevronLeft size={17} color={C.muted} />
          </div>
        ))}
      </div>
    </div>
  );
}
function FieldRow({ label, value, icon: Icon }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 13, padding: "12px 13px", display: "flex", alignItems: "center", gap: 9 }}>
      <Icon size={15} color={C.green} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>{label}</div>
        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: C.navy }}>{value}</div>
      </div>
      <ChevronDown size={14} color={C.muted} />
    </div>
  );
}
function ScreenManualFlights({ go, back }) {
  return (
    <div>
      <Header title="بحث الرحلات" onBack={back} />
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ flex: 1 }}><FieldRow label="من" value={`${TRIP.originCity} (${TRIP.originCode})`} icon={Plane} /></div>
          <div style={{ flex: 1 }}><FieldRow label="إلى" value={`${TRIP.destinationCity} (${TRIP.destinationCode})`} icon={MapPin} /></div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ flex: 1 }}><FieldRow label="الذهاب" value="20 أكتوبر" icon={Calendar} /></div>
          <div style={{ flex: 1 }}><FieldRow label="العودة" value="25 أكتوبر" icon={Calendar} /></div>
        </div>
        <FieldRow label="المسافرون والدرجة" value="شخصان · اقتصادية" icon={Users} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}><SlidersHorizontal size={14} color={C.muted} /><span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>فلاتر: مباشر، أمتعة مسجلة</span></div>
        <div style={{ marginTop: 6 }}><PrimaryButton icon={Search} onClick={() => go("flightResults")}>بحث عن الرحلات</PrimaryButton></div>
      </div>
    </div>
  );
}
function ScreenManualHotels({ go, back }) {
  return (
    <div>
      <Header title="بحث الفنادق" onBack={back} />
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
        <FieldRow label="الوجهة" value={`${TRIP.destinationCity}، ${TRIP.destinationCountry}`} icon={MapPin} />
        <div style={{ display: "flex", gap: 9 }}>
          <div style={{ flex: 1 }}><FieldRow label="تسجيل الدخول" value="20 أكتوبر" icon={Calendar} /></div>
          <div style={{ flex: 1 }}><FieldRow label="تسجيل الخروج" value="25 أكتوبر" icon={Calendar} /></div>
        </div>
        <FieldRow label="الضيوف والغرف" value="شخصان · غرفة واحدة" icon={Users} />
        <div style={{ marginTop: 6 }}><PrimaryButton icon={Search} onClick={() => go("hotelResults")}>بحث عن الفنادق</PrimaryButton></div>
      </div>
    </div>
  );
}

/* "ساعدني أختار" — the AI analysing the results the user is already looking
   at. Keeps the agent available inside manual search without taking over. */
function HelpMeChoose({ reason }) {
  const [state, setState] = useState("idle"); // idle | thinking | done
  if (state === "idle") {
    return (
      <button onClick={() => { setState("thinking"); setTimeout(() => setState("done"), 850); }}
        style={{ width: "100%", background: C.navySoft, border: "none", borderRadius: 13, padding: "12px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RouteMark size={13} color={C.greenDark} />
          <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>ساعدني أختار</span>
        </div>
        <ChevronLeft size={15} color={C.navy} />
      </button>
    );
  }
  if (state === "thinking") {
    return (
      <div style={{ background: C.off, border: `1px solid ${C.line}`, borderRadius: 13, padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <Plane size={14} color={C.greenDark} style={{ animation: "flyX 1s ease-in-out infinite" }} />
        <span style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.navy }}>HayTrip تحلل هذه النتائج...</span>
        <style>{`@keyframes flyX{0%,100%{transform:translateX(0);}50%{transform:translateX(4px);}}`}</style>
      </div>
    );
  }
  return <div style={{ marginTop: -11 }}><WhyBlock reason={reason} /></div>;
}

/* ------------------------------------------------------------------ */
/* Screen 07 — Flight comparison (with sort tabs)                       */
/* ------------------------------------------------------------------ */
function ScreenFlightResults({ go, back, setSelectedFlight }) {
  const [sort, setSort] = useState("best");
  const list = [...FLIGHTS].sort((a, b) => sort === "cheap" ? a.price - b.price : sort === "fast" ? a.durationMin - b.durationMin : (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
  return (
    <div style={{ paddingBottom: 24 }}>
      <Header title="مقارنة الرحلات" onBack={back} right={<SlidersHorizontal size={15} color={C.navy} />} />
      <div style={{ padding: "0 16px", fontFamily: "Tajawal", fontSize: 12, color: C.muted, marginBottom: 10 }}>{TRIP.originCity} → {TRIP.destinationCity} · {TRIP.datesAr} · {TRIP.travelersAr} · {FLIGHTS.length} خيارات</div>
      <div style={{ padding: "0 16px", display: "flex", gap: 8, marginBottom: 12 }}>
        {[["best", "الأفضل"], ["cheap", "الأرخص"], ["fast", "الأسرع"]].map(([k, l]) => (
          <button key={k} onClick={() => setSort(k)} style={{ flex: 1, background: sort === k ? C.navy : C.white, color: sort === k ? "#fff" : C.navy, border: `1px solid ${sort === k ? C.navy : C.line}`, borderRadius: 11, padding: "8px 0", fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5 }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "0 16px", marginBottom: 13 }}><HelpMeChoose reason={RECOMMENDATIONS.flight.reasonAr} /></div>
      <div style={{ padding: "0 16px", fontFamily: "Tajawal", fontSize: 11, color: C.muted, marginBottom: 11, lineHeight: 1.6 }}>{CHEAPEST_NOT_BEST}</div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 11 }}>
        {list.map((f) => <FlightCard key={f.id} f={f} onClick={() => { setSelectedFlight(f); go("flightDetails"); }} />)}
      </div>
    </div>
  );
}
function ScreenHotelResults({ go, back, setSelectedHotel }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <Header title="مقارنة الفنادق" onBack={back} right={<SlidersHorizontal size={15} color={C.navy} />} />
      <div style={{ padding: "0 16px", fontFamily: "Tajawal", fontSize: 12, color: C.muted, marginBottom: 10 }}>{TRIP.destinationCity} · {TRIP.datesAr} · {TRIP.travelersAr} · {HOTELS.length} خيارات</div>
      <div style={{ padding: "0 16px", marginBottom: 13 }}><HelpMeChoose reason={RECOMMENDATIONS.hotel.reasonAr} /></div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 13 }}>
        {HOTELS.map((h) => <HotelCard key={h.id} h={h} onClick={() => { setSelectedHotel(h); go("hotelDetails"); }} />)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screens 09/10 — Details (+ floating CTA rendered by App)             */
/* ------------------------------------------------------------------ */
function ScreenFlightDetails({ back, flight }) {
  const f = flight || FLIGHTS[0];
  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ height: 200, position: "relative" }}>
        <Img src={IMG.istanbul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,29,42,0.55), transparent 40%)" }} />
        <div style={{ position: "absolute", top: 14, right: 16, left: 16, display: "flex", justifyContent: "space-between" }}>
          <button onClick={back} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={17} color="#fff" /></button>
          <button style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={15} color="#fff" /></button>
        </div>
      </div>
      <div style={{ background: C.white, borderRadius: "20px 20px 0 0", marginTop: -20, position: "relative", padding: 18 }}>
        <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 17, color: C.navy }}>{f.airline}</div>
        <div style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted, marginTop: 2 }}>جدة (JED) → إسطنبول (IST)</div>
        <div style={{ background: C.off, borderRadius: 15, padding: 15, marginTop: 15, display: "flex", alignItems: "center" }}>
          <div style={{ textAlign: "center", flex: 1 }}><div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 18, color: C.navy }}>{f.depart}</div><div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>جدة</div></div>
          <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>{f.duration}</div><Plane size={14} color={C.green} style={{ transform: "rotate(-90deg)", margin: "4px 0" }} /><div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.greenDark }}>{f.stops}</div></div>
          <div style={{ textAlign: "center", flex: 1 }}><div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 18, color: C.navy }}>{f.arrive}</div><div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>إسطنبول</div></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13.5, color: C.navy, marginBottom: 9 }}>الشروط والمزايا</div>
          {[["أمتعة مسجلة", f.baggage], ["الدرجة", f.cls], ["حقيبة يد", "7kg"], ["الإلغاء", "برسوم", true]].map(([k, v, warn]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.muted }}>{k}</span>
              <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: warn ? C.warning : C.navy }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ScreenHotelDetails({ back, hotel }) {
  const h = hotel || HOTELS[0];
  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ height: 220, position: "relative" }}>
        <Img src={h.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,29,42,0.5), transparent 40%)" }} />
        <div style={{ position: "absolute", top: 14, right: 16, left: 16, display: "flex", justifyContent: "space-between" }}>
          <button onClick={back} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={17} color="#fff" /></button>
          <button style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={15} color="#fff" /></button>
        </div>
      </div>
      <div style={{ background: C.white, borderRadius: "20px 20px 0 0", marginTop: -20, position: "relative", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 17, color: C.navy }}>{h.name}</div><div style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted, marginTop: 3 }}>{h.area}</div></div>
          <Badge icon={Star}>{h.rating} ({h.reviews})</Badge>
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 13, flexWrap: "wrap" }}>{h.amen.map((a) => <Badge key={a} bg={C.off} color={C.navy} icon={Check}>{a}</Badge>)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}>
          <ShieldCheck size={14} color={h.cancel.includes("غير قابل") ? C.warning : C.greenDark} />
          <span style={{ fontFamily: "Tajawal", fontSize: 12, color: h.cancel.includes("غير قابل") ? C.warning : C.navy }}>{h.cancel}</span>
        </div>
        <div style={{ marginTop: 17 }}>
          <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13.5, color: C.navy, marginBottom: 9 }}>أفضل سعر وجدناه — مقارنة المصادر</div>
          {SOURCES.map((s, i) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 11px", background: i === 0 ? C.greenSoft : C.off, borderRadius: 11, marginBottom: 7, border: i === 0 ? `1px solid ${C.green}` : "none" }}>
              <div><div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>{s.name}</div><div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>{s.note}</div></div>
              <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 13.5, color: i === 0 ? C.greenDark : C.navy }}><Riyal v={s.price} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 11 — External booking mock                                    */
/* ------------------------------------------------------------------ */
function ScreenExternalBooking({ back, kind, flight, hotel, onContinue }) {
  const isFlight = kind === "flight";
  const item = isFlight ? (flight || FLIGHTS[0]) : (hotel || HOTELS[0]);
  const provider = isFlight ? item.airline : item.providerLabel;
  const price = isFlight ? item.price : item.pricePerNight * TRIP.nights;
  const host = (() => { try { return new URL(item.deepLink).host; } catch { return item.deepLink; } })();
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Header title="الانتقال للحجز" onBack={back} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 26, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <ExternalLink size={26} color={C.greenDark} />
        </div>
        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 15.5, color: C.navy, marginBottom: 6 }}>ستنتقل الآن إلى موقع الحجز لإكمال العملية</div>
        <div style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.muted, lineHeight: 1.7, marginBottom: 22 }}>HayTrip لا يقوم بالحجز مباشرة — سنأخذك إلى الموقع الشريك لإتمام حجزك بأمان.</div>
        <div style={{ width: "100%", background: C.off, borderRadius: 15, padding: 15, textAlign: "right" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0" }}><span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>الموقع</span><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>{provider}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.line}` }}><span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>{isFlight ? "الرحلة" : "الفندق"}</span><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>{isFlight ? `${TRIP.originCity} → ${TRIP.destinationCity}` : item.name}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.line}` }}><span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>{isFlight ? `الإجمالي · ${TRIP.travelersAr}` : `الإجمالي · ${TRIP.nights} ليالٍ`}</span><span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 13.5, color: C.greenDark }}><Riyal v={price} /></span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.line}` }}><span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>الرابط</span><span style={{ fontFamily: "Inter, Tajawal", fontSize: 11, color: C.muted, direction: "ltr" }}>{host}</span></div>
        </div>
      </div>
      <div style={{ padding: 16 }}><PrimaryButton icon={ArrowUpRight} onClick={onContinue}>متابعة</PrimaryButton></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 12 — Trip setup                                               */
/* ------------------------------------------------------------------ */
function ScreenTripSetup({ back, go, flight, hotel }) {
  const f = flight || FLIGHTS.find((x) => x.id === RECOMMENDATIONS.flight.targetId);
  const h = hotel || HOTELS.find((x) => x.id === RECOMMENDATIONS.hotel.targetId);
  return (
    <div>
      <Header title="تجهيز الرحلة" onBack={back} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 3 }}>جهزنا أساس رحلتك 🎉</div>
        <div style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.muted, marginBottom: 16 }}>خل HayTrip تكملها لك</div>

        {[
          { icon: MapPin, label: "الوجهة", value: `${TRIP.destinationCity}، ${TRIP.destinationCountry}` },
          { icon: Calendar, label: "التواريخ", value: `${TRIP.datesAr} · ${TRIP.nights} ليالٍ` },
          { icon: Users, label: "المسافرون", value: TRIP.travelersAr },
          { icon: Plane, label: "الرحلة", value: `${f.airline} · ${f.depart}`, sub: <Riyal v={f.price} /> },
          { icon: Building2, label: "الفندق", value: h.name, sub: <><Riyal v={h.pricePerNight} /> / الليلة</> },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 13, marginBottom: 9 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><r.icon size={16} color={C.greenDark} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>{r.label}</div>
              <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>{r.value}</div>
            </div>
            {r.sub && <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 12.5, color: C.greenDark }}>{r.sub}</div>}
          </div>
        ))}

        <div style={{ marginTop: 16 }}><PrimaryButton icon={Plane} onClick={() => go("itinerary")}>أنشئ خطة رحلتي</PrimaryButton></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screens 13/14/15 — Trip overview + daily itinerary + day details     */
/* ------------------------------------------------------------------ */
function ScreenItinerary({ back, go, setShareOpen, setWhatIfOpen, setDayIndex, flight, hotel }) {
  const f = flight || FLIGHTS.find((x) => x.id === RECOMMENDATIONS.flight.targetId);
  const h = hotel || HOTELS.find((x) => x.id === RECOMMENDATIONS.hotel.targetId);
  const budget = computeTripBudget(f, h);
  const days = buildItineraryDays(f, h);
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ height: 210, position: "relative" }}>
        <Img src={IMG.istanbul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,29,42,0.55), rgba(11,29,42,0.15) 60%, transparent)" }} />
        <div style={{ position: "absolute", top: 14, right: 16, left: 16, display: "flex", justifyContent: "space-between" }}>
          <button onClick={back} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={17} color="#fff" /></button>
          <button onClick={() => setShareOpen(true)} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><Share2 size={15} color="#fff" /></button>
        </div>
        <div style={{ position: "absolute", bottom: 14, right: 16, left: 16 }}>
          <Badge bg={C.green} color="#fff" icon={BadgeCheck}>خطتك جاهزة</Badge>
          <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 21, color: "#fff", marginTop: 7 }}>{TRIP.flag} {TRIP.destinationEn}</div>
          <div style={{ fontFamily: "Tajawal", fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{TRIP.datesEn} · {TRIP.travelersAr} · {TRIP.days} أيام</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Reflects the actual selections carried from search */}
        <div style={{ display: "flex", gap: 9, marginBottom: 16 }}>
          <div style={{ flex: 1, background: C.off, borderRadius: 13, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <Plane size={15} color={C.greenDark} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>{TRIP.originCity} → {TRIP.destinationCity}</div>
              <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 11.5, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.airline}</div>
              <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>الوصول {f.arrive}</div>
            </div>
          </div>
          <div style={{ flex: 1, background: C.off, borderRadius: 13, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <Building2 size={15} color={C.greenDark} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>الفندق</div>
              <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 11.5, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</div>
              <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>{TRIP.nights} ليالٍ</div>
            </div>
          </div>
        </div>

        <button onClick={() => setWhatIfOpen(true)} style={{ width: "100%", background: C.navySoft, border: "none", borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><RouteMark size={13} color={C.greenDark} /><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.navy }}>جرّب سيناريو آخر</span></div>
          <ChevronLeft size={15} color={C.navy} />
        </button>

        {/* Estimated budget — derived from the actual selections, not invented */}
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 15, padding: 14, marginBottom: 18 }}>
          <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: C.navy, marginBottom: 10 }}>الميزانية التقديرية</div>
          {[[`الطيران · ${TRIP.travelersAr}`, budget.flights], [`الفندق · ${TRIP.nights} ليالٍ`, budget.stay], ["الأنشطة والتنقل (تقديري)", budget.activities]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontFamily: "Tajawal", fontSize: 11.5, color: C.muted }}>{k}</span>
              <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.navy }}><Riyal v={v} /></span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6, borderTop: `1px solid ${C.line}` }}>
            <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>الإجمالي</span>
            <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 15, color: C.greenDark }}><Riyal v={budget.total} /></span>
          </div>
          <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: budget.withinBudget ? C.greenDark : C.warning, marginTop: 7 }}>
            {budget.withinBudget ? `ضمن ميزانيتك — يتبقى ${budget.remaining.toLocaleString("en")} ر.س` : `أعلى من ميزانيتك بـ ${Math.abs(budget.remaining).toLocaleString("en")} ر.س`}
          </div>
        </div>

        <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 12 }}>خطة رحلتك</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {days.map((day, di) => (
            <React.Fragment key={di}>
              <div onClick={() => { setDayIndex(di); go("dayDetail"); }} style={{ borderRadius: 17, overflow: "hidden", position: "relative", height: 108, cursor: "pointer" }}>
                <Img src={day.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(11,29,42,0.15), rgba(11,29,42,0.82))" }} />
                <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 11, color: "#fff" }}>{di + 1}</span>
                </div>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
                  <div>
                    <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: "rgba(255,255,255,0.7)" }}>اليوم {di + 1} · {day.date}</div>
                    <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14.5, color: "#fff", marginTop: 2 }}>{day.title}</div>
                    <div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>{day.items.length} أنشطة</div>
                  </div>
                  <ChevronLeft size={18} color="#fff" />
                </div>
              </div>
              {di < days.length - 1 && (
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "3px 21px" }}>
                  <div style={{ width: 2, height: 14, background: `repeating-linear-gradient(to bottom, ${C.green} 0 3px, transparent 3px 6px)` }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 9 }}>
          <PrimaryButton icon={Share2} onClick={() => setShareOpen(true)}>مشاركة الرحلة</PrimaryButton>
          <GhostButton onClick={() => go("myTrips")}>الذهاب إلى رحلاتي</GhostButton>
        </div>
      </div>
    </div>
  );
}

function ScreenDayDetail({ back, dayIndex, flight, hotel }) {
  const f = flight || FLIGHTS.find((x) => x.id === RECOMMENDATIONS.flight.targetId);
  const h = hotel || HOTELS.find((x) => x.id === RECOMMENDATIONS.hotel.targetId);
  const days = buildItineraryDays(f, h);
  const day = days[dayIndex] || days[0];
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ height: 190, position: "relative" }}>
        <Img src={day.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,29,42,0.55), transparent 45%)" }} />
        <button onClick={back} style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={17} color="#fff" /></button>
        <div style={{ position: "absolute", bottom: 14, right: 16, left: 16 }}>
          <div style={{ fontFamily: "Tajawal", fontSize: 11, color: "rgba(255,255,255,0.75)" }}>اليوم {dayIndex + 1} · {day.date}</div>
          <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 19, color: "#fff" }}>{day.title}</div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        {day.items.map((it, ii) => (
          <div key={ii} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><it.icon size={14} color={C.greenDark} /></div>
              {ii < day.items.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.line, margin: "3px 0" }} />}
            </div>
            <div style={{ paddingBottom: 18, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12, color: C.greenDark }}>{it.time}</span>
                <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13.5, color: C.navy }}>{it.activity}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}><MapPin size={11} color={C.muted} /><span style={{ fontFamily: "Tajawal", fontSize: 11.5, color: C.muted }}>{it.loc}</span></div>
              <div style={{ fontFamily: "Tajawal", fontSize: 12, color: C.ink, marginTop: 4, lineHeight: 1.6 }}>{it.desc}</div>
              {it.tip && (
                <div style={{ display: "flex", gap: 7, background: C.navySoft, borderRadius: 11, padding: 10, marginTop: 8 }}>
                  <div style={{ flexShrink: 0, marginTop: 3 }}><RouteMark size={11} color={C.greenDark} /></div>
                  <span style={{ fontFamily: "Tajawal", fontSize: 11.5, color: C.navy, lineHeight: 1.6 }}>{it.tip}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sheets — What-if + Share                                             */
/* ------------------------------------------------------------------ */
function WhatIfSheet({ open, onClose }) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | searching | done
  const runScenario = () => {
    setPhase("searching");
    setTimeout(() => setPhase("done"), 900);
  };
  useEffect(() => { if (!open) { setPhase("idle"); setText(""); } }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(11,29,42,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, width: "100%", borderRadius: "22px 22px 0 0", padding: 18, maxHeight: "72%", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: C.line, borderRadius: 2, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}><RouteMark size={15} color={C.green} /><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 14.5, color: C.navy }}>جرّب سيناريو آخر</span></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 13 }}>
          {WHAT_IF_OPTIONS.map((o) => (
            <button key={o.label} onClick={runScenario} style={{ display: "flex", alignItems: "center", gap: 6, background: C.off, border: `1px solid ${C.line}`, borderRadius: 999, padding: "8px 13px", fontFamily: "Tajawal", fontSize: 12, color: C.navy }}>
              <o.icon size={12} color={C.green} /> {o.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ماذا لو غيرت تاريخ السفر يومين؟" style={{ flex: 1, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "10px 13px", fontFamily: "Tajawal", fontSize: 12.5, outline: "none" }} />
          <button onClick={runScenario} style={{ background: C.green, border: "none", borderRadius: 12, width: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowUpRight size={16} color="#fff" /></button>
        </div>
        {phase === "searching" && (
          <div style={{ marginTop: 13, background: C.off, borderRadius: 13, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <Plane size={14} color={C.greenDark} style={{ animation: "flyX 1s ease-in-out infinite" }} />
            <span style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.navy }}>أعدنا البحث...</span>
          </div>
        )}
        {phase === "done" && (
          <div style={{ marginTop: 13, background: C.greenSoft, borderRadius: 13, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <RouteMark size={13} color={C.greenDark} />
            <span style={{ fontFamily: "Tajawal", fontSize: 12.5, color: C.navy }}>وجدنا خيارًا أوفر بـ620 ر.س.</span>
          </div>
        )}
        <style>{`@keyframes flyX{0%,100%{transform:translateX(0);}50%{transform:translateX(4px);}}`}</style>
      </div>
    </div>
  );
}
function ShareSheet({ open, onClose, flight, hotel }) {
  const f = flight || FLIGHTS.find((x) => x.id === RECOMMENDATIONS.flight.targetId);
  const h = hotel || HOTELS.find((x) => x.id === RECOMMENDATIONS.hotel.targetId);
  const budget = computeTripBudget(f, h);
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(11,29,42,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 22, overflow: "hidden", width: "100%" }}>
        <div style={{ height: 230, position: "relative" }}>
          <Img src={IMG.bosphorus} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,29,42,0.94), rgba(11,29,42,0.1))" }} />
          <div style={{ position: "absolute", top: 14, right: 14 }}><Logo dark size={20} /></div>
          <div style={{ position: "absolute", bottom: 16, right: 16, left: 16 }}>
            <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 19, color: "#fff" }}>{TRIP.flag} {TRIP.destinationEn}</div>
            <div style={{ fontFamily: "Tajawal", fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 3 }}>{TRIP.datesEn}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
              <Badge bg="rgba(255,255,255,0.2)" color="#fff">✈️ {f.airline}</Badge>
              <Badge bg="rgba(255,255,255,0.2)" color="#fff">🏨 {h.name}</Badge>
              <Badge bg="rgba(255,255,255,0.2)" color="#fff">📍 {TRIP.days} أيام</Badge>
              <Badge bg="rgba(255,255,255,0.2)" color="#fff">≈ {budget.total.toLocaleString("en")} ر.س</Badge>
            </div>
            <div style={{ fontFamily: "Tajawal", fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>خطة أعدّتها HayTrip · الأسعار تقديرية</div>
          </div>
        </div>
        <div style={{ padding: 15 }}><PrimaryButton icon={Share2} onClick={onClose}>مشاركة الصورة</PrimaryButton></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* My Trips / Favorites / Profile / Settings                            */
/* ------------------------------------------------------------------ */
function ScreenMyTrips({ go }) {
  return (
    <div style={{ paddingBottom: 92 }}>
      <div style={{ padding: "18px 16px 4px" }}><span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 19, color: C.navy }}>رحلاتي</span></div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 13 }}>
        {MY_TRIPS.map((t) => (
          <div key={t.id} onClick={() => go("itinerary")} style={{ borderRadius: 18, overflow: "hidden", position: "relative", height: 138, cursor: "pointer" }}>
            <Img src={t.img} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,29,42,0.85), transparent 55%)" }} />
            <div style={{ position: "absolute", top: 11, left: 11 }}><Badge bg="rgba(255,255,255,0.92)" color={t.statusColor}>{t.status}</Badge></div>
            <div style={{ position: "absolute", bottom: 12, right: 14, left: 14 }}>
              <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 15.5, color: "#fff" }}>{t.flag} {t.ar}</div>
              <div style={{ fontFamily: "Tajawal", fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{t.dates}</div>
            </div>
          </div>
        ))}
        <div onClick={() => go("home")} style={{ border: `1.5px dashed ${C.line}`, borderRadius: 18, height: 86, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}>
          <Plus size={18} color={C.green} /><span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.muted }}>خطط رحلة جديدة</span>
        </div>
      </div>
    </div>
  );
}
function ScreenFavorites({ favorites, go }) {
  const items = DESTINATIONS.filter((d) => favorites.has(d.id));
  return (
    <div style={{ paddingBottom: 92 }}>
      <div style={{ padding: "18px 16px 4px" }}><span style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 19, color: C.navy }}>المفضلة</span></div>
      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Heart size={30} color={C.line} style={{ marginBottom: 9 }} />
          <div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13.5, color: C.navy }}>لا شيء هنا بعد</div>
          <div style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted, marginTop: 4 }}>اضغط على ♡ عند أي وجهة لحفظها هنا</div>
        </div>
      ) : (
        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {items.map((d) => (
            <div key={d.id} onClick={() => go("home")} style={{ borderRadius: 15, overflow: "hidden", position: "relative", height: 138, cursor: "pointer" }}>
              <Img src={d.img} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,29,42,0.8), transparent)" }} />
              <div style={{ position: "absolute", bottom: 9, right: 9 }}><div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: "#fff" }}>{d.flag} {d.ar}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function ScreenProfile({ go }) {
  const rows = [
    { icon: Bookmark, label: "رحلاتي", action: () => go("myTrips") },
    { icon: Heart, label: "المفضلة", action: () => go("favorites") },
    { icon: History, label: "محفوظات البحث", action: () => go("searchHistory") },
    { icon: SettingsIcon, label: "الإعدادات", action: () => go("settings") },
    { icon: HelpCircle, label: "المساعدة", action: () => {} },
  ];
  return (
    <div style={{ paddingBottom: 92 }}>
      <div style={{ background: `linear-gradient(165deg, ${C.navy}, #0F2A3C)`, padding: "24px 16px 30px", borderRadius: "0 0 26px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo", fontWeight: 800, fontSize: 20, color: "#fff" }}>ه</div>
          <div><div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 16, color: "#fff" }}>Hesham</div><div style={{ fontFamily: "Tajawal", fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>عضو HayTrip</div></div>
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 9, marginTop: -14 }}>
        {rows.map((r) => (
          <div key={r.label} onClick={r.action} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 15, padding: "13px 15px", display: "flex", alignItems: "center", gap: 11, cursor: "pointer", boxShadow: "0 4px 14px -8px rgba(11,29,42,0.15)" }}>
            <div style={{ width: 33, height: 33, borderRadius: 10, background: C.off, display: "flex", alignItems: "center", justifyContent: "center" }}><r.icon size={15} color={C.green} /></div>
            <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: C.navy, flex: 1 }}>{r.label}</span>
            <ChevronLeft size={15} color={C.muted} />
          </div>
        ))}
      </div>
    </div>
  );
}
function ScreenSettings({ back }) {
  const rows = [
    ["اللغة", "العربية"], ["العملة", "ريال سعودي (SAR)"], ["الإشعارات", "مفعّلة"], ["الخصوصية والأمان", ""],
  ];
  return (
    <div>
      <Header title="الإعدادات" onBack={back} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 9 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: C.navy }}>{k}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {v && <span style={{ fontFamily: "Tajawal", fontSize: 12, color: C.muted }}>{v}</span>}
              <ChevronLeft size={14} color={C.muted} />
            </div>
          </div>
        ))}
        <button style={{ marginTop: 8, background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, color: C.error, fontFamily: "Cairo", fontWeight: 700, fontSize: 13, padding: "12px 4px" }}>
          <LogOut size={15} /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
function ScreenSearchHistory({ back }) {
  const items = [
    { q: "إسطنبول 5 أيام لشخصين", when: "أمس" },
    { q: "رحلات جدة → دبي", when: "قبل 3 أيام" },
    { q: "فنادق في باريس", when: "الأسبوع الماضي" },
  ];
  return (
    <div>
      <Header title="محفوظات البحث" onBack={back} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((it, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <History size={15} color={C.muted} />
            <div style={{ flex: 1 }}><div style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 12.5, color: C.navy }}>{it.q}</div><div style={{ fontFamily: "Tajawal", fontSize: 10.5, color: C.muted }}>{it.when}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom nav                                                           */
/* ------------------------------------------------------------------ */
function BottomNav({ view, go }) {
  const items = [
    { key: "home", label: "الرئيسية", icon: HomeIcon },
    { key: "myTrips", label: "رحلاتي", icon: Bookmark },
    { key: "__plus", label: "" },
    { key: "favorites", label: "المفضلة", icon: Heart },
    { key: "profile", label: "حسابي", icon: User },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", padding: "8px 8px 22px", zIndex: 30 }}>
      {items.map((it) =>
        it.key === "__plus" ? (
          <div key="plus" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button onClick={() => go("home")} style={{ width: 44, height: 44, borderRadius: "50%", background: C.green, border: "none", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -20, boxShadow: "0 8px 16px -6px rgba(34,197,94,0.6)" }}>
              <Plus size={20} color="#fff" />
            </button>
          </div>
        ) : (
          <button key={it.key} onClick={() => go(it.key)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "3px 0" }}>
            <it.icon size={18} color={view === it.key ? C.green : C.muted} fill={view === it.key && it.key === "favorites" ? C.green : "none"} strokeWidth={view === it.key ? 2.4 : 2} />
            <span style={{ fontFamily: "Tajawal", fontWeight: view === it.key ? 700 : 400, fontSize: 9.5, color: view === it.key ? C.green : C.muted }}>{it.label}</span>
          </button>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* iPhone chrome — status bar / notch / home indicator                  */
/* ------------------------------------------------------------------ */
function StatusBar({ dark }) {
  const col = dark ? "#fff" : C.navy;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", zIndex: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <BatteryFull size={16} color={col} />
        <Wifi size={13} color={col} />
        <div style={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
          {[4, 6, 8, 10].map((h, i) => <div key={i} style={{ width: 2.5, height: h, background: col, borderRadius: 1 }} />)}
        </div>
      </div>
      <span style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: 13, color: col }}>9:41</span>
    </div>
  );
}
function DynamicIsland() {
  return <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 100, height: 26, borderRadius: 16, background: "#000", zIndex: 41 }} />;
}
function HomeIndicator({ dark }) {
  return <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 128, height: 4.5, borderRadius: 3, background: dark ? "rgba(255,255,255,0.7)" : "rgba(11,29,42,0.55)", zIndex: 45 }} />;
}

/* ------------------------------------------------------------------ */
/* App root                                                             */
/* ------------------------------------------------------------------ */
const TAB_SCREENS = ["home", "myTrips", "favorites", "profile"];
const DARK_STATUS_SCREENS = ["splash", "home", "aiThinking", "flightDetails", "hotelDetails", "itinerary", "dayDetail", "profile"];

export default function App() {
  useEffect(() => { assertFixtureConsistency(); }, []);
  const [view, setView] = useState("splash");
  const [hist, setHist] = useState([]);
  const [chat, setChat] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [bookingKind, setBookingKind] = useState("flight");

  const go = (next) => { setHist((h) => [...h, view]); setView(next); };
  const back = () => {
    setHist((h) => {
      if (h.length === 0) { setView("home"); return h; }
      const copy = [...h]; const prev = copy.pop(); setView(prev); return copy;
    });
  };
  const toggleFav = (id) => setFavorites((f) => { const n = new Set(f); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const showBottomNav = TAB_SCREENS.includes(view);
  const showFloatingCTA = view === "flightDetails" || view === "hotelDetails";
  const darkStatus = DARK_STATUS_SCREENS.includes(view);

  let screen;
  switch (view) {
    case "splash": screen = <ScreenSplash go={go} />; break;
    case "home": screen = <ScreenHome go={go} chat={chat} setChat={setChat} favorites={favorites} toggleFav={toggleFav} />; break;
    case "aiChat": screen = <ScreenAIChat go={go} back={back} chat={chat} />; break;
    case "aiThinking": screen = <ScreenAIThinking go={go} />; break;
    case "aiResults": screen = <ScreenAIResults go={go} back={back} selectedFlight={selectedFlight} selectedHotel={selectedHotel} setSelectedFlight={setSelectedFlight} setSelectedHotel={setSelectedHotel} setWhatIfOpen={setWhatIfOpen} />; break;
    case "manualChoice": screen = <ScreenManualChoice go={go} back={back} />; break;
    case "manualFlights": screen = <ScreenManualFlights go={go} back={back} />; break;
    case "manualHotels": screen = <ScreenManualHotels go={go} back={back} />; break;
    case "flightResults": screen = <ScreenFlightResults go={go} back={back} setSelectedFlight={setSelectedFlight} />; break;
    case "hotelResults": screen = <ScreenHotelResults go={go} back={back} setSelectedHotel={setSelectedHotel} />; break;
    case "flightDetails": screen = <ScreenFlightDetails back={back} flight={selectedFlight} />; break;
    case "hotelDetails": screen = <ScreenHotelDetails back={back} hotel={selectedHotel} />; break;
    case "externalBooking": screen = <ScreenExternalBooking back={back} kind={bookingKind} flight={selectedFlight} hotel={selectedHotel} onContinue={back} />; break;
    case "tripSetup": screen = <ScreenTripSetup back={back} go={go} flight={selectedFlight} hotel={selectedHotel} />; break;
    case "itinerary": screen = <ScreenItinerary back={back} go={go} setShareOpen={setShareOpen} setWhatIfOpen={setWhatIfOpen} setDayIndex={setDayIndex} flight={selectedFlight} hotel={selectedHotel} />; break;
    case "dayDetail": screen = <ScreenDayDetail back={back} dayIndex={dayIndex} flight={selectedFlight} hotel={selectedHotel} />; break;
    case "myTrips": screen = <ScreenMyTrips go={go} />; break;
    case "favorites": screen = <ScreenFavorites favorites={favorites} go={go} />; break;
    case "profile": screen = <ScreenProfile go={go} />; break;
    case "settings": screen = <ScreenSettings back={back} />; break;
    case "searchHistory": screen = <ScreenSearchHistory back={back} />; break;
    default: screen = <ScreenHome go={go} chat={chat} setChat={setChat} favorites={favorites} toggleFav={toggleFav} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, #26333F, #12181F)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Tajawal, sans-serif" }}>
      <link rel="stylesheet" href={FONT_LINK} />
      {/* iPhone frame */}
      <div style={{ width: 390, height: 844, borderRadius: 55, background: "#000", padding: 12, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)", position: "relative", flexShrink: 0 }}>
        <div dir="rtl" lang="ar" style={{ width: "100%", height: "100%", borderRadius: 44, background: C.off, position: "relative", overflow: "hidden" }}>
          <StatusBar dark={darkStatus} />
          <DynamicIsland />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ height: 46 }} />
            {screen}
          </div>
          {showBottomNav && <BottomNav view={view} go={go} />}
          {showFloatingCTA && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.line}`, padding: "12px 16px 26px", display: "flex", alignItems: "center", gap: 12, zIndex: 30 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Tajawal", fontSize: 10, color: C.muted }}>{view === "flightDetails" ? `الإجمالي · ${TRIP.travelersAr}` : "لكل ليلة"}</div>
                <div style={{ fontFamily: "Cairo", fontWeight: 800, fontSize: 16, color: C.greenDark }}>
                  <Riyal v={view === "flightDetails" ? (selectedFlight || FLIGHTS[0]).price : (selectedHotel || HOTELS[0]).pricePerNight} />
                </div>
              </div>
              <div style={{ flex: 1.4 }}>
                <PrimaryButton icon={ArrowUpRight} onClick={() => { setBookingKind(view === "flightDetails" ? "flight" : "hotel"); go("externalBooking"); }}>عرض الحجز</PrimaryButton>
              </div>
            </div>
          )}
          <WhatIfSheet open={whatIfOpen} onClose={() => setWhatIfOpen(false)} />
          <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} flight={selectedFlight} hotel={selectedHotel} />
          {!showBottomNav && !showFloatingCTA && <HomeIndicator dark={darkStatus && (view === "aiThinking" || view === "splash")} />}
        </div>
      </div>
    </div>
  );
}
