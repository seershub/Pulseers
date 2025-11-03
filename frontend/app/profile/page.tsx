"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
              {address && address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black gradient-text mb-2">Your Profile</h1>
              <p className="text-gray-600 font-mono text-sm">{address}</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="badge badge-primary">
                  <Trophy className="w-3 h-3" />
                  Active Signaler
                </div>
                <div className="badge bg-green-100 text-green-700 border border-green-200">
                  <Target className="w-3 h-3" />
                  Base Network
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stats-card">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-4xl font-black text-blue-600 mb-1">0</div>
            <div className="text-sm text-gray-600 font-semibold">Total Signals</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stats-card">
            <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-4xl font-black text-blue-600 mb-1">0</div>
            <div className="text-sm text-gray-600 font-semibold">Matches</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stats-card">
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-4xl font-black text-blue-600 mb-1">0%</div>
            <div className="text-sm text-gray-600 font-semibold">Accuracy</div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-black gradient-text mb-4">Basename Integration</h2>
          <p className="text-gray-600 mb-4">
            Connect your Base name to personalize your profile and compete in leaderboards.
          </p>
          <button className="btn-secondary">Coming Soon</button>
        </motion.div>
      </div>
    </div>
  );
}
