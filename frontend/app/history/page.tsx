"use client";

import { useWallet } from "@/hooks/useWallet";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { History, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { address, isConnected, isChecking } = useWallet();
  const router = useRouter();

  // In Farcaster/BaseApp, show page immediately even if address is still loading
  // Only show loading in browser if no wallet is connected
  const showLoading = isChecking && !isConnected;
  
  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
            Signal History
          </h1>
          <p className="text-gray-600 text-lg">
            Track your past signals and match outcomes
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="glass-card rounded-3xl p-12 text-center shadow-xl border border-blue-100/50 bg-gradient-to-br from-white to-blue-50/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">No Signals Yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start signaling for matches to see your history here. Your signals will be recorded on-chain!
          </p>
          <button onClick={() => router.push("/")} className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Browse Matches
          </button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
