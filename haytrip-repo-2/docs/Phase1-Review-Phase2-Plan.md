# HayTrip — Phase 1 Acceptance Review & Phase 2 Plan

Reviewed: the implemented application (`HayTrip.jsx`) against the Phase 1 acceptance criteria.
Scope of changes made: P0 fixes + small low-risk P1 fixes. No new features. Phase 2 not started.

---

# PART 1 — ACCEPTANCE REVIEW

## 1.1 Critical flow walkthrough

| Step | UI | Nav | State | Data consistent | RTL | Verdict |
|---|---|---|---|---|---|---|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | Pass |
| AI request (free text) | ✅ | ✅ | ✅ carried to brief | ✅ | ✅ | Pass |
| Structured requirements | ✅ | ✅ | ✅ | ⚠️ → **fixed** (was hardcoded) | ✅ | Pass after fix |
| Search state | ✅ | ✅ auto-advance | ✅ | ✅ | ✅ | Pass |
| Flight results / comparison | ✅ | ✅ | ✅ sort local | ⚠️ → **fixed** (sort used `parseInt` on Arabic duration string) | ✅ | Pass after fix |
| AI recommendation + why | ✅ | ✅ | ✅ | ❌ → **fixed** (see P0-1) | ✅ | Pass after fix |
| Hotel results / comparison | ✅ | ✅ | ✅ | ❌ → **fixed** (see P0-4) | ✅ | Pass after fix |
| Itinerary | ✅ | ✅ | ❌ → **fixed** (ignored selections) | ❌ → **fixed** | ✅ | Pass after fix |
| Daily itinerary | ✅ | ✅ | ❌ → **fixed** | ⚠️ → **fixed** | ✅ | Pass after fix |
| Shareable plan | ✅ | ✅ | ⚠️ → **fixed** | ⚠️ → **fixed** | ✅ | Pass after fix |
| External booking notice | ✅ | ⚠️ → **fixed** | ❌ → **fixed** | ⚠️ → **fixed** | ✅ | Pass after fix |

## 1.2 Issue register

### P0 — blocked Phase 2 (all fixed)

**P0-1 · The recommended trip contradicted its own explanation.**
The recommended flight + hotel totalled ≈10,830 SAR against a stated 7,000 SAR budget, while `reasonAr` claimed the hotel "يبقى ضمن ميزانيتك". Phase 2's recommendation engine will be developed and evaluated against these fixtures as ground truth — an incoherent fixture set would train and validate incorrect reasoning. This was the single most serious finding.
*Fix:* repriced to a coherent scenario — flights 2,840 (party total) + hotel 780×4 nights = 3,120 + activities 900 = **6,860, within the 7,000 budget, 140 remaining**. Headline prices shown on cards are unchanged.

**P0-2 · Price semantics were undefined.**
`FlightResult.price` was rendered as a party total on cards but multiplied ×2 on the details screen; `HotelResult.price` was per-night in one place, ×5 in another, and a total on the booking screen. No definition existed, so every consumer guessed.
*Fix:* semantics are now declared in the model and documented in the file: `price` = party total, `pricePerTraveler` = per person, `pricePerNight` = per night with stay total = `pricePerNight × TRIP.nights`. **Nothing multiplies at render time.**

**P0-3 · The itinerary ignored the user's selections.**
Day 1 hardcoded arrival "10:30" and "CVK Park Bosphorus" regardless of which flight or hotel was chosen. Choosing the Turkish Airlines 05:10 arrival still produced a 10:30 arrival plan. Acceptance criterion 9 failed outright.
*Fix:* `buildItineraryDays(flight, hotel)` derives the selection-dependent items (arrival time, transfer, check-in, check-out, return flight) from the actual objects; keyed items make the dependency explicit. Both the itinerary and day-detail screens use it.

**P0-4 · Trip facts were hardcoded string literals across five screens.**
Destination, dates, travellers, and budget were retyped in the brief, results header, trip setup, itinerary hero, and share card — already drifting ("20 – 25 أكتوبر" vs. days ending 24 Oct; "5 ليالٍ" vs. "4 ليالٍ"). Phase 2 populates `TripRequest` from parsed language; there was nowhere for it to write.
*Fix:* a single `TRIP` object is the source of every trip fact. Phase 2 replaces the fixture with the parsed object and the whole UI follows.

### P1 — fixed (small, low-risk)

- **P1-1** Budget formula duplicated in the itinerary and the share card → single `computeTripBudget(flight, hotel)`.
- **P1-2** External booking "متابعة" routed into `aiResults`/`tripSetup` regardless of origin — a manual-search user was thrown into an AI flow they never ran. → returns to the originating screen, which also matches the honest model (HayTrip hands off; the app stays put).
- **P1-3** Booking screen hardcoded "الموقع الرسمي للخطوط السعودية" / "Booking.com" and showed a per-night price as *the* price → now reads `providerLabel`, shows the correct total, and displays the actual `deepLink` host.
- **P1-4** `deepLink` values were fake fragments (`#booking/...`) → realistic provider URLs with affiliate markers, so Phase 3 swaps values, not shapes.
- **P1-5** Provider comparison rows (850/872/861/899) didn't match the hotel's headline price while the screen claimed "أفضل سعر وجدناه" → best row now equals `pricePerNight`.
- **P1-6** Fastest-sort compared `parseInt("6س 20د")` → uses `durationMin`.
- **P1-7** Itinerary showed four decorative chips that looked tappable and weren't → replaced with the real selected flight and hotel summary (also serves criterion 9).
- **P1-8** Unused imports (`Clock`, `X`) removed.
- **P1-9** Added `assertFixtureConsistency()`, run once on mount: asserts price splits, declared deltas vs. actual deltas, best-source price, budget fit, and day count. **Fixture drift now fails loudly instead of silently feeding Phase 2.**

### P2 — deferred (documented, not silently dropped)

- **P2-1** My Trips: tapping the Paris trip opens the Istanbul itinerary. Needs per-trip itinerary data — belongs with Phase 4 trip persistence.
- **P2-2** Filter icon in results headers is decorative; filters are described but not interactive.
- **P2-3** Search-history entries are not tappable.
- **P2-4** `ScreenAIChat` is a static two-message layout — correct for Phase 1, replaced in Phase 2.
- **P2-5** No `prefers-reduced-motion` handling on the route/plane animations.
- **P2-6** Manual search form fields are display-only (no pickers).
- **P2-7** Root component holds ~9 `useState` fields; fine now, superseded by the Phase 2 reducer.

## 1.3 Architecture notes for Phase 2

- **Keep:** the `view` + `hist` navigation stack; the normalized result shapes; `RouteMark`/`WhyBlock`/`HelpMeChoose` as content-agnostic components — they already accept generated strings.
- **Change before AI integration:** `selectedFlight`/`selectedHotel`/`chat` become fields on one `tripDraft` reducer. The AI must read and write **one** object, not five setters.
- **Watch:** `WhyBlock` currently receives a string. In Phase 2 it should receive the `Recommendation` object so the UI can render deltas from data rather than trusting prose.

---

## PHASE 1 STATUS: **PASS WITH FIXES**

Four P0 issues were found and fixed; nine P1 issues were small enough to fix safely; seven P2 items are documented and deferred. The complete critical flow now runs end to end with no dead ends and no internally inconsistent numbers.

## Frozen as the Phase 1 baseline

1. **Navigation model** — `view` + `hist` stack, tab roots, back affordance on every screen.
2. **Screen inventory** — the 20 screens in the architecture doc. No screens added or removed in Phase 2.
3. **Component system** — Logo, RouteMark, WhyBlock, HelpMeChoose, FlightCard, HotelCard, FieldRow, PrimaryButton/GhostButton, Badge, Header, BottomNav, iPhone chrome, What-if and Share sheets.
4. **Colour and type system** — navy/green/teal/cream/amber/red semantic roles; Cairo + Tajawal scale.
5. **Data model shapes** — `TRIP`, `FlightResult`, `HotelResult`, `Recommendation`, itinerary day/activity. Phase 2 may add fields; it may not rename or repurpose existing ones.
6. **Price semantics** — as declared in P0-2. This is now a contract.
7. **Product rules** — every recommendation carries `reasonAr`; cheapest ≠ best is stated; HayTrip never claims to have booked.
8. **AI visual language** — travel path + plane + H. No sparkles.
9. **Arabic-first RTL, iPhone 390×844 portrait.**

---

# PART 2 — PHASE 2 IMPLEMENTATION PLAN

**Goal:** turn the simulated agent into a real structured travel agent. Still no provider integration.

### 2.1 The trip object

Replace the loose state with one reducer-held `TripDraft`:

```
TripDraft {
  raw: string                     // what the user typed
  request: TripRequest            // parsed, validated
  missingFields: Field[]          // drives clarifying questions
  confidence: Record<Field, number>
  status: "empty"|"parsing"|"needs_clarification"|"ready"|"searching"|"results"
  results: { flights: FlightResult[], hotels: HotelResult[] }
  recommendations: { flight?: Recommendation, hotel?: Recommendation }
  selections: { flightId?, hotelId? }
  itinerary?: Itinerary
}
```
Every screen becomes a projection of this object. The AI reads and writes it; the UI never talks to the AI directly.

### 2.2 Workstreams

**A · Parsing (Arabic-first).** Free text → `TripRequest`, schema-validated. Must handle Gulf dialect, relative dates ("بعد شهرين", "إجازة الربيع"), Arabic-Indic numerals, budget phrasing ("7 آلاف", "ميزانيتي حول ٧٠٠٠"), party phrasing ("لشخصين", "أنا وزوجتي وطفلين"). Every parse returns per-field confidence.
*Guardrail:* the confirmation screen stays. Parsing is never trusted silently.

**B · Gap detection & clarification.** Compute `missingFields` from what search actually requires. Ask **only** what's missing, one question at a time, never re-asking a known value. Defaults (origin from profile, economy cabin) are shown as pre-filled and correctable, not asked.

**C · Recommendation engine.** A deterministic scorer over price, duration, stops, departure/arrival civility, baggage, and budget fit, producing the four categories. **The scorer is code, not the LLM.** The LLM only renders the scorer's output into `reasonAr`.
*This split matters:* it makes recommendations reproducible, testable, and explainable, and prevents the model from inventing a rationale for a ranking it didn't compute.

**D · Explanation generation.** Input = the two result objects + computed deltas. Output = one Arabic sentence. Validated: every number in the sentence must appear in the input. A failed validation falls back to a templated explanation rather than shipping an unverified claim.

**E · Itinerary generation.** Sequence activities per day respecting geography, opening hours, travel time, arrival/departure times, and stated preferences. POI data is a **data source**, not model recall.

**F · Budget reasoning.** `computeTripBudget` already exists; Phase 2 makes it an input to ranking so the engine can prefer combinations that fit, and can say when nothing does.

### 2.3 Phase 2 acceptance criteria

1. A free-text Arabic request produces a validated `TripRequest`.
2. Missing fields are detected; only necessary questions are asked.
3. Corrections update the object and re-run search.
4. Rankings are produced by the deterministic scorer and are reproducible.
5. Every explanation's figures are traceable to result objects (validator passes).
6. The itinerary respects the selected flight's arrival and the hotel's location.
7. `assertFixtureConsistency()` passes.
8. No LLM output reaches the UI without schema validation.

### 2.4 Phase 2 risks

- Dialect parsing accuracy is the main quality risk — mitigate with a labelled Arabic request test set built early.
- LLM latency on the critical path — parse once, cache; reason per result set, not per card.
- Scorer weight tuning is a product decision, not an engineering one; expose weights in config.

---

# PART 3 — PROVIDER DISCOVERY (verified, parallel track — no integration yet)

Findings below are from checking provider documentation directly. Where something is unverified, it is marked as such.

### 3.1 Two findings that affect the plan

**Finding 1 — Amadeus Self-Service is gone. Do not plan around it.**
<cite index="21-1">Amadeus's self-service portal was decommissioned on July 17th, 2026, with Enterprise APIs remaining available via the Enterprise portal.</cite> <cite index="22-1">Amadeus paused registration for new users and fully decommissioned the portal for existing users on July 17, at which point API keys were disabled.</cite> That date has passed. Amadeus is now an enterprise-contract route only.

**Finding 2 — Booking.com's terms may restrict the exact thing HayTrip's hotel screen does.**
Booking.com's permitted-use rules for the Demand API <cite index="58-1">outline rules that must be followed, and partners who do not adhere may have API privileges revoked, losing access to both availability and static content endpoints</cite>, and the same document contains a dedicated **Price Comparison** section governing <cite index="58-1">the comparison of accommodation prices made available from two or more online booking platforms</cite>. A secondary analysis lists <cite index="51-1">using Booking.com property content in price comparison and forwarding Demand API data to non-affiliates among forbidden uses.</cite>
**This is a direct commercial risk to HayTrip's signature multi-source hotel comparison.** It must be clarified with Booking.com in writing before that screen is built against real data. Do not assume it is permitted.

Access is also gated: the Demand API is <cite index="52-1">recommended for Affiliate Partners, with the stated requirement being Managed Affiliate Partner status</cite>, and <cite index="57-1">partners must typically be approved and onboarded to gain access, with revenue via commission on bookings rather than API usage fees.</cite>

### 3.2 Candidate providers

| Provider | Type | Access | Fit for HayTrip | Verified? |
|---|---|---|---|---|
| **Duffel** | Flights (+ Stays) | <cite index="6-1">Fully self-serve: dashboard-issued tokens, pay-as-you-go, no signup fees or minimum commitments; $3 per flight order plus 1% of order value</cite> | Strong technical fit, fastest to prototype. But it is a **booking** API — HayTrip currently doesn't book, so the commercial model is a mismatch unless HayTrip later takes bookings in-app | ✅ |
| **Travelpayouts** (Aviasales/Hotellook) | Flights + hotels, affiliate | Free registration; <cite index="41-1">hotel search API access is free, limited, and granted individually on request, requiring an explanation of why standard integrations don't suit and interface designs or prototypes</cite> | **Best fit for the current model** — affiliate deep links, no booking required | ✅ |
| **Booking.com Demand API** | Hotels | Managed Affiliate Partner, approval required | Inventory quality high; **price-comparison restriction is the blocker** | ✅ |
| **Expedia Rapid** | Hotels | Commercial onboarding | Not verified in this pass | ⚠️ unverified |
| **Hotelbeds / RateHawk** | Hotel wholesale | Contract | Not verified in this pass | ⚠️ unverified |
| **Skyscanner / Kiwi** | Flights | Partner approval | Not verified in this pass | ⚠️ unverified |
| **Amadeus Enterprise** | Flights + hotels | Sales contract | Viable but heavyweight for a pre-revenue product | ✅ (self-service closure verified) |

### 3.3 Two caveats worth knowing now

**Travelpayouts hotel data excludes Booking.com.** Their documentation states plainly that <cite index="41-1">hotels data from Booking.com is missing from the hotels API, due to that company's policy of working through the API and White Label.</cite> So Travelpayouts alone cannot populate a comparison row labelled "Booking.com".

**Affiliate APIs are moderated, not open.** Travelpayouts notes that <cite index="38-1">no brand in their affiliate network provides an API with real-time data without prior moderation, and specific requirements are often set for who gets access.</cite> Budget weeks, not days, for approvals.

**Cached vs. live data.** The Travelpayouts flight *data* API returns <cite index="42-1">prices from a cache based on users' search history, stored for 7 days, which they recommend using to generate static pages.</cite> That is **not** suitable for HayTrip's live comparison — the live flight search API is <cite index="39-1">available from technical support by special request</cite>. Conflating the two would put stale prices behind a real recommendation.

### 3.4 Recommended commercial sequence

1. **Now (during Phase 2):** register with Travelpayouts, apply for the hotel search API and the special-request flight search API — both need the prototype screenshots we already have.
2. **Now:** open a written conversation with Booking.com about whether HayTrip's multi-source comparison is permitted under the Demand API terms. This single answer determines whether the hotel comparison screen survives contact with real data.
3. **Verify next:** Expedia Rapid, Hotelbeds/RateHawk, Skyscanner, Kiwi — capabilities, deep-link support, and comparison restrictions.
4. **Decide at Phase 3 entry:** affiliate/deep-link model (matches today's product) vs. booking model (Duffel; larger product change requiring approval per §25).

### 3.5 The scope question this raises

If provider terms broadly restrict cross-platform price comparison — and Booking.com's appear to — then HayTrip's "compare providers for the same hotel" screen may need to become "here is the best price we found, and where it's from." That is a **product scope change**, not an implementation detail, so per §25 I'm flagging it rather than deciding it.

*Product impact:* comparison shifts from a visible multi-row table to a single sourced best price, weakening one differentiator while leaving the AI recommendation and itinerary differentiators intact.
*Technical impact:* minimal — the normalized model already supports it; one screen changes.
*Recommendation:* get the written answer before Phase 3 begins, and design the hotel screen to degrade gracefully to a single-source display.
