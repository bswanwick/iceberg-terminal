# Holistic Code Review

Date: 2026-07-08

Scope reviewed: Firebase and Firestore rules, Storage rules, deploy configuration, auth role functions, file upload and deletion flows, public signup flows, featured inventory publishing, and automated test coverage.

## Findings

### High: Canonical record image uploads are blocked by Storage rules

`src/features/canonicalRecords/epics.ts` uploads canonical record images with `buildUserStoragePath({ scope: ['canonical-records', 'images'] })`, producing paths under `users/{uid}/canonical-records/images`. `storage.rules` only grants access under `users/{userId}/inventory/{allPaths=**}`.

As written, signed-in users can successfully write inventory files, but canonical record image uploads should fail with Storage permission errors unless production rules differ from this repository.

Recommended remediation: add a matching `users/{userId}/canonical-records/{allPaths=**}` rule using the same owner/elevated-access model, or move canonical image uploads under an allowed namespace. Include the same size and content-type constraints recommended below.

### High: Firebase deploy configuration does not include Firestore or Storage rules

`firebase.json` defines `functions` and `hosting`, but does not declare `firestore.rules`, `firestore.indexes.json`, or `storage.rules`. The root `package.json` deploy script deploys only hosting, and `deploy:functions` deploys only functions.

This creates a drift risk: rule and index changes can be committed without ever being deployed, leaving production on stale or default rules.

Recommended remediation: add Firestore and Storage configuration to `firebase.json`, then add explicit deploy scripts for rules and indexes, for example targeted deploys for `firestore:rules`, `firestore:indexes`, and `storage`.

### High: Owner Storage uploads are unrestricted for inventory

`storage.rules` allows owner read/write under `users/{userId}/inventory/{allPaths=**}` without constraining `request.resource.size` or `request.resource.contentType`. `src/features/firebase/storageApi.ts` uploads arbitrary `File` objects, and `src/features/inventory/components/InventoryFormsSection.tsx` dispatches every selected or dropped file for upload.

This allows accidental or malicious large uploads and unexpected file types inside the signed-in user's allowed namespace, increasing storage cost and content-handling risk.

Recommended remediation: enforce maximum file sizes and allowed content types in Storage rules. Mirror those checks in the UI before dispatching upload actions so users get immediate feedback, but keep the rules as the authority.

### Medium: Public signup collections have no server-side schema or abuse controls

`firestore.rules` allows public creates to `SignupRequests` and `NewsletterSubscriptions`. The validation in `src/features/newsletter/formUtils.ts` is client-side only and can be bypassed by direct Firestore writes.

This permits malformed, oversized, or spammy documents to be written by unauthenticated clients, creating cost and cleanup risk around user-provided contact data.

Recommended remediation: add rules-level allowlists for fields, type checks, length limits, and timestamp constraints. Prefer routing public signup submission through a callable or HTTP function with App Check and rate limiting if this endpoint needs to stay open to unauthenticated users.

### Medium: Client-held pending-removal state can delete Storage objects

Inventory and canonical record flows delete files from client-held pending-removal state after Firestore writes. Inventory uses `filesPendingRemoval`; canonical records use `imagesPendingRemoval`. Rules limit these deletions to the signed-in user's allowed namespace, but a malicious or stale client can still delete any permitted object path it submits, including files still referenced by another record.

Recommended remediation: reconcile deletion candidates against the current server document and only delete paths proven to have been removed from that specific record. For stronger guarantees, move Storage cleanup into trusted backend code that can compare before and after state.

### Medium: Public featured inventory is owner-writable

`firestore.rules` makes `featuredInventory` public-readable and allows signed-in owners to create, update, and delete documents when `ownerId` matches their UID. `syncFeaturedInventoryDocument` writes public display fields derived from client inventory state.

If non-staff authenticated users are allowed into these flows, they can publish arbitrary public-facing listing data within the accepted client shape.

Recommended remediation: restrict featured publishing to elevated roles, or enforce a strict rules schema and server-mediated mirroring from owned inventory records.

### Low: No automated tests or emulator coverage were found

No `*.test.*` or `*.spec.*` files were found, and no App Check, emulator connection, or Firebase rules unit-testing hooks were found in the workspace.

Recommended remediation: add Firebase Emulator tests for Firestore and Storage rules, especially canonical image uploads, inventory file limits, public signup schema validation, and featured inventory authorization. Add focused unit tests for form normalization, file validation, and epic behavior where practical.

## Verification Performed

- Editor diagnostics reported no current TypeScript errors.
- Searched for automated tests with `**/*.{test,spec}.{ts,tsx,js,jsx}` and found none.
- Searched for App Check, emulator connections, and rules unit-testing hooks and found no matches.
- Reviewed the relevant Firebase rules, deploy config, auth functions, storage wrapper, inventory/canonical upload paths, deletion flows, public signup validation, and featured inventory sync code.

Suggested validation commands for follow-up changes:

```powershell
npm run lint
npm run build
cd functions; npm run build
```

After remediating the rules, add and run Firebase Emulator tests covering the affected Firestore and Storage permissions.
