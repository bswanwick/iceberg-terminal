# Feature Architecture

Features are the main ownership boundary for the web app. A feature is a mostly standalone unit of functionality that groups related view components, Redux state, selectors, side effects, data helpers, and local types for one logical part of the product.

Each feature should have its own directory under `src/features`. For example, a user profile feature would live in `src/features/userProfile`.

We do not aim for perfect modularity. Some features may depend on others, but those dependencies should stay intentional, visible, and as narrow as practical.

## Boundary Guidelines

- Feature folders own their local `slice.ts`, `selectors.ts`, `epics.ts`, `components`, local data helpers, and feature-specific types.
- Shared reducer registration belongs in `src/app/store.ts`.
- Shared epic registration belongs in `src/app/rootEpic.ts`.
- Cross-feature imports should prefer a feature's public entrypoint, such as `index.ts`, when one exists.
- Avoid importing another feature's internal components, form helpers, or slice internals unless that surface is deliberately public.
- Shared domain primitives should live in a neutral module when multiple features need them.
- Cross-feature orchestration should live at the app coordination layer or in a clearly named coordinator when one feature controls another feature's lifecycle.
- The `src/features/firebase` feature is the client-side Firebase data access boundary for Firestore and Storage helpers.

## Current Features

- `analytics`: Handles public analytics event tracking and route-level analytics helpers.
- `auth`: Handles user authentication, including login, logout, role lookup, and session management.
- `canonicalRecords`: Manages canonical item records, including CRUD operations, display, images, and state management.
- `ebay`: Provides the browser-facing eBay Browse API wrapper that calls Firebase Functions instead of eBay directly.
- `ebayQuery`: Manages eBay query builder state and request composition.
- `featuredInventory`: Manages public featured inventory listings shown outside the signed-in inventory workflow.
- `files`: Provides shared stored-file types, file sorting helpers, storage explorer UI, and browser file actions.
- `firebase`: Provides shared Firestore and Storage access helpers, collection pagination state, and Firebase side effects.
- `inventory`: Manages user inventory records, including CRUD operations, file uploads, condition reports, forms, and state management.
- `landing`: Contains landing-page and public marketing-site components.
- `landingContent`: Manages editable landing-page content and related admin controls.
- `newsletter`: Manages newsletter and access signup forms, state, and side effects.
- `seo`: Provides SEO metadata and page metadata rendering helpers.
- `ui`: Manages shared UI state and cross-cutting UI side effects such as screen lock and toast dismissal.

## Boundary Review

This review captures current feature-boundary pressure points. It is a refactoring backlog, not a requirement to fix every item before changing nearby code.

### High Priority

- `featuredInventory` depends on `inventory/formUtils` for `InventoryProductLine` and product-line validation. Product-line primitives are shared domain concepts and should move to a neutral domain module before more features depend on them.
- `inventory/epics.ts` writes and deletes featured inventory documents, then dispatches `featuredInventoryFetchRequested`. That makes inventory responsible for another feature's lifecycle. Consider moving featured inventory publishing/sync orchestration to an app-level coordinator or a dedicated publishing boundary.

### Medium Priority

- Direct Firebase SDK imports exist in analytics, auth, and eBay browser helpers while the project guidance says SDK imports should live under `src/firebase`. Clarify whether auth, functions, and analytics are explicit exceptions or centralize wrappers for those services.
- `inventory` UI imports canonical record components directly. Decide whether canonical record picker/add components are a supported public surface of `canonicalRecords`, or move that composition into a shared workflow.
- `analytics` imports featured inventory selectors and types directly. A stable analytics payload adapter would reduce coupling to featured inventory internals.

### Low Priority

- Only some features expose `index.ts` public entrypoints today. Standardize public barrels gradually as features gain external consumers.
- Normalize the casing of `newsletter/useSIgnupForm.ts` to avoid case-sensitive environment issues.

## Adding Or Changing A Feature

When adding a feature, start with the owning directory under `src/features`, keep side effects in RxJS epics, and register the reducer and epic through the app-level registration files. If another feature needs to use it, expose the smallest stable surface needed through a public entrypoint.
