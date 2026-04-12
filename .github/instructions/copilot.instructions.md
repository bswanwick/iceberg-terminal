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

# UI Conventions

- Modals should have X icon in top-right corner to close, and clicking outside the modal should also close it.
-

# Application Architecture

## Features

- A feature is a (mostly) standalone unit of functionality that encapsulates related components, state management, and side effects for a logical part of the app.
- Features are useful for decoupling different parts of the application and promoting separation of concerns. They allow developers to focus on specific functionality without worrying about the entire application structure. For example, many areas of our app will need auth. So we can create an auth feature that handles all authentication-related logic, components, and state management. This way, we can easily reuse the auth feature across different parts of the app without duplicating code or logic.
- Each feature should have its own directory under `src/features`. For example, a feature for managing user profiles would be in `src/features/userProfile`.
- We don't aim for perfect modularity, some features may have some dependencies on others, but we should strive for clean separation of concerns as a rule of thumb.

### Current Features

- `auth`: Handles user authentication, including login, logout, and session management.
- `canonicalRecords`: Manages our canonical records, including CRUD operations, display, and state management.
- `inventory`: Manages our inventory records, including CRUD operations, display, and state management.
- `landing`: Contains small amount of components and logic related to the landing page of the application.
- `newsletter`: Manages newsletter subscription functionality, including form handling and API interactions.
