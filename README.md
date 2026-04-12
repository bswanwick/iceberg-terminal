# Iceberg Terminal

The Iceberg Terminal is a business managment platform custom built to the needs of Swanwick & Company's Tourist Antiquarium business. The business is focused on developing the Iceberg Terminal into functional tool that enables the business to succeed. The business deals in vintage travel ephemera and sells modern reprints, among other things...

## Why?

Collectors and dealers alike operate in a fragmented environment. They rely on a patchwork of platforms and tools to research, track, and manage their collections. This often involves juggling email alerts, user interfaces, spreadsheets, saved searches, and manual note-taking across multiple websites and marketplaces. Iceberg Terminal addresses this gap by providing a dedicated dashboard designed specifically for business owners, collectors and researchers. Instead of juggling email feeds, spreadsheets, and saved searches, collectors could interact with a system built around the objects themselves. The market lacks a centralized tool that empowers collectors to enjoy their hobby more effeciently. Iceberg Terminal aims to be that tool.

## What?

This repo controls the Iceberg Terminal platform. The platform is made up the following:

1. A front-end website to control branding and narrative, and act as a central hub to all of the other brand's properties. This is the primary landing page for most users. There's also a blog, about us, and other appropriate content.
2. A custom inventory management app - suited to solo entrepreneurship. Provides tools to intake inventory quickly, manage inventory, upload scans, photos, etc.
3. An admin-only area called dashboard, where only company admins can gain access to platform health metrics, logs, access inventory app, access the canonical record db, etc. It's the central ops hub for the org.
4. Project Iceberg. Project Iceberg is TBD. It might be a crowd sourced research platform for the niche. A way to get people to contribute records and facts and data to the Canonical Record DB, but that does not seem suited to solo-entrepreneurship. It could be a collector-focused tool, designed to help organize ANY niche. Give people their own empty canonical databases to build their own taxonomies. Or it could surface some of the inventory management app, and act as a collector's dashboard to help them better manage their own collections. Or it could expose my acquisition leads, archive data, or high res TIFFs, for a subscription or fee. Either way, Project Iceberg will be some sort of SaaS made up of the parts of the Iceberg Terminal platform. Another revenue generating stream for the business that doesn't take a lot of extra time to support or manage.

The core experience of Iceberg Terminal is built on a few foundational capabilities:

**Canonical Item Records** form the backbone of the platform. The collectible market lacks the equivalent of ISBN numbers for books, VIN numbers for cars, or manufacturer part numbers for equipment. These identifiers allow systems to aggregate data, track ownership, and analyze markets. Collectibles rarely have such identifiers, even when the objects themselves are well-defined historical artifacts. Iceberg Terminal allows users to create their own canonical records for objects, which can then be linked to the items they own. This creates a structured database of objects that can be enriched with user-generated content and external data sources.

**Inventory Management** allows collectors to manage an inventory of items. Users can link their owned items to canonical records, attach photos or scans, track condition grades, record acquisition details, and organize items with tags or categories. This replaces the spreadsheets and ad-hoc systems collectors commonly use today. Each item in the inventory is connected to a canonical record, creating a structured relationship between the collector’s personal collection and the broader market and historical context.

**Taxonomy and Tagging** provides a flexible system for categorizing items. Collectors can apply tags based on themes, subjects, geographic regions, or personal significance. This allows for dynamic organization and discovery within the collection, enabling users to filter and explore their items in ways that are meaningful to them.

**Bloomberg Terminal for Collectibles** integrations with auction aggregators, eBay, market researchers, seo trends, and similiar will hopefully provide some quick-access reference data for collectors and dealers so they can find new acquisitions more quickly. The system will intake listings from various platforms (eBay first) and allow users to browse those listings, compare them to the canon DB, possibly run custom search filters or logic - and most importantly if my company has seen that item before they would get insights from us, when we've seen it last, etc... It would have to be linked to canon by a human first, but that's the idea. One problem we aim to solve is the "keyword crisis" which is a mismatch between seller listing titles/descriptions and user entered search terms. We have learned that if we want to find a particular item like a 1939 Cunard White Star Line Sailings & Rates timetable, then there are at least 20 different search queries we need to enter into eBay, else we risk missing it or returning too large of a dataset to look through.

Together, these components create a focused research and collection environment focused on making the solo entrepreneur's life easier, the collector's life easier, and the dealer's life easier. Worthpoint is a great tool for looking up historical prices. Ebay is a great tool for finding current listings. Museum websites are a great tool for research and authentication. HathiTrust is a great research archive. It's time to bring them all together in a single terminal.

## Who?

The Iceberg Terminal is a passion project led by Blaise Swanwick of Swanwick & Co.

# Quick start

```bash
npm install
npm run dev
```

## Firebase setup (CLI + console)

1. Install Firebase CLI (one time):
   ```bash
   npm install -g firebase-tools
   ```
2. Login:
   ```bash
   firebase login
   ```
3. Create a Firebase project (console or CLI):
   ```bash
   firebase projects:create iceberg-terminal
   ```
4. Initialize the project in this repo (choose Hosting if you want deployments later):
   ```bash
   firebase init
   ```
5. In the Firebase console, enable services:
   - Authentication -> Google provider
   - Firestore Database
   - (Optional) Storage, Functions, Hosting, Analytics
6. Register a Web App in the Firebase console to get the config.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values from the Firebase Web App config.

```bash
cp .env.example .env.local
```

### Roles

- `VITE_AUTH_ALLOWED_EMAILS` is the Admin email allowlist (case-insensitive).
- Users not in the admin email list sign in as `guest` by default.
- `staff` is assigned by Admins only.
- Admins and Staff have elevated Firebase access. Guests are limited to their own user inventory data.

### Functions environment

The Functions runtime enforces admin role authority with `AUTH_ALLOWED_ADMIN_EMAILS`.

1. Copy `functions/.env.example` to `functions/.env`.
2. Set `AUTH_ALLOWED_ADMIN_EMAILS` to the same comma-separated list used by `VITE_AUTH_ALLOWED_EMAILS`.
3. Optional: set `AUTH_ALLOWED_ORIGINS` (comma-separated) to explicitly allow callable origins such as `http://localhost:5173`.

Optional frontend setting:

- `VITE_FIREBASE_FUNCTIONS_REGION` defaults to `us-central1` if omitted.

Keeping both values in sync ensures role behavior is consistent in UI and server-side rules.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm run format:check` - check Prettier formatting

## Data storage

Canonical records are stored in Firestore under `canonicalRecords` as a shared global catalog. Inventory is stored under `users/{uid}/inventory` and locked to the authenticated user via Firestore rules.

# Functional Requirements

## Canonical Item Records

System shall allow creation of canonical collectible object records with basic properties like title & description.

System shall allow linking canonical objects to other database records like /inventory.

System shall support tagging of canonical records.

## Inventory

System shall allow users to create a Inventory of collectibles in their possession.

System shall allow users to link owned items to canonical item records.

System shall allow users to create new canonical records when a canonical record does not yet exist.

System shall allow users to upload photos and scans of owned items.

System shall allow users to record condition grade, acquisition date, acquisition source, notes, and other paper conservation related fields.

System shall allow users to apply tags to inventory items.

System shall allow users to view inventory filtered by any field.

## Timeline Visualization

System shall display canonical records along a chronological timeline.

System shall allow users to display their Inventory on the timeline.

System shall allow filtering of the timeline by category, brand, country, or tag.

System shall allow zooming between decade, year, and detailed views.

## Travel Routes and Destinations

System shall display "Routes and Destinations" on a world map.

Clicking a destination will load all relevant canonicalRecords and Inventory related to that destination or route.

## Data Ingestion

System shall allow canonical records to be populated from external data sources.

System shall support importing structured data from auction listings and public archives.

System shall allow attachment of external references or source links to canonical records.

System shall maintain a historical record of known appearances or sightings of items.

## Core System Capabilities

System shall provide full-text search across canonical records and Inventory.

System shall support quick item lookup by brand, year, or keyword.

System shall provide a dashboard view summarizing the user’s collection.

System shall store high-resolution images suitable for research and inspection

# TODO

1. Timeline View
2. Ebay search builder (search for "eastern steamship -digital -reprint -postcard -matchbook")
3. Improve intake processing with forms for taking pictures, scans, and close-ups.
4. WebTWAIN
5. Daily feed of new listings to review\
6. Use local AI model to parse tags out of scanned images (ship names, people, places, etc) as part of intake process, use those tags to automate Etsy listings.
7. Stub the canonical database from other known sites' lists
8. `magick mogrify -path jpg -format jpg -quality 75 *.tif` to process tifs for web. Web friendly version, higher-res preview jpg/png version, full-res TIFF version (paid subscribers)
9. screen lock should only appear on dashboard or iceberg terminal pages, not the marketing site.
10. hasElevatedAccess isn't mine, replace with better.
11. Autocomplete for the "Format" so I don't have to retype Brochure a million times.
12. If Admin or Staff, then Files get uploaded to /assets not /user. Assets are protected company images and high-res scans.
13. Remove the superflous Upload Photo button on the inventory form, we have upload file now.
14. Do you know more about this? (A CTA inviting users to contribute to the canonical database.)
15. The listing preview modal takes too long to appear from first click - images are too big.
16. Don't use canon descriptions for the reprints line.
