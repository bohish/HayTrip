# HayTrip snapshot — 2026-08-25 / haytrip-repo(6)

Snapshot of the latest uploaded project state supplied by the owner.

## Source archive
- Original uploaded archive: `haytrip-repo(6).zip`
- SHA-256: `ad6337613bdfd5df6b4029fecf0bd162719709eb575b9d8ae3d28b2d118b07bc`
- Archive size: ~29.05 MiB

## Latest implementation areas identified
- Real flight-search service path through the Supabase `ai-agent` Edge Function.
- Structured flight normalization, provenance, price conversion, sorting and filtering.
- Expanded airport/IATA resolution.
- Unified travel-agent draft state and requirement merging.
- Updated AI agent / research flow using OpenAI web search.
- Flight search UI and result cards with source/verification safeguards.
- Supabase persistence integration for generated trips.

## Important archive hygiene note
The uploaded archive contains `node_modules`, generated `dist`, iOS Pods/build artifacts, local Xcode user state, and a local `.env`. The `.env` currently contains a Supabase client-side anon key; it does not contain an OpenAI service key according to its own header. For the canonical Git repository, secrets and generated dependencies/build artifacts should remain excluded.

## Snapshot files
This folder contains the key source/config files from the latest update that can be represented safely through the connected GitHub file API. The original ZIP itself is not duplicated here by this snapshot operation because the connected GitHub write interface available to me accepts UTF-8 text files, not arbitrary binary ZIP uploads.
