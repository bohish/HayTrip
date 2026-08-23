# HayTrip — Product Architecture & Phase 1 Plan

**Status:** Phase 1 in progress · Baseline = existing Claude-built prototype (`HayTrip.jsx`), refined systematically, not rebuilt.

---

## A. Product architecture

The system separates into six layers. The rule that drives the whole design: **the AI never touches the UI, and the AI never produces factual travel data.**

```
┌─────────────────────────────────────────────────────────┐
│  UI LAYER (iPhone, Arabic-first RTL)                     │
│  Screens · Components · Navigation · States              │
└───────────────▲───────────────────────┬─────────────────┘
                │ renders               │ user intent
                │                       ▼
┌───────────────┴─────────────────────────────────────────┐
│  APPLICATION STATE                                       │
│  TripRequest · TripDraft · SearchState · Selections      │
│  Single source of truth. UI reads only from here.        │
└───────────────▲───────────────────────┬─────────────────┘
                │ writes structured     │ reads/updates
                │ updates only          ▼
┌───────────────┴─────────────────────────────────────────┐
│  AI ORCHESTRATOR                                         │
│  parse request → fill TripRequest → detect gaps →        │
│  ask clarifying Q → rank results → explain → plan days   │
│  MAY NOT: invent prices, flights, hotels, availability   │
└───────────────▲───────────────────────┬─────────────────┘
                │ normalized results    │ search params
                │                       ▼
┌───────────────┴─────────────────────────────────────────┐
│  TRAVEL PROVIDER LAYER                                   │
│  FlightProvider / HotelProvider interfaces               │
│  Adapters normalize each provider → internal models      │
└───────────────▲───────────────────────┬─────────────────┘
                │                       ▼
┌───────────────┴─────────────────────────────────────────┐
│  BACKEND (Phase 3–4)                                     │
│  Provider credentials · caching · rate limits · auth     │
└───────────────▲───────────────────────┬─────────────────┘
                │                       ▼
┌───────────────┴─────────────────────────────────────────┐
│  DATABASE (Phase 4) — users, saved trips, favorites      │
└─────────────────────────────────────────────────────────┘
```

**Why the AI sits above the provider layer, not beside it:** the orchestrator receives only normalized, already-verified results. It ranks and explains them. It cannot emit a price that did not come from a provider adapter. This is the structural defence against hallucinated travel data (§17, §23).

---

## B. Screen map

```
Splash
 └─ Home ──────────────────────────────────────────┐
     │                                             │
     ├─ [A] AI TRAVEL AGENT (primary)              │
     │   ├─ Agent brief (extracted requirements)   │
     │   │   ├─ "تعديل الطلب" → back to Home input │
     │   │   └─ "ابدأ البحث" ↓                     │
     │   ├─ Search progress (understand → search)  │
     │   ├─ Recommendation                         │
     │   │   ├─ Flight: HayTrip pick + WHY         │
     │   │   ├─ 3 categories (أرخص/أسرع/أفضل قيمة)│
     │   │   ├─ → All flight results               │
     │   │   ├─ Hotel pick + WHY                   │
     │   │   ├─ → All hotel results                │
     │   │   └─ What-if scenarios (sheet)          │
     │   └─ → Trip setup ↓                         │
     │                                             │
     ├─ [B] MANUAL SEARCH (secondary, equal power) │
     │   ├─ Flight search form → Flight results    │
     │   │   └─ "ساعدني أختار" → AI analyses these │
     │   └─ Hotel search form → Hotel results      │
     │       └─ "ساعدني أختار" → AI analyses these │
     │                                             │
     ├─ Flight details ─┐                          │
     ├─ Hotel details ──┴→ External booking notice │
     │                                             │
     ├─ Trip setup (confirm flight + hotel)        │
     ├─ Itinerary overview (+ budget, share)       │
     │   ├─ Day detail (timeline + AI tip)         │
     │   └─ Shareable travel plan (sheet)          │
     │                                             │
     └─ Tabs: الرئيسية · رحلاتي · [+] · المفضلة · حسابي
              └─ حسابي → الإعدادات / محفوظات البحث
```

Both modes converge on the same details → booking → itinerary screens. There is one product, not two.

---

## C. Four-phase roadmap

| Phase | Scope | Data | Exit condition |
|---|---|---|---|
| **1** Product foundation + UI system | Full iPhone shell, navigation, all screens, component system, RTL | Mocked | User completes the whole journey with no dead ends |
| **2** AI travel agent | NL parsing → `TripRequest`, conversation state, gap detection, reasoning, explanation, itinerary generation | Mocked results, real reasoning | Free-text request becomes validated structured requirements |
| **3** Search + comparison integration | `FlightProvider`/`HotelProvider` adapters, normalization, failure handling | Real where possible, mock adapters otherwise — same interface | UI is provider-agnostic; swapping adapters changes nothing upstream |
| **4** Production hardening | Auth, backend, DB, persistence, analytics, caching, security, a11y, localization | Real | Architecturally ready for real users |

Phases run sequentially. Scope does not move silently between them.

---

## D. Phase 1 technical architecture

Phase 1 is deliberately **client-only**. No backend, no network, no keys.

- **Rendering:** single-file React, iPhone 390×844 portrait frame with status bar, dynamic island, home indicator, safe-area padding.
- **Navigation:** an explicit `view` state plus a `hist` stack. Every screen either has a back affordance or is a tab root. This is what guarantees "no dead ends."
- **Data:** all mock data lives in module-level constants shaped **exactly like the Phase 3 normalized models** below. When adapters arrive, the constants are replaced by adapter output and no component changes.
- **AI:** simulated. The progress sequence and explanation strings are static in Phase 1 — but they are rendered by components that will accept generated content in Phase 2 without restructuring.

**Critical Phase 1 discipline:** mock data must already carry every field the real model needs (`deepLink`, `provider`, `currency`, `stops`, `cancellation`). Otherwise Phase 3 becomes a rewrite.

---

## E. Phase 1 data models

```ts
TripRequest {            // built by AI, corrected by user
  origin, destination
  departureDate, returnDate
  travelers: { adults, children }
  budget: { amount, currency }
  hotelPreferences: string[]     // "قريب من الأماكن السياحية"
  flightPreferences: string[]    // "مباشر"
  missingFields: string[]        // drives clarifying questions (Phase 2)
}

FlightResult {
  id, provider, airline, airlineCode
  origin, destination
  departureTime, arrivalTime, duration
  stops, baggage
  price, currency
  cabinClass
  deepLink                       // external booking, never in-app checkout
}

HotelResult {
  id, provider, name
  location, area
  rating, reviewCount
  room, amenities[]
  cancellation
  pricePerNight, currency
  deepLink
}

Recommendation {
  targetId                       // FlightResult.id | HotelResult.id
  category: "best" | "cheapest" | "fastest" | "bestValue"
  reasonAr                       // the WHY — a required field, not optional
  comparedTo: { id, priceDelta, timeDelta }
}

Itinerary {
  tripId, destination, startDate, endDate, travelers
  flight: FlightResult
  hotel: HotelResult
  days: ItineraryDay[]
  estimatedBudget: { flights, hotel, activities, total, currency }
}

ItineraryDay { index, date, title, heroImage, activities: Activity[] }
Activity { time, type, title, location, description, aiTip? }
Provider { id, name, type, deepLinkTemplate }
```

`Recommendation.reasonAr` being non-nullable is a product decision encoded in the model: a recommendation without an explanation is invalid.

---

## F. Phase 1 component system

Built and reused across every screen:

- **Surfaces:** `Header`, `Panel`, card (16–20pt radius, hairline border, soft shadow)
- **Actions:** `PrimaryButton` (green), `GhostButton`, chip, sort tab
- **Data:** `FlightCard`, `HotelCard`, `FieldRow`, provider comparison row, `Riyal`
- **Identity:** `Logo` (H + path + plane), `RouteMark` (the AI indicator — replaces sparkles everywhere)
- **AI:** progress route bar, recommendation banner (cream), "why" explanation block
- **Itinerary:** numbered day card, dashed route connector, activity timeline row
- **Chrome:** `StatusBar`, `DynamicIsland`, `HomeIndicator`, `BottomNav`
- **Sheets:** What-if, Share

Semantic colour roles: navy = structure/trust · green = action/selection · teal = AI state · cream = HayTrip's recommendation · amber = conditions/fees · red = destructive.

---

## G. State management plan

Phase 1 keeps state in the root component and passes down:

| State | Purpose |
|---|---|
| `view`, `hist` | navigation + back stack |
| `chat` | raw natural-language request |
| `selectedFlight`, `selectedHotel` | user selections carried through to itinerary |
| `favorites` | Set of destination ids |
| `dayIndex` | which itinerary day is open |
| `bookingKind` | flight vs hotel on the external booking screen |
| sheet flags | what-if, share |

Phase 2 replaces the loose fields with a single `tripDraft` reducer holding `TripRequest` + selections, so the AI has one object to read and update. The lift is contained because the UI already reads selections from one place.

---

## H. AI integration plan

| Stage | AI responsibility | Guardrail |
|---|---|---|
| Parse | free text → `TripRequest` | output validated against schema; reject unparsed fields |
| Clarify | detect `missingFields`, ask only what's needed | max necessary questions, never re-ask known values |
| Rank | score normalized results on price/duration/stops/times/baggage | scores only over provider data |
| Explain | generate `reasonAr` referencing real deltas | numbers must come from the compared results |
| Plan | sequence activities logically by day | geography/opening hours from data, not memory |

The AI never returns a price, flight number, hotel, availability, or booking URL. Those fields are copied from the provider result object.

---

## I. Travel provider abstraction plan

```
interface FlightProvider {
  id: string
  searchFlights(params: FlightSearchParams): Promise<FlightResult[]>
}
interface HotelProvider {
  id: string
  searchHotels(params: HotelSearchParams): Promise<HotelResult[]>
}
```

- Each adapter maps provider-specific JSON → the normalized models in §E.
- A `SearchService` fans out to all registered adapters, merges, de-duplicates, normalizes currency, and returns one list.
- Failures are **per-adapter**: one provider timing out degrades results, it does not fail the search.
- A `MockFlightProvider` / `MockHotelProvider` implements the identical interface in Phase 1–2 so Phase 3 is a registration change, not a refactor.
- The UI imports normalized models only. It never sees a provider response shape.

---

## J. Risks and technical bottlenecks

| Risk | Impact | Mitigation |
|---|---|---|
| **Provider access is commercial, not technical** — flight/hotel APIs need contracts, affiliate approval | Can block Phase 3 entirely | Start commercial conversations during Phase 2; mock adapters keep the product demoable meanwhile |
| **AI hallucinating travel facts** | Destroys trust; potential liability | Architectural: AI reads normalized results only; validate every LLM structured output |
| **Price staleness** — result shown ≠ price at provider | User arrives at a different price | Timestamp results, show freshness, treat external booking as leaving the quote |
| **Arabic NL parsing** — dialect, informal dates ("بعد شهرين"), mixed numerals | Wrong requirements → wrong trip | Confirmation screen before search is a product-level guardrail, not just UX |
| **Itinerary quality** — sequencing needs geography and opening hours | Plan feels randomly generated | Treat POI data as a data source, not an AI memory task |
| **RTL + Arabic typography** across all components | Broken layouts | Arabic-first from Phase 1, never mechanical mirroring |
| **Latency** — multi-provider fan-out plus AI reasoning | Long waits | Progressive results; the route-progress UI is honest about stages |
| **Cost** — LLM calls per request | Unit economics | Cache parsed requests; reason once per result set, not per card |

---

## K. Phase 1 acceptance checklist

| # | Criterion | Status |
|---|---|---|
| 1 | Splash → Home transition | ✅ |
| 2 | Home: AI input is the dominant element; manual search secondary | ✅ |
| 3 | Free-text request → agent brief showing extracted requirements | ✅ |
| 4 | User can correct the request ("تعديل الطلب") | ✅ |
| 5 | Search progress shows meaningful stages, no generic AI sparkle | ✅ |
| 6 | Flight recommendation with HayTrip pick | ✅ |
| 7 | Recommendation explains WHY, with real deltas | ✅ |
| 8 | Three categories: أرخص / أسرع / أفضل قيمة | ✅ |
| 9 | Full flight comparison with sorting | ✅ |
| 10 | Hotel recommendation with WHY | ✅ |
| 11 | Full hotel comparison + provider price comparison | ✅ |
| 12 | "ساعدني أختار" available inside manual results | ✅ |
| 13 | Comparison states the principle: cheapest ≠ best | ✅ |
| 14 | Flight details / Hotel details | ✅ |
| 15 | External booking notice is honest (no in-app booking claim) | ✅ |
| 16 | Trip setup confirms flight + hotel before planning | ✅ |
| 17 | Itinerary: day cards connected by the route line, not a calendar | ✅ |
| 18 | Day detail with timeline + AI tip | ✅ |
| 19 | Estimated budget visible on the trip | ✅ |
| 20 | Shareable travel plan card | ✅ |
| 21 | What-if scenarios with a real re-search state | ✅ |
| 22 | My Trips / Favorites / Profile / Settings / Search history | ✅ |
| 23 | Bottom nav works from every tab root; every screen has a way back | ✅ |
| 24 | Arabic RTL throughout; iPhone chrome and safe areas | ✅ |

**Deferred by design (not silently dropped):**

- Error / no-results / partial-success states (§18) → **Phase 3**, where real failures actually exist. Faking provider errors in Phase 1 would test nothing.
- `TripRequest` as a live mutable object, clarifying questions → **Phase 2**.
- Persistence of trips/favorites, auth, analytics, localization → **Phase 4**.

---

## What is complete vs. what remains

**Complete (Phase 1):** the full product shell — every screen in §B exists, is reachable, and connects to the next step; the component and colour system is applied consistently; both the AI path and the manual path reach the itinerary.

**Remains:** everything in Phases 2–4. The immediate next task is Phase 2's `TripRequest` object and parsing layer — *not* provider integration, which depends on commercial access that should be pursued in parallel starting now.
