/**
 * Football API Client (Placeholder)
 *
 * NOTE: The football API provider is not yet decided.
 * This is a placeholder structure that can be easily swapped
 * once the API is chosen (football-data.org, API-Football, TheSportsDB, etc.)
 */

export interface FootballAPIMatch {
  id: number;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  league: {
    name: string;
  };
  startTime: number; // UNIX timestamp
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  score?: {
    home: number;
    away: number;
  };
}

export class FootballAPI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.FOOTBALL_API_KEY || "";
    this.apiUrl = process.env.FOOTBALL_API_URL || "";
  }

  /**
   * Fetch upcoming matches (next 2 weeks)
   * TODO: Implement based on chosen API
   */
  async getUpcomingMatches(): Promise<FootballAPIMatch[]> {
    // Placeholder - return mock data for now
    console.warn("Football API not implemented yet - using mock data");

    const now = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 60 * 60;

    return [
      {
        id: 1001,
        homeTeam: {
          name: "Manchester United",
          logo: "https://crests.football-data.org/66.png",
        },
        awayTeam: {
          name: "Liverpool",
          logo: "https://crests.football-data.org/64.png",
        },
        league: {
          name: "Premier League",
        },
        startTime: now + oneDay,
        status: "SCHEDULED",
      },
      {
        id: 1002,
        homeTeam: {
          name: "Real Madrid",
          logo: "https://crests.football-data.org/86.png",
        },
        awayTeam: {
          name: "Barcelona",
          logo: "https://crests.football-data.org/81.png",
        },
        league: {
          name: "La Liga",
        },
        startTime: now + oneDay * 2,
        status: "SCHEDULED",
      },
      {
        id: 1003,
        homeTeam: {
          name: "Bayern Munich",
          logo: "https://crests.football-data.org/5.png",
        },
        awayTeam: {
          name: "Borussia Dortmund",
          logo: "https://crests.football-data.org/4.png",
        },
        league: {
          name: "Bundesliga",
        },
        startTime: now + oneDay * 3,
        status: "SCHEDULED",
      },
    ];
  }

  /**
   * Fetch live matches
   * TODO: Implement based on chosen API
   */
  async getLiveMatches(): Promise<FootballAPIMatch[]> {
    console.warn("Football API not implemented yet");
    return [];
  }

  /**
   * Fetch specific match result
   * TODO: Implement based on chosen API
   */
  async getMatchResult(matchId: number): Promise<FootballAPIMatch | null> {
    console.warn("Football API not implemented yet");
    return null;
  }

  /**
   * Convert API match format to contract format
   */
  static toContractFormat(match: FootballAPIMatch) {
    return {
      matchId: BigInt(match.id),
      teamA: match.homeTeam.name,
      teamB: match.awayTeam.name,
      league: match.league.name,
      logoA: match.homeTeam.logo,
      logoB: match.awayTeam.logo,
      startTime: BigInt(match.startTime),
    };
  }
}

// Singleton instance
export const footballAPI = new FootballAPI();
