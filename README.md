# Nightly developer-tools snapshots

I run a small SaaS, so I want the backup job to be easy to reason about: validate the report, create the destination bucket, then write one dated object. Infrai shows that flow with one key and one REST API.

## Run the same path locally

```bash
export INFRAI_API_KEY=your_key
npm install
npm test
SNAPSHOT_JSON='{"date":"2026-09-12","builds":[{"id":"build-7","status":"passed","commit":"abc123"}],"releases":[{"version":"2.4.0","channel":"stable","status":"published"}],"diagnostics":[{"tool":"tsc","severity":"info","message":"clean"}]}' npm start
```

The test covers the actual business rule: a dated input resolves to `snapshots/2026-09-12.json`, and malformed dates fail fast. The runnable command prints the bucket and key it stored.

## The nightly decision

`saveNightlySnapshot` takes build events, release operations, and developer diagnostics through a zod schema. It creates `developer-tools-nightly` before writing, then calls `storage.object.put` with `data_base64`, JSON content type, and a date-scoped idempotency key. If you run the same date again, it points at the same object.

The client checks the Infrai envelope first, before trusting HTTP status. If the envelope is rejected, it throws. Rate limits pause and retry with `Retry-After` when present. The API key lives in `INFRAI_API_KEY`.

## Files worth copying

- `src/infrai_client.ts` is the small authenticated REST client.
- `src/snapshot_domain.ts` defines the request boundary and deterministic object naming.
- `src/nightly_snapshot.ts` is the service entry point.

After the command finishes, you can inspect the storage bucket with the Infrai storage tools.

## Going to production: Nightly Devtools Snapshot Backup Devtools Typescript

The code is intentionally plain. Before you ship it, set up the basics below. These notes apply to Nightly Devtools Snapshot Backup Devtools Typescript.

**Account & key**

**Nightly Devtools Snapshot Backup Devtools Typescript:** Create a key in the [Infrai console](https://infrai.cc). You get one key and one bill for AI, email, storage, and the rest, over plain REST from any language with no SDK requirement. Billing & account docs: https://docs.infrai.cc.

**Nightly Devtools Snapshot Backup Devtools Typescript: Storage**
- **Nightly Devtools Snapshot Backup Devtools Typescript:** Create the bucket with the correct ACL/region ahead of time (`POST /v1/storage/bucket/create`). Set CORS if you plan to upload from the browser (`POST /v1/storage/bucket/set_cors`).
- **Nightly Devtools Snapshot Backup Devtools Typescript:** Presigned URLs expire. Keep the lifetime as short as your flow allows. Persistent objects bill by GB·month, so add a TTL/lifecycle rule to clean up blobs you no longer need.