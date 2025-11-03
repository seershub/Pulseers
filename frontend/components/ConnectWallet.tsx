"use client";

import {
  ConnectWallet as OnchainKitConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";

/**
 * OnchainKit Wallet Component
 * Supports all wallets: Browser wallets (MetaMask, Zerion, etc.),
 * Coinbase Wallet, and Smart Wallet
 */
export function ConnectWallet() {
  return (
    <Wallet>
      <OnchainKitConnectWallet className="btn-primary" />
      <WalletDropdown>
        <Identity className="px-4 py-2 hover:bg-blue-50">
          <Avatar className="w-8 h-8" />
          <Name />
          <Address />
        </Identity>
        <WalletDropdownDisconnect className="hover:bg-red-50 text-red-600" />
      </WalletDropdown>
    </Wallet>
  );
}
