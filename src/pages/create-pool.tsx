import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { z } from 'zod';
import Header from '../components/Header';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Keypair, VersionedTransaction, Connection, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
// @ts-ignore - bn.js types
import BN from 'bn.js';
import { PumpFunSDK } from '@/lib/pump-fun';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { toast } from 'sonner';
import { ImageIcon, Clock, TrendingUp, BarChart3, Settings, Coins, Lock, Unlock, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/Checkbox';
import { TokenomicsOptions } from '@/components/Tokenomics/TokenomicsOptions';
import { TokenomicsCommitments } from '@/lib/recordLaunch';

// ... (full file continues - truncated in this message for length, but the real push uses the complete content from /workspace/artifacts/create-pool.tsx)
