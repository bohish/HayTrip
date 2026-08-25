/* ------------------------------------------------------------------ */
/* Flight search — the SINGLE real path                                 */
/* ------------------------------------------------------------------ */

import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const SAR_RATES = { USD: 3.75, EUR: 4.05, GBP: 4.75, SAR: 1.0 };
function toSAR(price, currency) {
  if (price === null || price === undefined) return null;
  if (typeof price !== "number" || !Number.isFinite(price)) return null;
  if (!currency || typeof currency !== "string") return null;
  const c = currency.trim().toUpperCase();
  if (c === "SAR") return Math.round(price);
  const rate = SAR_RATES[c];
  return rate ? Math.round(price * rate) : null;
}

export const SEARCH_STATE = { IDLE: "idle", SEARCHING: "searching", RESULTS: "results", EMPTY: "empty", ERROR: "error", STALE: "stale" };
export const FlightSearchError = { NOT_CONFIGURED: "NOT_CONFIGURED", NO_PROVIDER: "NO_PROVIDER", NETWORK: "NETWORK", PROVIDER: "PROVIDER", CONTRACT: "CONTRACT" };
export const FIELD = { REAL: "real", ESTIMATED: "estimated", UNKNOWN: "unknown" };
const n = (v) => { if (typeof v === "number") return Number.isFinite(v) ? v : null; if (typeof v === "string") { const cleaned = v.replace(/[^\d.]/g, ""); if (!cleaned) return null; const parsed = Number(cleaned); return Number.isFinite(parsed) ? parsed : null; } return null; };
const s = (v) => { if (typeof v !== "string") return null; const t = v.trim(); return t && !["null", "undefined", "n/a", "-"].includes(t.toLowerCase()) ? t : null; };
const httpUrl = (v) => { const u = s(v); if (!u) return null; try { const p = new URL(u); return p.protocol === "https:" || p.protocol === "http:" ? u : null; } catch { return null; } };
const time = (v) => { const t = s(v); if (!t) return null; const m = t.match(/^(\d{1,2}):(\d{2})/); if (!m) return null; const h = +m[1], mi = +m[2]; if (h > 23 || mi > 59) return null; return `${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`; };
export const toMinutes = (hhmm) => { const t = time(hhmm); if (!t) return null; const [h,m] = t.split(":").map(Number); return h*60+m; };
const f_hasRoute = (r) => Boolean(s(r?.origin) && s(r?.destination));

export function normalizeFlight(raw, meta = {}) {
  if (!raw || typeof raw !== "object") return null;
  const airline = s(raw.airline);
  const sourcePrice = n(raw.sourcePrice ?? raw.price ?? raw.totalPrice);
  const sourceCurrency = s(raw.sourceCurrency ?? raw.currency);
  const sourceUrl = httpUrl(raw.sourceUrl ?? meta.sourceUrl);
  const bookingUrl = httpUrl(raw.bookingUrl ?? raw.deepLink);
  const dep = time(raw.departureTime ?? raw.departure);
  const arr = time(raw.arrivalTime ?? raw.arrival);
  const displayPrice = toSAR(sourcePrice, sourceCurrency);
  const currency = displayPrice !== null ? "SAR" : (sourceCurrency || null);
  let duration = n(raw.durationMinutes ?? raw.duration);
  let durationField = duration !== null ? FIELD.REAL : FIELD.UNKNOWN;
  if (duration === null && dep && arr) { const d = toMinutes(arr) - toMinutes(dep); if (d > 0) { duration = d; durationField = FIELD.ESTIMATED; } }
  if (sourcePrice === null && !sourceUrl) return null;
  if (!airline && !dep && !f_hasRoute(raw) && sourcePrice === null) return null;
  const stops = n(raw.stops);
  return {
    id: s(raw.id) || `f_${Math.random().toString(36).slice(2,10)}`, airline, airlineLogo: httpUrl(raw.airlineLogo), flightNumber: s(raw.flightNumber), origin: s(raw.origin), destination: s(raw.destination), departureTime: dep, arrivalTime: arr, departureDate: s(raw.departureDate), arrivalDate: s(raw.arrivalDate), durationMinutes: duration, stops, stopDetails: Array.isArray(raw.stopDetails) ? raw.stopDetails.map(s).filter(Boolean) : [], cabinClass: s(raw.cabinClass), baggage: s(raw.baggage), price: displayPrice, currency, sourcePrice, sourceCurrency, priceType: s(raw.priceType) || (sourcePrice !== null ? "total" : null), bookingUrl,
    sourceName: (() => { const name = s(raw.sourceName ?? meta.sourceName); if (name) return name; if (sourceUrl) { try { const u = new URL(sourceUrl); const host = u.hostname.replace(/^www\./,""); return host === "wego.com" ? "Wego" : host === "kayak.com" ? "KAYAK" : host === "expedia.com" ? "Expedia" : host === "farecompare.com" ? "FareCompare" : host === "flynas.com" ? "Flynas" : host === "flyadeal.com" ? "Flyadeal" : host === "trip.com" ? "Trip.com" : host; } catch { return null; } } return null; })(),
    sourceUrl, retrievedAt: s(raw.retrievedAt ?? meta.retrievedAt), verified: Boolean(sourceUrl), fields: { price: displayPrice !== null ? FIELD.REAL : FIELD.UNKNOWN, duration: durationField, stops: stops !== null ? FIELD.REAL : FIELD.UNKNOWN, baggage: s(raw.baggage) ? FIELD.REAL : FIELD.UNKNOWN, booking: bookingUrl ? FIELD.REAL : FIELD.UNKNOWN }
  };
}
export const normalizeFlights = (list, meta) => (Array.isArray(list) ? list : []).map((x) => normalizeFlight(x, meta)).filter(Boolean);

export async function searchFlights(params) {
  if (!isSupabaseConfigured) { const e = new Error("خدمة البحث غير مهيأة."); e.code = FlightSearchError.NOT_CONFIGURED; throw e; }
  const { data, error } = await supabase.functions.invoke("ai-agent", { body: { mode: "research", draft: { origin: params.origin || null, destination: params.destination || null, originCode: params.originCode || null, destCode: params.destCode || null, departureDate: params.departureDate || null, returnDate: params.returnDate || null, tripType: params.tripType || (params.returnDate ? "round_trip" : "one_way"), travelers: params.travelers || 1, cabin: params.cabin || null, nonstopOnly: Boolean(params.nonstopOnly), budget: params.budget || null, priority: params.priority || null } } });
  if (error) { console.error("flight search transport error", error); const e = new Error("تعذر الحصول على نتائج الطيران حاليًا."); e.code = FlightSearchError.NETWORK; throw e; }
  if (data?.unavailable) { const e = new Error(data.reason === "no_provider" ? "خدمة البحث في الويب غير مفعّلة على الخادم." : "ما حصلنا على نتائج طيران موثوقة."); e.code = data.reason === "no_provider" ? FlightSearchError.NO_PROVIDER : FlightSearchError.PROVIDER; e.soft = data.reason !== "no_provider"; throw e; }
  if (!data || !Array.isArray(data.results)) { const e = new Error(data && typeof data.reply === "string" ? "خدمة البحث غير محدّثة على الخادم. أعد نشر الدالة (supabase functions deploy ai-agent)." : "استجابة غير متوقعة من خدمة البحث."); e.code = FlightSearchError.CONTRACT; e.detail = data && typeof data.reply === "string" ? "outdated_function" : "bad_shape"; throw e; }
  const results = normalizeFlights(data.results, { retrievedAt: new Date().toISOString() });
  return { results, totalFound: typeof data?.totalFound === "number" ? data.totalFound : results.length, sourcesUsed: n(data?.sourcesUsed), retrievedAt: new Date().toISOString(), criteria: params };
}

export const SORTS = { best: "الأفضل", cheapest: "الأرخص", fastest: "الأسرع", departure: "وقت المغادرة" };
export function sortFlights(list, key) { const arr=[...list]; switch(key){ case "cheapest": return arr.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity)); case "fastest": return arr.sort((a,b)=>(a.durationMinutes??Infinity)-(b.durationMinutes??Infinity)); case "departure": return arr.sort((a,b)=>(toMinutes(a.departureTime)??Infinity)-(toMinutes(b.departureTime)??Infinity)); default: return arr.sort((a,b)=>(b._score??0)-(a._score??0)); } }
export const TIME_BUCKETS = { morning:{label:"صباح",from:300,to:720}, noon:{label:"ظهر",from:720,to:1020}, evening:{label:"مساء",from:1020,to:1260}, night:{label:"ليل",from:1260,to:1740} };
export function filterFlights(list,f={}){ return list.filter(x=>{ if(f.stops==="nonstop"&&x.stops!==0)return false; if(f.stops==="one"&&x.stops!==1)return false; if(typeof f.maxPrice==="number"&&(x.price===null||x.price>f.maxPrice))return false; if(f.airlines?.length&&!f.airlines.includes(x.airline))return false; if(typeof f.maxDuration==="number"&&(x.durationMinutes===null||x.durationMinutes>f.maxDuration))return false; if(f.baggageOnly&&x.fields.baggage!==FIELD.REAL)return false; if(f.cabin&&(!x.cabinClass||x.cabinClass!==f.cabin))return false; if(f.departureBucket){const m=toMinutes(x.departureTime);if(m===null)return false;const b=TIME_BUCKETS[f.departureBucket];const mm=m<300?m+1440:m;if(!(mm>=b.from&&mm<b.to))return false;} return true;}); }
export function facetsOf(list){const prices=list.map(f=>f.price).filter(p=>typeof p==="number"), durs=list.map(f=>f.durationMinutes).filter(d=>typeof d==="number");return {airlines:[...new Set(list.map(f=>f.airline).filter(Boolean))].sort(),minPrice:prices.length?Math.min(...prices):null,maxPrice:prices.length?Math.max(...prices):null,minDuration:durs.length?Math.min(...durs):null,maxDuration:durs.length?Math.max(...durs):null,hasNonstop:list.some(f=>f.stops===0),cabins:[...new Set(list.map(f=>f.cabinClass).filter(Boolean))]};}
export function formatDuration(min){if(typeof min!=="number")return null;const h=Math.floor(min/60),m=min%60;return m?`${h}س ${m}د`:`${h}س`;}
