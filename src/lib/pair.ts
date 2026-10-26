import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { PUMP_SDK } from '@pump-fun/pump-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export async function buildPairedCreateTx(params: {
  connection: Connection;
  mintKeypair: Keypair;
  creator: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  quoteMint: PublicKey;
}) {
  // Direct createV2 without OnlinePumpSdk (avoids extra RPC calls that 403)
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
  const { blockhash } = await params.connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.partialSign(params.mintKeypair);
  return tx;
}
