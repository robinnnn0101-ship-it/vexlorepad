import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { PUMP_SDK } from '@pump-fun/pump-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

async function getBlockhash(connection: Connection): Promise<string> {
  const rpcs = [
    process.env.NEXT_PUBLIC_RPC_URL,
    "https://solana-rpc.publicnode.com",
    "https://api.mainnet-beta.solana.com",
    "https://rpc.ankr.com/solana",
  ].filter(Boolean) as string[];
  for (const rpc of rpcs) {
    try {
      const c = new Connection(rpc, "confirmed");
      const { blockhash } = await c.getLatestBlockhash("confirmed");
      return blockhash;
    } catch {}
  }
  throw new Error("All RPCs failed to get blockhash");
}

export async function buildPairedCreateTx(params: {
  connection: Connection;
  mintKeypair: Keypair;
  creator: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  quoteMint: PublicKey;
}) {
  const ix = await PUMP_SDK.createV2Instruction({
    mint: params.mintKeypair.publicKey,
    name: params.name,
    symbol: params.symbol,
    uri: params.uri,
    creator: params.creator,
    user: params.creator,
    mayhemMode: false,
    quoteMint: params.quoteMint,
    quoteTokenProgram: TOKEN_PROGRAM_ID,
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = params.creator;
  tx.recentBlockhash = await getBlockhash(params.connection);
  tx.partialSign(params.mintKeypair);
  return tx;
}
