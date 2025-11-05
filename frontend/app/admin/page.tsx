"use client";

import { useState } from "react";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/add-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminKey,
          limit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to add matches");
      }

      setResult(data);
      setAdminKey(""); // Clear private key after use
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Pulseers Admin Panel
          </h1>
          <p className="text-slate-300">
            Add upcoming football matches to the smart contract
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="adminKey"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Admin Private Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Only contract owner can add matches
              </p>
            </div>

            <div>
              <label
                htmlFor="limit"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Number of Matches
              </label>
              <input
                type="number"
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">
                Maximum 50 matches at once
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding Matches..." : "Add Matches to Contract"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h3 className="text-red-400 font-semibold mb-2">Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h3 className="text-green-400 font-semibold mb-4">
                ✓ Matches Added Successfully!
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Transaction Hash</p>
                  <a
                    href={`https://basescan.org/tx/${result.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-mono break-all"
                  >
                    {result.transactionHash}
                  </a>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    Matches Added ({result.matchesAdded})
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.matches?.map((match: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <p className="text-white font-medium">
                          {match.homeTeam} vs {match.awayTeam}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {match.league} • {match.startTime}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400">
                    Block: {result.receipt?.blockNumber} • Gas:{" "}
                    {result.receipt?.gasUsed}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6 mt-8">
          <h2 className="text-lg font-semibold text-white mb-3">
            How to Use
          </h2>
          <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
            <li>Enter the contract owner&apos;s private key</li>
            <li>Select how many matches to add (default: 10)</li>
            <li>Click &quot;Add Matches to Contract&quot;</li>
            <li>Wait for the transaction to confirm on Base</li>
            <li>Matches will appear on the main page</li>
          </ol>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-300 text-xs">
              ⚠️ <strong>Security Warning:</strong> Never share your private
              key. This page is for admin use only. The private key is cleared
              from memory after use.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
