---
description: 'Workspace guidance for the Iceberg Terminal project.'
---

# File Directory Structure

- `src/features`: Contains all feature modules, each in its own directory. Used in the web app client.
- `src/functions`: Contains all serverless functions (Firebase), Consumed only by the web app client currently.
- `dev`: Contains development notes and references for the project. Not used in production.
- `public`: Contains static assets for the web app client, such as images, fonts, and icons.

# Coding Conventions

- Minimal use of useEffect hooks. React is used only as a view layer; the app should remain UI framework agnostic.
- Use RxJS for all async operations and side effects.
- Use TypeScript for type safety and maintainability. Avoid `any` type; prefer specific types or generics.
- Use destructuring and concise syntax for cleaner code. Instead of this:

```
return {
  title: payload.title,
  brandPublisher: payload.brandPublisher,
  year: payload.year,
  format: payload.format,
}
```

do this:

```
const { title, brandPublisher, year, format } = payload;
return { title, brandPublisher, year, format };
```

- Avoid casting with `as`. Instead, ensure proper types are defined and inferred throughout the codebase.
- No inline types. Define interfaces or types separately for better readability and maintainability.

# Firebase and Data Access

- The `/src/firebase` directory is where we setup the singleton Firebase app instance and provide shared helpers for Firestore and Storage access. This is the only place where we should import Firebase SDKs directly.
- Use the shared `src/features/firebase` feature for client-side Firebase data access instead of importing Firestore or Storage SDK operations directly in our feature code.
- Import Firestore helpers such as `fetchFirestoreCollectionPage`, `fetchFirestoreDocument`, `addFirestoreDocument`, `setFirestoreDocument`, `updateFirestoreDocument`, `deleteFirestoreDocument`, and `firebaseServerTimestamp` from `../firebase` within feature modules.
- Import Storage helpers such as `buildUserStoragePath`, `uploadStorageFile`, `deleteStorageFile`, and `listStoragePath` from `../firebase` within feature modules.
- For collection reads that need paging, use the shared pagination helpers and types: `FirestoreCollectionPageRequest`, `FirestoreCollectionPageResult`, `firestoreCollectionFirstPageRequested`, `firestoreCollectionNextPageRequested`, and `selectFirebaseCollectionPageState`/`selectFirebaseCollectionHasNextPage` where centralized pagination state is useful.
- Give every paginated collection a stable `collectionKey`, pass explicit `orderBy` clauses for deterministic cursors, and use `includeTotalCount: false` when a count is not needed.

# Tips for working with libraries or dependencies

**react**

- In most cases, we don't need props for our components. useSelector within each component is preferred over passing props down from parent components.
- Do not add props to newly created components unless explicitly told to. useSelector instead.
- No prop drilling.
- No triggering side-effects on render or mount. Avoid `useEffect(() => { ... }, [])`.

**react-router**

- each route component should be in it's own file in a /routes directory. The index file should export the `<Routes>` component that defines the route paths and components. This keeps routing logic organized and separate from other UI components.

# UI Conventions

- Modals should have X icon in top-right corner to close, and clicking outside the modal should also close it.
- The general theme and mood of the consumer UI is restrained, institutional, and accessible to the everyday user.
- All site copy and text must be accessible and friendly to the everyday user. Avoid jargon, industry language, collector-only terms, antique dealer language, collectible market syntax, etc. And especially make sure that we are mindful of people's personal boundaries and autonomy. We aim to show and immense respect for our users' agency. We want to empower them to make their own decisions and not feel pressured or manipulated by our language. So we should avoid language that could be perceived as pushy, manipulative, or that implies a lack of choice. Instead, we should use language that is informative, respectful, and that emphasizes the user's freedom to choose. For example, instead of saying "Don't miss out on this amazing deal!" we could say "You can subscribe to our newsletter for updates and insights, but it's completely up to you!" This way, we are providing information without pressuring the user to take any specific action.
- Our website aims for a professional institutional tone that is both passionate and inviting. We want to create a sense of trust and reliability, while also being approachable and user-friendly.

# Application Architecture

## Features

- The canonical feature architecture, current feature list, and boundary review live in `src/features/README.md`.
- New feature modules should live under `src/features`, each in its own directory.
- Prefer clean feature boundaries, but do not chase perfect modularity when a narrow dependency is clearer.
- Prefer feature public entrypoints, such as `index.ts`, when importing across feature boundaries.
