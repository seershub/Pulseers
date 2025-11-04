"use client";

import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { createWalletClient, custom, type Account } from "viem";
import { base } from "viem/chains";
import { sdk } from "@/lib/farcaster-sdk";
import { useWallet } from "@/hooks/useWallet";

/**
 * Player Signal Hook
 * Uses EIP-712 typed data signing for on-chain verifiable player signals
 * This creates a real blockchain signature without requiring a transaction
 */
export function usePlayerSignal() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const { address, isFarcaster } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const signal = async (playerId: string) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log("🎯 Submitting player signal:", { playerId });

      // Use Farcaster wallet if detected, otherwise use regular wallet
      let clientToUse = walletClient;
      let accountToUse: `0x${string}` | Account | null = address ? (address as `0x${string}`) : null;

      // If useWallet detected Farcaster wallet, use it
      if (isFarcaster && sdk.wallet?.ethProvider) {
        console.log("📱 Using Farcaster wallet for player signal");
        try {
          clientToUse = createWalletClient({
            chain: base,
            transport: custom(sdk.wallet.ethProvider),
          });

          const [addr] = await clientToUse.getAddresses();
          accountToUse = addr;
          console.log("✅ Farcaster account:", accountToUse);
        } catch (err) {
          console.error("❌ Failed to initialize Farcaster wallet:", err);
          if (!walletClient) {
            throw new Error("No wallet available");
          }
        }
      } else if (!walletClient) {
        throw new Error("Please connect your wallet to signal");
      }

      if (!clientToUse || !accountToUse) {
        throw new Error("No wallet connected");
      }

      console.log("👤 Using account:", accountToUse);

      // Create EIP-712 typed data for player signal
      const domain = {
        name: "Pulseers",
        version: "1",
        chainId: base.id, // Base Mainnet
        verifyingContract: "0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640" as `0x${string}`, // Pulseers contract
      };

      const types = {
        PlayerSignal: [
          { name: "player", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "signer", type: "address" },
        ],
      };

      const message = {
        player: playerId,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        signer: accountToUse as `0x${string}`,
      };

      console.log("📤 Requesting typed data signature...");

      // Sign typed data - this creates an on-chain verifiable signature
      const signature = await clientToUse.signTypedData({
        account: accountToUse,
        domain,
        types,
        primaryType: "PlayerSignal",
        message,
      });

      console.log("✅ Player signal signature created!");
      console.log("📝 Signature:", signature);
      console.log("👤 Player:", playerId);
      console.log("⏰ Timestamp:", message.timestamp.toString());

      // Store signature hash as reference
      setHash(signature);
      setIsSuccess(true);
      setIsPending(false);

      // In a real implementation, you would send this signature to your backend
      // to be stored and verified later
      console.log("📊 Signature data:", {
        signature,
        domain,
        message,
        player: playerId,
      });

      return signature;
    } catch (err: any) {
      console.error("❌ Player signal error:", err);
      setError(err);
      setIsPending(false);
      setIsSuccess(false);
      throw err;
    }
  };

  return {
    signal,
    isPending,
    isSuccess,
    error,
    hash,
  };
}
