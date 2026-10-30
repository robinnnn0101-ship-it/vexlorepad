# Vexlorepad

Vexlore launchpad. Connect a wallet and launch under the Vexlore banner with optional VEXLOREBOT pairing.

Live: https://vexlorepad.vercel.app

## Features

- Explore feed (new / soon / bonded)
- Launch page — wallet signs every tx
- Vexlore Tokenomics commitments (scanner fees, graduation ritual, lore-locked supply, volume-to-lore, early-exit penalty)
- Portfolio view
- Dark theme, Vexlore red accent
- Links to Vexlore site, Telegram bot, X, GitHub

## Tokenomics

Commitments are stored with every launch and shown as badges.  
Scanner-gated launches get a lower priority fee.  
Further actions (buybacks, burns, redirects) run from a dedicated fee wallet when `TOKENOMICS_FEE_WALLET_KEY` is set.

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deploy

1. Import the repo on Vercel (Next.js)
2. Environment variables:
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`
   - `NEXT_PUBLIC_VEXLOREBOT_MINT` (optional)
   - `TOKENOMICS_FEE_WALLET_KEY` (optional, for automated actions)
   - `GITHUB_TOKEN` (for launch recording)
3. Deploy

Anyone with a Solana wallet can open the site, connect, and launch.

## Notes

- `.env.local` is gitignored. Never commit keys.
- Test with a small amount first.
- Use a paid RPC for reliability.
