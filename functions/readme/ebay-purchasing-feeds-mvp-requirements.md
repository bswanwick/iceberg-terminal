# eBay Purchasing Feeds MVP Requirements

## Purpose

The MVP shall let admins define and run targeted eBay Browse API search feeds for rare, hard-to-find acquisition leads without attempting to ingest all of eBay. The system should support overlapping query nets, detect when a net is too broad to trust, de-duplicate results across nets, and preserve enough run history to improve the rules over time.

This document describes the product and backend requirements for the first usable version. eBay Browse API request semantics, filter syntax, sort values, marketplace behavior, and response fields should be referenced from eBay's official documentation rather than duplicated here.

## Problem Statement

Rare collectible listings are often hard to find because sellers describe the same object in inconsistent ways. A single object type may appear under several headings, categories, title patterns, or incomplete descriptions. Broad eBay searches can return too many results to process, while narrow searches can miss valuable listings.

The MVP needs to help the business cast multiple controlled search nets, accept overlap between nets, and minimize false positives. The system must also identify saturated nets where eBay reports more results than the app can safely page through.

## Goals

- Allow admins to define reusable eBay purchasing feeds made from one or more query nets.
- Run each query net through the existing `searchEbayBrowse` Browse API wrapper.
- Fetch only bounded result windows from eBay.
- De-duplicate listings across overlapping query nets by eBay `itemId`.
- Detect and record query saturation when eBay reports result counts near or above the reachable pagination window.
- Apply local include, exclude, and scoring rules after eBay returns listing summaries.
- Store acquisition leads for admin review.
- Preserve feed run history so rules can be tuned over time.

## Non-Goals

- Do not fetch or process every matching eBay listing for broad searches.
- Do not attempt to mirror eBay inventory locally.
- Do not scrape eBay pages outside the approved API path.
- Do not implement full item detail fetching unless a lead has already passed summary-level filters.
- Do not build machine learning ranking in the MVP.
- Do not expose eBay credentials to browser code.
- Do not support non-eBay marketplaces in this MVP.

## Users and Access

### Admin

Admins can create, edit, run, pause, and review purchasing feeds. Admins can see query net performance, rejected listings, accepted leads, and saturation warnings.

### Staff

Staff access is optional for the MVP. If enabled, staff may review leads but should not be able to edit feed definitions unless explicitly granted later.

### Guest

Guests have no access to purchasing feeds or scan results.

## Core Concepts

### Purchasing Feed

A purchasing feed is a saved strategy for finding a class of acquisition leads. It contains one or more query nets and local rules.

Example feed names:

- Cunard timetables
- White Star Line brochures
- Ocean liner sailing schedules
- Rare travel agency ephemera

### Query Net

A query net is one eBay Browse API search request. It maps to a single call to `searchEbayBrowse(request)`, which maps to eBay's `GET /buy/browse/v1/item_summary/search` method.

A feed may contain multiple query nets because one item class may require many title variations.

### Saturated Net

A query net is saturated when eBay reports more matching results than the app can reliably inspect through the allowed pagination window. The existing wrapper allows `limit` values up to 200 and `offset` values up to 9,999, so any query with a reported total above the reachable window cannot be considered complete.

Saturated nets are dangerous because they create false negatives. The system should flag them for splitting into narrower nets.

### Acquisition Lead

An acquisition lead is an eBay listing summary that passed enough feed rules to be worth admin review. A lead is not automatically a purchase recommendation.

## Functional Requirements

### Feed Definition

The system shall allow admins to create a purchasing feed with:

- name
- description
- status: `draft`, `active`, or `paused`
- priority
- query nets
- local include rules
- local exclude rules
- local scoring rules
- optional notes about the object class being targeted

The system shall allow admins to update feed definitions without deleting prior run history.

The system shall preserve feed definition version information for each run so historical results can be interpreted against the rules that produced them.

### Query Net Definition

The system shall allow each query net to define the fields supported by the local `EbayBrowseSearchRequest` type:

- `q`
- `categoryIds`
- `aspectFilter`
- `autoCorrect`
- `charityIds`
- `fieldgroups`
- `filter`
- `gtin`
- `epid`
- `limit`
- `offset`
- `sort`
- `marketplaceId`
- `endUserContext`
- `acceptLanguage`

The system shall require each query net to include at least one of:

- `q`
- `categoryIds`
- `gtin`
- `epid`

The system shall validate query nets using the same constraints as the Browse API wrapper before saving or running them.

The system shall support multiple query nets per feed.

The system shall allow query nets to overlap.

### Running Feeds

The system shall allow admins to manually run a feed.

The system should support scheduled runs for active feeds after manual runs work reliably.

For each feed run, the system shall:

1. Load the active feed definition.
2. Run each enabled query net through `searchEbayBrowse`.
3. Record the eBay reported `total`, `limit`, `offset`, and pagination links when present.
4. Mark saturated nets.
5. Merge all returned item summaries.
6. De-duplicate results by `itemId`.
7. Apply local reject rules.
8. Apply local scoring rules.
9. Save accepted acquisition leads.
10. Save run statistics and errors.

The system shall avoid unbounded pagination. Each query net must have a configured maximum page count or maximum result count for a single run.

### Saturation Detection

The system shall mark a query net as saturated when eBay's reported `total` is greater than the maximum reachable or configured scan window.

The system shall show saturated nets in admin review with enough information to tune them:

- feed name
- query net name
- request summary
- reported total
- fetched count
- configured limit
- configured offset range
- sort value
- run timestamp

The system should recommend that saturated nets be split into narrower query nets, but it should not auto-generate replacement rules in the MVP.

### De-Duplication

The system shall de-duplicate returned listings by eBay `itemId` within a single feed run.

The system shall track which query nets matched each item so admins can understand overlap.

The system shall identify whether a listing has been seen in previous runs.

The system shall avoid creating duplicate active leads for the same eBay `itemId` unless the previous lead was archived or dismissed and the new run indicates materially changed listing data.

### Local Rule Processing

The system shall support simple post-fetch rules in the MVP.

Include rules should allow matching against fields such as:

- title
- category ID or category path when present
- price
- currency
- seller username when present
- item location when present
- condition when present

Exclude rules should allow rejecting obvious non-matches such as:

- reprints
- digital files
- postcards when the target is not a postcard
- matchbooks when the target is not a matchbook
- irrelevant brands, ships, places, or formats

The system shall record which rule or rules caused a listing to be rejected when practical.

The MVP may implement rules as structured string, number, and list comparisons. A custom code execution engine is not required for the MVP.

### Scoring

The system shall assign each non-rejected listing a local score.

The MVP score may be a simple weighted rules score. Example scoring factors:

- exact phrase appears in title
- multiple target terms appear in title
- known operator, ship, route, or destination appears
- price falls inside expected acquisition range
- listing category is preferred
- seller is known to be relevant
- disfavored terms are absent

The system shall store score details or notes so admins can understand why a lead ranked where it did.

### Acquisition Lead Review

The system shall save accepted leads with:

- eBay item ID
- title
- item URL
- affiliate URL when present
- image URL when present
- price and currency when present
- condition when present
- location when present
- source feed ID
- source query net IDs
- first seen timestamp
- last seen timestamp
- run ID
- score
- score notes
- review status: `new`, `watching`, `dismissed`, `archived`, or `purchased`

The system shall allow admins to review new leads and update review status.

The system should preserve dismissed leads so repeat false positives can be suppressed in future runs.

### Error Handling

The system shall record query net failures without failing the entire feed run when other query nets can still complete.

The system shall record eBay API failures with:

- feed ID
- query net ID
- run ID
- timestamp
- error type
- safe error message

The system shall not store eBay access tokens in feed run logs.

### Audit and Observability

The system shall store feed run summaries including:

- run ID
- feed ID
- feed version
- started timestamp
- completed timestamp
- status: `running`, `completed`, `completed_with_errors`, or `failed`
- query nets attempted
- query nets succeeded
- query nets failed
- total raw items fetched
- unique items after de-duplication
- rejected item count
- accepted lead count
- saturated net count

The system should log enough server-side information to debug failed runs without exposing credentials.

## Data Model Requirements

Exact Firestore collection names may change during implementation, but the MVP should include equivalent records for:

### Feed Definitions

Stores purchasing feed configuration and current status.

### Feed Versions

Stores immutable snapshots of feed rules used for historical runs.

### Feed Runs

Stores each run summary and status.

### Query Net Runs

Stores per-net request summaries, response totals, saturation status, fetched counts, and errors.

### Seen eBay Items

Stores normalized item-level history keyed by eBay `itemId`.

### Acquisition Leads

Stores reviewable leads generated by feed runs.

## API and Function Requirements

The MVP should add server-side functions for:

- creating and updating feed definitions
- manually running a feed
- listing feed runs
- listing acquisition leads
- updating lead review status

Scheduled feed execution may be added after manual execution is stable.

Browser code shall call Firebase Functions or Firestore-backed app APIs. Browser code shall not call eBay REST endpoints directly.

## Performance and Quota Requirements

The system shall cap the number of eBay API calls per manual feed run.

The system shall cap pages fetched per query net.

The system shall avoid retry loops that can multiply API usage unexpectedly.

The system shall support overlapping query nets but must de-duplicate before creating leads.

The system shall make saturation visible rather than silently pretending a broad net was fully scanned.

## Security Requirements

Only authenticated admins shall create, edit, run, pause, or delete purchasing feeds in the MVP.

Only authenticated admins shall review acquisition leads in the MVP.

The system shall keep eBay credentials in Functions environment configuration only.

The system shall use server-side OAuth token handling through the existing eBay OAuth helper.

The system shall not write secrets, access tokens, or authorization headers to Firestore or client-visible logs.

## MVP Acceptance Criteria

The MVP is complete when an admin can:

1. Define a feed with multiple query nets for one target item class.
2. Run the feed manually.
3. See whether any query net was saturated.
4. See how many raw listings were fetched and how many unique listings remained after de-duplication.
5. Apply basic include, exclude, and scoring rules.
6. Review generated acquisition leads.
7. Dismiss false positives so they are less likely to return as new leads.
8. Inspect run history enough to tune broad or noisy query nets.

## Future Enhancements

- Scheduled daily or hourly feed runs.
- Full item detail fetches for high-scoring leads.
- Canonical record matching.
- Image-aware matching.
- Saved rule templates for common object classes.
- Automatic suggestions for splitting saturated nets.
- Cross-marketplace support beyond eBay.
- Alerts through email, dashboard notifications, or chat integrations.
- Historical price and sell-through tracking.
