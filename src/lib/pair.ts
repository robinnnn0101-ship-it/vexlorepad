import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { PUMP_SDK, OnlinePumpSdk } from '@pump-fun/pump-sdk';

export async function buildPairedCreateTx(params: {
  connection: Connection;
  mintKeypair: Keypair;
  creator: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  quoteMint: PublicKey;
  initialBuyQuote?: number;
}) {
  const online = new OnlinePumpSdk(params.connection);
  const quote = await online.resolveQuoteMint(params.quoteMint);
  const ix = await PUMP_SDK.createV2Instruction({
    mint: params.mintKeypair.publicKey,
    name: params.name,
    symbol: params.symbol,
    uri: params.uri,
    creator: params.creator,
    user: params.creator,
    mayhemMode: false,
    quoteMint: quote.mint,
    quoteTokenProgram: quote.quoteTokenProgram,
    pumpQuote: quote.pumpQuote?.accounts,
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = params.creator;
  tx.recentBlockhash = (await params.connection.getLatestBlockhash()).blockhash;
  tx.partialSign(params.mintKeypair);
  return tx;
}
