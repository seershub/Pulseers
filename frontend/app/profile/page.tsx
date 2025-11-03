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
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">B</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Basename Coming Soon</p>
                <p className="text-xs text-gray-500">Register your unique .base.eth identity</p>
              </div>
            </div>

            {isInMiniApp && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-purple-700">
                  ✨ You&apos;re using Farcaster! Basename integration will allow you to use your Base identity across the platform.
                </p>
              </div>
            )}

            <button className="btn-secondary w-full" disabled>
              Coming Soon
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
