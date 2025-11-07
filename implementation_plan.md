# Danube Admin UI — Implementation Plan

## Goals
- Build a clean, modern web UI for Danube operations.
- Consume BFF endpoints from danube-admin-gateway under `/ui/v1/*`.
- Provide three main pages with intuitive navigation:
  - Cluster overview
  - Broker details (including topics assigned to the broker)
  - Topic details (schema, subscriptions, runtime metrics)

## Recommended Stack
- Framework: React (TypeScript) + Vite
- UI Library: MUI (Material-UI) + Icons
- Data fetching: TanStack React Query
- HTTP client: fetch or Axios (optional)
- Charts: Recharts (simple, composable)
- Routing: React Router v6+
- Formatting: Prettier + ESLint
- Build/Deploy: Vite build, static hosting (Netlify/Vercel/GH Pages) or container

## Project Structure
```
src/
  app/
    queryClient.ts
    routes.tsx
    theme.ts
  components/
    layout/
      AppLayout.tsx   # left sidebar layout
      TopBar.tsx
    ui/               # small UI helpers if needed
  pages/
    ClusterPage.tsx
    BrokerPage.tsx
    TopicPage.tsx
  features/
    cluster/api.ts    # queries for cluster
    broker/api.ts     # queries for broker
    topic/api.ts      # queries for topic
  lib/
    api.ts            # baseUrl, helpers, error handling
  main.tsx
  index.css
```

## Navigation & UX
- Choose a persistent left sidebar layout (recommended) over a single dynamic page.
  - Pros: Clear navigation, deep-linkable routes, easy mental model, scalable.
  - Pages:
    - `/`            → redirect to `/cluster`
    - `/cluster`     → Cluster overview page
    - `/brokers/:id` → Broker details page (includes topics table)
    - `/topics/:topic` → Topic details page (topic is URL-encoded)
- Top bar shows environment/connection status and last refresh timestamp.
- Tables are sortable and filterable where useful.

## Backend Contracts (BFF)
- GET `/ui/v1/cluster`
- GET `/ui/v1/brokers/{broker_id}`
- GET `/ui/v1/topics/{topic}` (topic must be URL-encoded)

## Data fetching (React Query)
- Global QueryClient with defaults:
  - `staleTime: 3000` (matches gateway 3s TTL)
  - `refetchOnWindowFocus: true`
- API base URL from env: `VITE_GATEWAY_BASE_URL` (default `http://localhost:8080`)

## Pages — Scope & UI

### 1) ClusterPage
- Cards with totals: broker_count, topics_total, rpc_total, active_connections
- Brokers table: id, addr, role, topics_owned, rpc_total
- Click row → navigate to `/brokers/:id`
- Show partial errors (from response.errors) as dismissible alerts

### 2) BrokerPage
- Header with broker id, role, address
- Metrics cards: topics_owned, rpc_total, producers_connected, consumers_connected
- Topics table: name, producers, consumers
  - Click topic name → navigate to `/topics/:topic` (URL-encode)
- Show partial errors as alerts

### 3) TopicPage
- Header with topic name
- Schema section: type and decoded schema preview (if applicable)
- Subscriptions list (chips)
- Runtime metrics cards: messages_in_total, producers, consumers
- (Optional) charts: message rate over time if available later

## Step-by-Step Implementation

1) Bootstrap project
- Create Vite React TS app
- Install deps: `@mui/material @mui/icons-material @emotion/react @emotion/styled`, `@tanstack/react-query`, `recharts`
- Add Prettier/ESLint config (optional)

2) Global app setup
- Create theme in `app/theme.ts` with a modern palette and typography
- Initialize QueryClient in `app/queryClient.ts`
- Add React Router with routes (`/cluster`, `/brokers/:id`, `/topics/:topic`)
- Implement `AppLayout` with left sidebar + top bar

3) API layer
- `lib/api.ts`: base URL, fetch helper with error handling
- `features/*/api.ts`: functions using fetch + React Query hooks
  - useClusterPage()
  - useBrokerPage(id)
  - useTopicPage(topic)

4) ClusterPage
- Implement cards and brokers table
- Click → route to broker page
- Handle response.errors (alerts)

5) BrokerPage
- Header: identity, role, addr
- Metrics cards
- Topics table; clicking topic routes to topic page (ensure URL-encoding)

6) TopicPage
- Display schema (type and base64 decoded text if UTF-8)
- Subscriptions list
- Metrics cards: messages_in_total, producers, consumers

7) Polish & UX
- Loading and error states
- Empty states (no brokers/topics)
- Timestamp display from payload
- Dark mode toggle (optional)

8) Configuration & build
- `.env` with `VITE_GATEWAY_BASE_URL=http://localhost:8080`
- `vite.config.ts` with dev server proxy (optional)
- Production build & deploy README

## URL Encoding Helper
- Topics contain slashes; use a helper to encode links:
```ts
import { encodeURIComponent as enc } from 'global';
const toTopicUrl = (t: string) => `/topics/${encodeURIComponent(t)}`;
```

## Error Handling
- Show gateway-provided `errors` array as non-blocking alerts
- Distinguish between fatal (no payload) and partial errors (payload present)

## Theming Guidelines (MUI)
- Custom primary color (modern blue) and secondary accent
- Rounded corners (radius 8)
- Subtle shadows on cards
- Inter or Roboto font

## Future Enhancements
- Pagination/virtualization for large topic lists (MUI DataGrid)
- Persisted filters in URL params
- Auto-refresh toggle & intervals
- Charts for rates if/when backend exposes them
- Auth (JWT/OIDC) if required later

## Answer: One-page vs sidebar
- Use a **left sidebar layout with routes**. It’s clearer, scales better, enables deep-linking, and matches common admin UX patterns.
