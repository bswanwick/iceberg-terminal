# Iceberg Terminal

Iceberg Terminal is a research and inventory platform for niche collectors, designed to organize canonical records, personal collections, and track market activity in one place.

## Why?

Collectors today operate in a fragmented environment. They rely on a patchwork of platforms and tools to research, track, and manage their collections. This often involves juggling email alerts, user interfaces, spreadsheets, saved searches, and manual note-taking across multiple websites and marketplaces. Iceberg Terminal addresses this gap by providing a dedicated dashboard designed specifically for collectors and researchers. Instead of juggling email feeds, spreadsheets, and saved searches, collectors could interact with a system built around the objects themselves. The market lacks a centralized tool that empowers collectors to enjoy their hobby more effeciently. Iceberg Terminal aims to be that tool.

## What?

The core experience of Iceberg Terminal is built on a few foundational capabilities:

**Canonical Item Records** form the backbone of the platform. The collectible market lacks the equivalent of ISBN numbers for books, VIN numbers for cars, or manufacturer part numbers for equipment. These identifiers allow systems to aggregate data, track ownership, and analyze markets. Collectibles rarely have such identifiers, even when the objects themselves are well-defined historical artifacts. Iceberg Terminal allows users to create their own canonical records for objects, which can then be linked to the items they own. This creates a structured database of objects that can be enriched with user-generated content and external data sources.

**Personal Inventory Management** allows collectors to manage an inventory of items. Users can link their owned items to canonical records, attach photos or scans, track condition grades, record acquisition details, and organize items with tags or categories. This replaces the spreadsheets and ad-hoc systems collectors commonly use today. Each item in the inventory is connected to a canonical record, creating a structured relationship between the collector’s personal collection and the broader market and historical context.

**Taxonomy and Tagging** provides a flexible system for categorizing items. Collectors can apply tags based on themes, subjects, geographic regions, or personal significance. This allows for dynamic organization and discovery within the collection, enabling users to filter and explore their items in ways that are meaningful to them.

**Timeline Visualization** adds historical context by displaying items across a timeline. Instead of viewing collectibles as isolated objects, or buried in some taxonomy, collectors can see their collections and research organized along a chronological axis. This makes it easy to explore patterns such as design eras, wartime printing periods, or the evolution of particular brands, companies, or travel routes, as well as identifying gaps in their collection.

Together, these components create a focused research and collection environment focused on making the collector's life easier. Worthpoint is a great tool for looking up historical prices. Ebay is a great tool for finding current listings. Museum websites are a great tool for research and authentication. It's time to bring them all together for the collector in a single terminal.

Once this core system is established, Iceberg Terminal can be extended by integrating external data sources such as auction houses, dealer listings, historical archives, and other public sources that feed information into the canonical record database. This allows the system to continuously enrich object records with new sightings, auction results, and reference imagery, strengthening the catalog and improving research capabilities over time.

## Who?

The Iceberg Terminal is a passion project led by Blaise Swanwick and Swanwick & Co. Galleries.

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

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm run format:check` - check Prettier formatting

## Data storage

Canonical records are stored in Firestore under `canonicalRecords` as a shared global catalog. Personal inventory is stored under `users/{uid}/inventory` and locked to the authenticated user via Firestore rules.

# Functional Requirements

## Canonical Item Records

System shall allow creation of canonical collectible object records with basic properties like title & description.

System shall allow linking canonical objects to other database records like /inventory.

System shall support tagging of canonical records.

## Personal Inventory

System shall allow users to create a personal inventory of collectibles in their possession.

System shall allow users to link owned items to canonical item records.

System shall allow users to create new canonical records when a canonical record does not yet exist.

System shall allow users to upload photos and scans of owned items.

System shall allow users to record condition grade, acquisition date, acquisition source, notes, and other paper conservation related fields.

System shall allow users to apply tags to inventory items.

System shall allow users to view inventory filtered by any field.

## Timeline Visualization

System shall display canonical records along a chronological timeline.

System shall allow users to display their personal inventory on the timeline.

System shall allow filtering of the timeline by category, brand, country, or tag.

System shall allow zooming between decade, year, and detailed views.

## Routes and Destinations

System shall display "Routes and Destinations" on a world map.

Clicking a destination will load all relevant canonicalRecords and Inventory related to that destination or route.

## Data Ingestion

System shall allow canonical records to be populated from external data sources.

System shall support importing structured data from auction listings and public archives.

System shall allow attachment of external references or source links to canonical records.

System shall maintain a historical record of known appearances or sightings of items.

## Core System Capabilities

System shall provide full-text search across canonical records and personal inventory.

System shall support quick item lookup by brand, year, or keyword.

System shall provide a dashboard view summarizing the user’s collection.

System shall store high-resolution images suitable for research and inspection

# TODO

1. Timeline View of owned inventory
2. Ebay search builder (search for "eastern steamship -digital -reprint -postcard -matchbook")
3. Improve intake processing with forms for taking pictures, scans, and close-ups.
4. WebTWAIN
5. Daily feed of new listings to review
6. Google Blaze plan for billing + storage
7. datatables for listing canonical records and inventory
8. Rework the hero page + theming
9. Use local AI model to parse tags out of scanned images (ship names, people, places, etc) as part of intake process, use those tags to automate Etsy listings.
10. Let users register for newsletter. as we scale, let users subscribe to specific canonical objects in their possesion. Once a user buys something Cunard, for example, they will recieve sporadic updates from me, content, related to their preferred tags. As I learn, they learn.
