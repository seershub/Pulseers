"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Target, Award, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { getFarcasterUser, isInFarcasterMiniApp } from "@/lib/farcaster-sdk";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    async function loadFarcasterData() {
      const inMiniApp = await isInFarcasterMiniApp();
      setIsInMiniApp(inMiniApp);

      if (inMiniApp) {
        const user = await getFarcasterUser();
        setFarcasterUser(user);
        console.log("📱 Farcaster user data:", user);
      }
    }

    loadFarcasterData();
  }, []);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            {farcasterUser?.pfpUrl ? (
              <img
                src={farcasterUser.pfpUrl}
                alt={farcasterUser.displayName || "Profile"}
                className="w-24 h-24 rounded-full shadow-xl border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {address ? address.slice(2, 4).toUpperCase() : <UserIcon className="w-12 h-12" />}
              </div>
            )}

            <div className="flex-1 text-center md:text-left">
              {/* Display Name or "Your Profile" */}
              <h1 className="text-3xl font-black gradient-text mb-2">
                {farcasterUser?.displayName || "Your Profile"}
              </h1>

              {/* Username if available */}
              {farcasterUser?.username && (
                <p className="text-lg text-blue-600 font-semibold mb-1">
                  @{farcasterUser.username}
                </p>
              )}

              {/* FID if in Mini App */}
              {farcasterUser?.fid && (
                <p className="text-sm text-gray-500 mb-2">
                  FID: {farcasterUser.fid}
                </p>
              )}

              {/* Wallet Address */}
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
                {isInMiniApp && (
                  <div className="badge bg-purple-100 text-purple-700 border border-purple-200">
                    <span className="font-bold">FC</span>
                    Farcaster User
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black gradient-text mb-1">0</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Signals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black gradient-text mb-1">0</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Wins</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black gradient-text mb-1">0%</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Accuracy</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black gradient-text mb-1">--</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Rank</div>
          </motion.div>
        </div>

        {/* Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8"
        >
          <h2 className="text-2xl font-black gradient-text mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Recent Activity
          </h2>

          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-blue-300" />
            </div>
            <p className="text-gray-600 font-semibold mb-2">No signals yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Start signaling for your favorite teams to build your stats
            </p>
            <a href="/" className="btn-primary inline-flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              View Matches
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
