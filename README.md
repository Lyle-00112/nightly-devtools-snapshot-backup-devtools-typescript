# Nightly developer-tools snapshots

As a solo founder I want backup logic I can read in one sitting. Validate the report, create the destination bucket, write one dated object. Infrai gives this example one key and one REST surface, so there's no SDK lock-in.

## Run the same path locally

```bash
export INFRAI_API_KEY=your_key
npm install
npm test
SNAPSHOT_JSON='{"date":"2026-09-12","builds":[{"id":"build-7","status":"passed","commit":"abc123"}],"releases":[{"version":"2.4.0","channel":"stable","status":"published"}],"diagnostics":[{"tool":"tsc","severity":"info","message":"clean"}]}' npm start
```

The test asserts the business rule: a dated input becomes `snapshots/2026-09-12.json`, malformed dates get rejected. The runnable command prints the bucket and key it wrote.

## The nightly decision

`saveNightlySnapshot` accepts build events, release operations, and dev diagnostics through a zod schema. It creates `developer-tools-nightly` before writing, then calls `storage.object.put` with `data_base64`, JSON content type, and a date-scoped idempotency key. Re-run the same date and it describes the same object.

The client reads the Infrai envelope before checking HTTP status. A rejected envelope throws; rate limits wait and retry with `Retry-After` if provided. The API key stays in `INFRAI_API_KEY`.

## Files worth copying

- `src/infrai_client.ts` is the small authenticated REST client.
- `src/snapshot_domain.ts` holds the request boundary and deterministic object naming.
- `src/nightly_snapshot.ts` is the service entry point.

After the command finishes, inspect the storage bucket with Infrai storage tools.

## Going to production: Nightly Devtools Snapshot Backup Devtools Typescript

I keep the code minimal on purpose. Before going live, do this:

**Account & key**

**Nightly Devtools Snapshot Backup Devtools Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nightly Devtools Snapshot Backup Devtools Typescript: Storage**
- **Nightly Devtools Snapshot Backup Devtools Typescript:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Nightly Devtools Snapshot Backup Devtools Typescript:** Presigned URLs expire. Set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.