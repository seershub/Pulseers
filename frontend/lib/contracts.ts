/**
 * Smart Contract Configuration
 * Contains ABIs, addresses, and types for Pulseers contract
 */

export const PULSEERS_ADDRESS =
  (process.env.NEXT_PUBLIC_PULSEERS_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || "84532"
);

// Pulseers Contract ABI
export const PULSEERS_ABI = [
  {
    inputs: [
      { internalType: "uint256[]", name: "_matchIds", type: "uint256[]" },
      { internalType: "string[]", name: "_teamAs", type: "string[]" },
      { internalType: "string[]", name: "_teamBs", type: "string[]" },
      { internalType: "string[]", name: "_leagues", type: "string[]" },
      { internalType: "string[]", name: "_logoAs", type: "string[]" },
      { internalType: "string[]", name: "_logoBs", type: "string[]" },
      { internalType: "uint256[]", name: "_startTimes", type: "uint256[]" },
    ],
    name: "addMatches",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }],
    name: "deactivateMatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_matchId", type: "uint256" },
      { internalType: "uint8", name: "_teamId", type: "uint8" },
    ],
    name: "signal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllMatchIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "_matchIds", type: "uint256[]" }],
    name: "getMatches",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "matchId", type: "uint256" },
          { internalType: "string", name: "teamA", type: "string" },
          { internalType: "string", name: "teamB", type: "string" },
          { internalType: "string", name: "league", type: "string" },
          { internalType: "string", name: "logoA", type: "string" },
          { internalType: "string", name: "logoB", type: "string" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "signalsTeamA", type: "uint256" },
          { internalType: "uint256", name: "signalsTeamB", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct IPulseers.Match[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }],
    name: "getMatch",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "matchId", type: "uint256" },
          { internalType: "string", name: "teamA", type: "string" },
          { internalType: "string", name: "teamB", type: "string" },
          { internalType: "string", name: "league", type: "string" },
          { internalType: "string", name: "logoA", type: "string" },
          { internalType: "string", name: "logoB", type: "string" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "signalsTeamA", type: "uint256" },
          { internalType: "uint256", name: "signalsTeamB", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct IPulseers.Match",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_matchId", type: "uint256" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "hasUserSignaled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_matchId", type: "uint256" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "getUserTeamChoice",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }],
    name: "getSignalPercentages",
    outputs: [
      { internalType: "uint256", name: "percentageA", type: "uint256" },
      { internalType: "uint256", name: "percentageB", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStats",
    outputs: [
      { internalType: "uint256", name: "totalMatches", type: "uint256" },
      { internalType: "uint256", name: "activeMatches", type: "uint256" },
      { internalType: "uint256", name: "totalSignals", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "matchIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "MatchesAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "matchId",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint8", name: "teamId", type: "uint8" },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "SignalAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "matchId",
        type: "uint256",
      },
    ],
    name: "MatchDeactivated",
    type: "event",
  },
] as const;

// TypeScript types for contract data
export interface Match {
  matchId: bigint;
  teamA: string;
  teamB: string;
  league: string;
  logoA: string;
  logoB: string;
  startTime: bigint;
  signalsTeamA: bigint;
  signalsTeamB: bigint;
  isActive: boolean;
}

export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED";

export interface MatchWithStatus extends Match {
  status: MatchStatus;
  percentageA: number;
  percentageB: number;
}
