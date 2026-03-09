---
description: 'Workspace guidance for the Iceberg Terminal project.'
---

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

# Tips for working with libraries or dependencies

**react**

- In most cases, we don't need props for our components. useSelector within each component is preferred over passing props down from parent components.
- Do not add props to newly created components unless explicitly told to. useSelector instead.

**react-router**

- each route component should be in it's own file in a /routes directory. The index file should export the `<Routes>` component that defines the route paths and components. This keeps routing logic organized and separate from other UI components.
