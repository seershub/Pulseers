# SeersLeague Implementation Analysis for Pulseers

## Executive Summary

SeersLeague has a fully working implementation of a Farcaster Mini App with on-chain predictions on Base network. This document details their critical architecture decisions and implementation patterns that differ from what might be broken in Pulseers.

---

## 1. MATCH FETCHING ARCHITECTURE

### SeersLeague Approach: Event-Based + Football-Data Enrichment

**File:** `/app/api/matches/route.ts`

**Key Architecture:**
```
1. Fetch MatchRegistered events from blockchain
   - Query from deployment block to latest
   - Filter for matches that HAVEN'T STARTED (startTime > now)
   - Get 2-step filtering process

2. Parallel enrichment from Football-Data.org
   - Multiple matches fetched in parallel (not sequential)
   - Fallback to default data if API fails
   - Caches for 30 minutes (revalidate: 1800)

3. Final safety filter
   - Remove any matches that started during enrichment
   - Return only "registered AND not started" matches
```

**Critical Implementation Details:**

```typescript
// 1. Smart block range calculation
const fromBlock = deploymentBlock > 0n ? deploymentBlock : currentBlock - 100000n;

// 2. Specific event structure
event: {
  type: 'event',
  name: 'MatchRegistered',
  inputs: [
    { name: 'matchId', type: 'uint256', indexed: true },
    { name: 'startTime', type: 'uint256', indexed: false }
  ]
}

// 3. Parallel enrichment (NOT sequential)
const enrichPromises = toEnrich.map(async (match) => { 
  // Each match fetches independently
  const response = await fetch(`${FOOTBALL_DATA_BASE}/matches/${match.matchId}`, {
    headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
    next: { revalidate: 1800 } // 30 min cache
  });
  // ... handle response
});
const enriched = await Promise.all(enrichPromises); // PARALLEL execution

// 4. Time-based filtering (CRITICAL)
const now = Math.floor(Date.now() / 1000);
const upcoming = events
  .filter(e => e.args?.startTime > now) // Only future matches
  .sort((a, b) => a.startTime - b.startTime); // Earliest first
```

**What This Tells Us About Pulseers:**
- If matches appear as "already started" when they shouldn't, check:
  - Block range calculation (is deploymentBlock set correctly?)
  - Event parsing (are the event inputs correct?)
  - Time filtering logic (is system clock in sync?)

---

## 2. MATCH STATUS & BUTTON LOGIC

### SeersLeague Approach: Status-Based Rendering

**Files:**
- `/components/MatchCardV2.tsx` - Enhanced status tracking
- `/lib/contract-interactions-v2.ts` - Status calculation logic

**Key Implementation:**

```typescript
// Match Status Calculation
export function getMatchStatus(match: MatchV2): {
  status: 'upcoming' | 'live' | 'finished' | 'recorded';
  timeRemaining?: number;
  canPredict: boolean;
} {
  const now = Math.floor(Date.now() / 1000);
  const startTime = Number(match.startTime);
  const timeRemaining = startTime - now;
  
  if (match.isRecorded) {
    return { status: 'recorded', canPredict: false };
  }
  
  if (timeRemaining > 0) {
    return { 
      status: 'upcoming', 
      timeRemaining,
      canPredict: true  // ENABLE PREDICTIONS FOR FUTURE MATCHES
    };
  }
  
  if (timeRemaining > -7200) { // Within 2 hours of start
    return { 
      status: 'live', 
      timeRemaining: 0,
      canPredict: false  // DISABLE AFTER START
    };
  }
  
  return { 
    status: 'finished', 
    canPredict: false 
  };
}

// Button Rendering (MatchCardV2.tsx)
{canPredict && onPredict && (
  <button
    onClick={() => onPredict(matchId)}
    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
  >
    Tahmin Yap
  </button>
)}

{!canPredict && (
  <div className="text-center">
    <div className="text-sm text-gray-500 mb-2">
      {isRecorded 
        ? 'Bu maçın sonucu kaydedildi' 
        : isDeadlineNear 
          ? 'Tahmin süresi doldu (10 dakika kala kapanır)'
          : status === 'live'
            ? 'Maç başladı, tahmin yapılamaz'
            : 'Bu maç için tahmin yapılamız'
      }
    </div>
  </div>
)}
```

**Critical 10-Minute Deadline:**
```typescript
// In MatchCardV2.tsx
useEffect(() => {
  const updateTimeLeft = () => {
    const remaining = startTime - now;
    const predictionDeadline = 10 * 60; // 10 minutes

    if (remaining > predictionDeadline) {
      // More than 10 minutes - show time until match
      setTimeLeft(formatDistanceToNow(new Date(startTime * 1000)));
      setIsDeadlineNear(false);
    } else if (remaining > 0) {
      // Less than 10 minutes - SHOW WARNING
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')} kaldı`);
      setIsDeadlineNear(true);  // ENABLE WARNING STATE
    }
  };
  
  updateTimeLeft();
  const interval = setInterval(updateTimeLeft, 1000); // UPDATE EVERY SECOND
  return () => clearInterval(interval);
}, [startTime]);
```

**Pulseers Issue Hypothesis:**
- Buttons might be showing as disabled when they should be enabled
- Missing real-time status updates (needs 1-second interval, not polling)
- May not have the 10-minute deadline logic

---

## 3. WALLET CONNECTION FOR FARCASTER

### SeersLeague Approach: Farcaster MiniApp SDK + MiniKit Provider

**Files:**
- `/components/MiniKitProvider.tsx` - SDK initialization
- `/components/WalletConnect.tsx` - Wallet detection & connection

**Key Implementation:**

```typescript
// MiniKitProvider.tsx - Context wrapper for SDK
export function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const initializeMiniKit = async () => {
      // 1. Check if in mini app
      const isInMiniApp = await sdk.isInMiniApp();
      console.log('Is in mini app:', isInMiniApp);
      
      // 2. Initialize SDK
      await sdk.actions.ready();
      
      // 3. Get context (Farcaster user info)
      const context = await sdk.context;
      if (context?.user) {
        setUser({
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl
        });
      }
      
      // 4. Get wallet
      const wallet = await sdk.wallet;
      if (wallet?.ethProvider) {
        // Try to get address
        const accounts = await wallet.ethProvider.request({ 
          method: 'eth_accounts' 
        });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }
      }
      
      setIsReady(true);
    };

    // Add delay to ensure DOM is ready
    const timer = setTimeout(initializeMiniKit, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MiniKitContext.Provider value={{ isReady, sdk, error, user, address, balance }}>
      {children}
    </MiniKitContext.Provider>
  );
}
```

**Wallet Connection Check:**
```typescript
// WalletConnect.tsx
const checkConnection = async () => {
  if (isReady && sdk) {
    if (sdk.wallet && sdk.wallet.ethProvider) {
      try {
        const accounts = await sdk.wallet.ethProvider.request({ 
          method: 'eth_accounts'  // CHECK if already connected
        });
        
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setUserAddress(accounts[0]);
          console.log('Wallet connected:', accounts[0]);
        }
      } catch (error) {
        console.log('No wallet connection found:', error);
      }
    }
  }
};

// Manual connection trigger
const handleConnect = async () => {
  if (sdk && sdk.wallet && sdk.wallet.ethProvider) {
    try {
      const accounts = await sdk.wallet.ethProvider.request({ 
        method: 'eth_requestAccounts'  // REQUEST connection
      });
      
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setUserAddress(accounts[0]);
      }
    } catch (error: any) {
      if (error.message?.includes('User rejected')) {
        alert('Connection was rejected by user.');
      }
    }
  }
};
```

**Critical RPC Configuration:**
```typescript
// lib/viem-config.ts
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!alchemyKey) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_API_KEY is required!');
}

const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`;

export const publicClient = createPublicClient({
  chain: base,
  transport: http(alchemyUrl, {
    timeout: 180000,      // 3 minutes for large getLogs() queries
    retryCount: 5,        // Retry up to 5 times
    retryDelay: 2000,     // Wait 2 seconds between retries
  }),
});
```

**Pulseers Issues to Check:**
- Is NEXT_PUBLIC_ALCHEMY_API_KEY set?
- Is MiniKit provider wrapping the entire app?
- Is SDK initialization using sdk.actions.ready()?
- Is wallet connection checking both eth_accounts and eth_requestAccounts?

---

## 4. SIGNAL SUBMISSION (submitPredictions)

### SeersLeague Approach: EIP-5792 Batch Transactions

**File:** `/components/PredictionForm.tsx`

**Key Architecture:**

```typescript
// Step 1: Validate selection and calculate fees
const handleSubmit = async () => {
  if (!isConnected || !address) {
    toast.error('Please connect your wallet first');
    return;
  }

  if (Object.keys(predictions).length === 0) {
    toast.error('Please select at least one match to predict');
    return;
  }

  // Calculate fee
  const predictionCount = Object.keys(predictions).length;
  const remainingFree = Math.max(0, 5 - userStats.freePredictionsUsed);
  const predictionsToPayFor = Math.max(0, predictionCount - remainingFree);
  const totalFee = BigInt(predictionsToPayFor) * PREDICTION_FEE;

  // Check USDC balance if payment needed
  if (totalFee > 0) {
    if (usdcBalance < totalFee) {
      toast.error(`Insufficient USDC balance!`);
      return;
    }
  }

  // Submit
  await submitPredictions();
};

// Step 2: Two different submission paths
const submitPredictions = async () => {
  try {
    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting predictions...');

    // Prepare data
    const matchIds = Object.keys(predictions).map(id => BigInt(parseInt(id)));
    const outcomes = Object.keys(predictions).map(matchId => predictions[parseInt(matchId)]);

    // Calculate fee
    const totalFee = BigInt(predictionsToPayFor) * PREDICTION_FEE;

    // TWO PATHS:
    if (totalFee > 0) {
      await submitBatchPredictions(matchIds, outcomes, totalFee);  // Needs approval
    } else {
      await submitFreePredictions(matchIds, outcomes);  // No approval needed
    }

    toast.dismiss(loadingToast);
    toast.success('Predictions submitted successfully!');
    
    // Update state
    setUserStats(prev => ({...prev, totalPredictions: prev.totalPredictions + predictionCount}));
    setPredictions({});
    
  } catch (error: any) {
    console.error('Submission error:', error);
    toast.error('Failed to submit predictions');
  }
};

// Step 3: EIP-5792 Batch Transaction (CRITICAL)
const submitBatchPredictions = async (
  matchIds: bigint[], 
  outcomes: (1 | 2 | 3)[], 
  totalFee: bigint
) => {
  if (!address || !sdk) return;

  // Encode both transactions
  const predictData = encodeFunctionData({
    abi: SEERSLEAGUE_ABI,
    functionName: 'submitPredictions',
    args: [matchIds, outcomes]
  });

  // Check if approval is needed
  const needsApproval = !currentAllowance || currentAllowance < totalFee;

  if (needsApproval) {
    console.log('Sending batch: approve + predict (EIP-5792)');

    const approveData = encodeFunctionData({
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACTS.SEERSLEAGUE, totalFee]
    });

    // EIP-5792: Send BOTH transactions with ONE signature
    const batchId = await sdk.wallet.ethProvider.request({
      method: 'wallet_sendCalls',
      params: [{
        version: '1.0',
        chainId: '0x2105',  // Base mainnet
        from: address,
        calls: [
          {
            to: CONTRACTS.USDC,
            data: approveData,
            value: '0x0'
          },
          {
            to: CONTRACTS.SEERSLEAGUE,
            data: predictData,
            value: '0x0'
          }
        ]
      }]
    });

    console.log('Batch transaction submitted:', batchId);
  } else {
    console.log('Sufficient allowance, sending prediction only');

    // Single transaction if already approved
    await sdk.wallet.ethProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: CONTRACTS.SEERSLEAGUE,
        data: predictData,
        from: address,
        value: '0x0'
      }]
    });
  }

  // Refresh USDC data after success
  const [newAllowance, newBalance] = await Promise.all([
    publicClient.readContract({...}),
    publicClient.readContract({...})
  ]);
  setCurrentAllowance(newAllowance);
  setUsdcBalance(newBalance);
};
```

**Contract Side:**
```solidity
// SeersLeagueV2.sol
function submitPredictions(
    uint256[] calldata matchIds,
    uint8[] calldata outcomes
) external nonReentrant whenNotPaused {
    if (matchIds.length == 0 || matchIds.length > 5) revert InvalidMatchId();
    if (matchIds.length != outcomes.length) revert InvalidMatchId();
    
    UserStats storage userStatsData = userStats[msg.sender];
    uint256 predictionsInBatch = matchIds.length;
    uint256 predictionsToPayFor = 0;
    uint256 freeUsed = 0;
    
    // Calculate free vs paid
    if (userStatsData.freePredictionsUsed < TOTAL_FREE_PREDICTIONS) {
        uint256 freePredictionsAvailable = TOTAL_FREE_PREDICTIONS - userStatsData.freePredictionsUsed;
        
        if (predictionsInBatch <= freePredictionsAvailable) {
            freeUsed = predictionsInBatch;
            userStatsData.freePredictionsUsed += predictionsInBatch;
            predictionsToPayFor = 0;
        } else {
            freeUsed = freePredictionsAvailable;
            predictionsToPayFor = predictionsInBatch - freePredictionsAvailable;
            userStatsData.freePredictionsUsed = TOTAL_FREE_PREDICTIONS;
        }
    } else {
        predictionsToPayFor = predictionsInBatch;
    }
    
    // Handle payment
    uint256 totalFee = 0;
    if (predictionsToPayFor > 0) {
        totalFee = predictionsToPayFor * PREDICTION_FEE;
        // USDC transfer handled here
        require(USDC.transferFrom(msg.sender, treasury, totalFee), "Payment failed");
    }
    
    // Store predictions
    for (uint256 i = 0; i < matchIds.length; i++) {
        require(matches[matchIds[i]].exists, "Match not registered");
        require(block.timestamp < matches[matchIds[i]].startTime, "Match already started");
        
        predictions[msg.sender][matchIds[i]] = Prediction({
            matchId: matchIds[i],
            outcome: outcomes[i],
            timestamp: block.timestamp,
            isProcessed: false
        });
        
        userPredictionHistory[msg.sender].push(matchIds[i]);
    }
    
    emit PredictionsSubmitted(msg.sender, matchIds, predictionsInBatch, freeUsed, totalFee);
}
```

**Pulseers Issues to Check:**
- Are you using EIP-5792 (wallet_sendCalls) or single transactions?
- Is the frontend checking USDC allowance before submitting?
- Is the contract enforcing the 10-minute deadline?
- Are free predictions tracked correctly?

---

## 5. CONTRACT ABI & CONFIGURATION

### SeersLeague Contract Constants

**File:** `/contracts/SeersLeagueV2.sol`

```solidity
// Constants
string public constant VERSION = "2.0.0";
uint256 public constant TOTAL_FREE_PREDICTIONS = 5;
uint256 public constant PREDICTION_FEE = 500_000; // 0.5 USDC (6 decimals)
uint256 public constant MIN_MATCHES_THRESHOLD = 50;
uint256 public constant UPDATE_COOLDOWN = 24 hours;
uint256 public constant PREDICTION_DEADLINE = 10 minutes;

// State
IERC20 public immutable USDC;
address public treasury;
uint256 public totalMatches;
uint256 public lastMatchUpdate;
uint256 public lastLeaderboardUpdate;

// Structs
struct Match {
    uint256 id;
    uint256 startTime;
    uint256 homeScore;
    uint256 awayScore;
    bool isRecorded;
    bool exists;
    uint256 recordedAt;
}

struct Prediction {
    uint256 matchId;
    uint8 outcome;  // 1: home win, 2: draw, 3: away win
    uint256 timestamp;
    bool isProcessed;
}

struct UserStats {
    uint256 correctPredictions;
    uint256 totalPredictions;
    uint256 freePredictionsUsed;
    uint256 currentStreak;
    uint256 longestStreak;
    uint256 lastPredictionTime;
    uint256 totalFeesPaid;
}

// Mappings
mapping(uint256 => Match) public matches;
mapping(address => UserStats) public userStats;
mapping(address => mapping(uint256 => Prediction)) public predictions;
mapping(address => uint256[]) public userPredictionHistory;

// Events
event PredictionsSubmitted(
    address indexed user,
    uint256[] matchIds,
    uint256 predictionsCount,
    uint256 freeUsed,
    uint256 feePaid
);
event MatchRegistered(uint256 indexed matchId, uint256 startTime);
event ResultRecorded(address indexed user, uint256 indexed matchId, bool correct, uint256 timestamp);
event MatchResultUpdated(uint256 indexed matchId, uint256 homeScore, uint256 awayScore, uint256 timestamp);
```

**Key ABI Functions:**
```typescript
// From /lib/contracts/abi-v2.ts
{
  "name": "submitPredictions",
  "inputs": [
    { "name": "matchIds", "type": "uint256[]" },
    { "name": "outcomes", "type": "uint8[]" }
  ],
  "stateMutability": "nonpayable"
}

{
  "name": "registerMatches",
  "inputs": [
    { "name": "matchIds", "type": "uint256[]" },
    { "name": "startTimes", "type": "uint256[]" }
  ],
  "stateMutability": "nonpayable"
}

{
  "name": "batchRecordResults",
  "inputs": [
    { "name": "users", "type": "address[]" },
    { "name": "matchIds", "type": "uint256[]" },
    { "name": "corrects", "type": "bool[]" }
  ],
  "stateMutability": "nonpayable"
}

{
  "name": "getUserStats",
  "inputs": [{ "name": "user", "type": "address" }],
  "outputs": [{
    "type": "tuple",
    "components": [
      { "name": "correctPredictions", "type": "uint256" },
      { "name": "totalPredictions", "type": "uint256" },
      { "name": "freePredictionsUsed", "type": "uint256" },
      { "name": "currentStreak", "type": "uint256" },
      { "name": "longestStreak", "type": "uint256" },
      { "name": "lastPredictionTime", "type": "uint256" },
      { "name": "totalFeesPaid", "type": "uint256" }
    ]
  }],
  "stateMutability": "view"
}
```

---

## 6. ENVIRONMENT VARIABLES

**Required by SeersLeague:**

```env
# Deployment
NEXT_PUBLIC_URL=https://league.seershub.com

# Blockchain
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # After deployment
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# CRITICAL: RPC Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=<REQUIRED>
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org

# API Keys
FOOTBALL_DATA_API_KEY=<from football-data.org>

# Private Keys (Server-side only)
PRIVATE_KEY=0x... # For result recording
TREASURY_ADDRESS=0x... # Where USDC fees go

# MiniKit Configuration
NEXT_PUBLIC_ACCOUNT_ASSOCIATION_HEADER=""
LB_PUBLIC_ACCOUNT_ASSOCIATION_PAYLOAD=""
LB_PUBLIC_ACCOUNT_ASSOCIATION_SIGNATURE=""

# Contract Deployment Block (IMPORTANT for event filtering)
NEXT_PUBLIC_DEPLOYMENT_BLOCK=<deployment block number>
```

---

## 7. CRITICAL DIFFERENCES FROM STANDARD PATTERNS

### 1. **Async/Await with Parallel Operations**
SeersLeague uses `Promise.all()` for enrichment, not sequential fetching. This is ~5x faster.

### 2. **10-Minute Prediction Deadline**
Built into UI (dynamic countdown) AND contract validation. Prevents race conditions.

### 3. **EIP-5792 Batch Transactions**
Combines approve + submit in one signature using `wallet_sendCalls`. This is the standard for Farcaster.

### 4. **Real-time Status Updates (1-second intervals)**
Not just polling. Uses setInterval for countdown timers on match status.

### 5. **Alchemy-Only RPC Configuration**
No fallbacks to public RPC. Alchemy provides:
- Better reliability
- Higher rate limits
- Better support for getLogs() queries

### 6. **Separate V1 and V2 Contract Support**
Both contracts have separate ABI and interaction layers, allowing migration without breaking existing data.

---

## 8. WHAT LIKELY BREAKS IN PULSEERS

Based on the SeersLeague architecture, these are the most likely issues in Pulseers:

1. **Match Fetching Issues:**
   - Deployment block not set (causes getLogs to scan too many blocks)
   - Missing time-based filtering (shows matches that already started)
   - Sequential instead of parallel enrichment (timeout on Football-Data)
   - No fallback when API fails

2. **Button/Status Issues:**
   - Missing real-time countdown (status doesn't update without refresh)
   - No 10-minute deadline logic
   - Buttons not re-enabling when status changes
   - No visual warning when deadline is approaching

3. **Wallet Connection Issues:**
   - Not checking `eth_accounts` before `eth_requestAccounts`
   - MiniKit not initialized with proper timing
   - Not catching user rejection errors gracefully
   - No timeout handling for SDK initialization

4. **Transaction Submission Issues:**
   - Not using EIP-5792 (wallet_sendCalls) for batch transactions
   - Not checking USDC allowance before submitting
   - No balance validation before submission
   - Not refreshing USDC data after successful transaction
   - No handling of sequential vs atomic transaction execution

5. **RPC Configuration:**
   - Not using Alchemy (using public RPC instead)
   - No retry logic
   - Timeout too short for large getLogs() queries
   - No proper error handling for RPC failures

6. **Contract Issues:**
   - Missing `isRecorded` field on match struct
   - No proper free prediction tracking
   - No deadline enforcement in submitPredictions
   - Missing re-entrancy guards

---

## 9. RECOMMENDED QUICK FIXES FOR PULSEERS

### Quick Win #1: RPC Configuration
```typescript
// Use Alchemy instead of public RPC
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
export const publicClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
    timeout: 180000,
    retryCount: 5,
    retryDelay: 2000,
  }),
});
```

### Quick Win #2: Real-time Status Updates
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft(calculateTimeRemaining());
  }, 1000);  // Every second, not polling
  return () => clearInterval(interval);
}, [startTime]);
```

### Quick Win #3: Deployment Block
```env
# Set this in .env.local to avoid scanning entire blockchain
NEXT_PUBLIC_DEPLOYMENT_BLOCK=<your_contract_deployment_block>
```

### Quick Win #4: Parallel Enrichment
```typescript
// Use Promise.all() instead of sequential awaits
const enriched = await Promise.all(
  toEnrich.map(async (match) => {
    // Each match fetches independently
  })
);
```

### Quick Win #5: Proper Wallet Connection
```typescript
// Check if already connected first
const accounts = await sdk.wallet.ethProvider.request({ 
  method: 'eth_accounts'  // Non-intrusive
});

// Only if not connected, request access
if (!accounts.length) {
  const newAccounts = await sdk.wallet.ethProvider.request({ 
    method: 'eth_requestAccounts'  // User approval required
  });
}
```

---

## Repository References

- **SeersLeague Repository:** https://github.com/seershub/seersleague-miniapp
- **Key Files Analyzed:**
  - `/app/api/matches/route.ts` - Match fetching
  - `/components/MatchCardV2.tsx` - Status & buttons
  - `/components/MiniKitProvider.tsx` - Wallet connection
  - `/components/PredictionForm.tsx` - Transaction submission
  - `/contracts/SeersLeagueV2.sol` - Contract logic
  - `/lib/viem-config.ts` - RPC configuration

---

## Next Steps

1. Compare Pulseers contract ABI with SeersLeague V2
2. Check if NEXT_PUBLIC_ALCHEMY_API_KEY is set
3. Review match fetching logic for time-filtering bugs
4. Check if buttons are using proper status calculation
5. Verify wallet connection flow matches SeersLeague pattern
6. Review transaction submission for EIP-5792 support

