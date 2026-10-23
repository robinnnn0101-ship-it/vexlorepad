# Vexlorepad

Vexlore branded launchpad. Anyone can connect a wallet and launch a token on the Pump.fun curve (with optional VEXLOREBOT pairing).

Public repo: https://github.com/robinnnn0101-ship-it/vexlorepad

## Features

- Explore new / graduating / graduated tokens
- Create / launch page (wallet signs the tx)
- Portfolio view
- Dark theme with Vexlore red accent
- Links to Vexlore website, Telegram bot, X, GitHub

## Local

```bash
npm install
cp .env.example .env.local
# add your RPC (Helius recommended)
npm run dev
```

## Deploy so anyone can use it (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → import this repo
2. Framework preset: Next.js
3. Environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_RPC_URL` = your Helius or QuickNode RPC (required for reliability)
   - `NEXT_PUBLIC_SOLANA_NETWORK` = `mainnet-beta`
   - `NEXT_PUBLIC_VEXLOREBOT_MINT` = your VEXLOREBOT mint (optional, for pairing UI)
4. Deploy
5. (Optional) Add custom domain: `vexlore.fun` or `launch.vexlore.fun`

After deploy, anyone with a Solana wallet (Phantom / Solflare) can open the site, connect, and launch.

## How launches work

- User fills the form → metadata uploads → PumpPortal builds the create transaction → user signs with their wallet.
- No server-side hot wallet. User pays gas + any initial buy.
- VEXLOREBOT pairing checkbox is UI-ready. Full on-chain `quoteMint` wiring needs `@pump-fun/pump-sdk` `createV2` (next step if you want fees in VEXLOREBOT).

## Notes

- `.env.local` is gitignored. Never commit RPC keys.
- Test on mainnet with a small amount first.
- For higher reliability, use a paid RPC (Helius free tier is fine to start).
