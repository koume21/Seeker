# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Seeker: a Next.js app where users log programming errors and their fixes as posts (title, markdown-ish content with fenced code blocks, language tag, resolved/unresolved status), optionally publish them, and browse/like others' published posts.

## Commands

```bash
npm run dev            # start dev server (localhost:3000)
npm run build          # runs `prisma generate` first, then `next build` (does NOT run migrations)
npm run migrate:deploy # apply pending migrations manually (run against a DIRECT / non-pooled DB URL)
npm run start          # production server
npm run lint           # eslint
```

**Migrations are intentionally NOT part of `build`.** Running `prisma migrate deploy` during a Vercel build against the Neon **pooled** connection (`DATABASE_URL` has `pgbouncer=true`) fails with `P1002` — Prisma's migration engine takes a session-level advisory lock (`pg_advisory_lock`) that PgBouncer's transaction pooling can't hold, so it times out after 10s. So the build only runs `prisma generate`, and migrations are applied out-of-band via `npm run migrate:deploy` (point `DATABASE_URL` at a **direct**, non-pooled Neon endpoint — host without `-pooler`, no `pgbouncer=true` — when doing so).

Database (local Postgres via Docker):
```bash
docker-compose up -d          # starts postgres on :5432 (user/password/seeker_db)
npx prisma migrate dev        # create/apply a migration after editing prisma/schema.prisma
npx prisma studio             # inspect data
```

`vitest` is a devDependency but there are no test files yet and no test script in package.json — don't assume a test suite exists.

## Architecture

**Auth (NextAuth v5 / Auth.js beta)** — `src/auth.ts` configures GitHub, Google, and Credentials providers with `PrismaAdapter`, JWT session strategy (`maxAge: 30 * 60`, i.e. 30 min). Credentials auth hashes `password` with `bcryptjs` on both registration (`src/app/actions/action.ts`) and login (`src/auth.ts`'s `authorize`) — don't reintroduce plaintext comparisons.

**Route protection via `src/proxy.ts`, not `middleware.ts`** — this repo runs a Next.js version where the middleware convention was renamed to `proxy.ts`; it still fills the same role (runs on every matched request). It redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/main/home`. The matcher excludes `api`, static assets, and `/resister` (the sign-up route — note the intentional/typo'd spelling, it's used consistently across the codebase, not just this file).

**Route groups**:
- `src/app/main/**` — the authenticated area. `src/app/main/layout.tsx` is a server component that loads the session, the user's languages, and post-count stats, then wraps children in `MainProvider` (`src/app/main/components/user-provider.tsx`, a client-side context exposing `userId`/`languages` via `useMainData()`).
- `src/app/main/home` — the current user's own posts (private workspace).
- `src/app/main/publish` — the public feed of posts where `isPublished: true`, across all users.
- `src/app/main/new_post` / `new_post/[id]/edit` — the create/edit form (`post-form.tsx`).
- `src/app/main/display/[id]` — read-only view of a single post, plus threaded comments (`comment-section.tsx`/`comment-item.tsx`). Non-owners get a not-found view for unpublished posts.
- `src/app/main/setting` — the current user's account settings (name/email/image, password change) via `setting-forms.tsx` + `_action.ts`.
- `src/app/main/activity` — placeholder page ("STATUS: COMING_SOON"), not yet implemented.

**Data-fetching/mutation split per route folder** — each feature folder under `src/app/main/*` follows a `_lib.ts` (read queries, e.g. `getPosts`) + `_action.ts` (server actions / mutations, `'use server'`) convention. `home/_lib.ts` and `publish/_lib.ts` both export a `getPosts` with the same search/filter shape but different `whereClause` scoping (own posts vs. published posts) — check which one you're editing.

**Full-text search** — when a search term is present, `getPosts` in both `_lib.ts` files switches from `prisma.post.findMany` to a raw `$queryRaw` against `Post.search_vector` (a Postgres generated `tsvector` column, weighted title/content) using `websearch_to_tsquery('simple', ...)`, OR'd with a per-word `ILIKE` fallback so partial/non-tokenizable matches (e.g. Japanese) still hit. `'simple'` is used instead of `'english'` deliberately for multilingual content. Cursor pagination in the raw-SQL path uses a `(created_at, id) < (...)` tuple comparison, not Prisma's `cursor`/`skip`.

**API routes vs. server actions** — `src/app/api/**` is used specifically for client-side `fetch()` calls that need a JSON response back into component state (likes toggle, post status PATCH, comments, adding a language, shiki syntax highlighting), whereas form submissions and redirects use server actions instead. Keep that split when adding new mutations: if the client needs the response data without a navigation, add an API route; if it's a form/redirect flow, use a server action.

**Two independent status concepts on `Post`** — don't conflate them:
- `status` (free string, `"UNRESOLVED"` / `"RESOLVED"`) — whether the error was solved.
- `isPublished` (boolean) — whether the post is visible in the public feed (`/main/publish`).

**Code-block rendering is duplicated, not shared** — `post-form.tsx` (edit preview) and `main/display/[id]/page.tsx` (final view) each implement their own regex-based split on triple-backtick fences (` ```...``` `) and their own terminal-window-styled code card, with slightly different logic (e.g. only `display/[id]` parses an optional language-name first line). There's also a real syntax highlighter available (`src/app/api/highlight/route.ts` via `shiki`, plus `@code-hike/bright` and `main/components/CodeBlock.tsx`) that these two hand-rolled parsers don't use. If you touch content rendering, check whether to reconcile with `CodeBlock.tsx`/the highlight API rather than adding a third variant.

**Prisma** — `src/lib/prisma.ts` is the standard singleton-on-`global` pattern, importing from `@prisma/client`.

**Schema** (`prisma/schema.prisma`): standard Auth.js tables (`Account`, `Session`, `User`, `VerificationToken`) plus app tables `Language`, `Post`, `Comment` (self-referential for replies via `parentId`), `Like` (unique on `[userId, postId]`). `Post` also has a `priority` field (`"medium"` default) and a `Label`/`PostLabel` many-to-many join table — these were added in the uncommitted `20260901055145_post_schema_update` migration and aren't wired up in any UI or action yet (`post-form.tsx` has no priority/label controls), so treat them as in-progress schema, not an established convention.
