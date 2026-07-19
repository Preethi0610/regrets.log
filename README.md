# Regret.log

Anonymous, categorized regrets people can browse before making a similar decision.

Built a project using Next.js frontend, Supabase as the backend (Postgres database, Google OAuth, RLS).

## What it does

- Post an anonymous regret: category, title, what happened, and optionally what you'd do instead
- Browse the public feed, filterable by category, sortable by recency or top reactions
- React to posts with any emoji toggle on/off, see live counts
- Sign in with Google (used only for spam prevention nothing is shown publicly)
- Personal dashboard: pick an illustrated avatar, view your own posts, see total reactions received, delete posts

## Stack

- **Next.js** (App Router) + React + TypeScript + Tailwind CSS
- **Supabase** : Postgres database, Google OAuth, Row Level Security for all data access
- **Vercel** : hosting/deployment
- Avatars via [DiceBear](https://www.dicebear.com/) (`adventurer` style)

© 2026 [Preethi Amasa]. All Rights Reserved.

