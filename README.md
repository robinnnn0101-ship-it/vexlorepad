# Vexlorepad

Vexlore branded Next.js launchpad for creating and trading tokens on Pump.fun curves, with optional VEXLOREBOT pairing.

Based on the Mayhem template, rebranded for the Vexlore ecosystem.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill NEXT_PUBLIC_RPC_URL and NEXT_PUBLIC_VEXLOREBOT_MINT
npm run dev
```

Open http://localhost:3000

## Key Features

- Token explorer (new / graduating / graduated)
- Create token page with VEXLOREBOT pair option
- Wallet connect (Phantom / Solflare)
- Trading panel
- Dark Vexlore theme (red accent)

## Deploy

Push to GitHub → Vercel → set env vars → add custom domain (vexlore.fun or launch.vexlore.fun).

## Notes

- Create currently routes through PumpPortal-style API (see create-pool.tsx). For full on-chain createV2 with quoteMint = VEXLOREBOT, wire `@pump-fun/pump-sdk` createV2AndBuyInstructions and pass the mint as quoteMint.
- Use devnet first for testing.
