# Iceberg Terminal

React + TypeScript + Vite app wired with Redux Toolkit, redux-observable/RxJS, Firebase, and MUI (styled-components engine). Includes Google Auth + Firestore CRUD sample flow and ESLint + Prettier.

## Quick start

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

## Notes

Notes are stored under `users/{uid}/notes` in Firestore. Firestore rules should lock data to the authenticated user.
