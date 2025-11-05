/**
 * Football Data API Client
 * API: https://www.football-data.org/
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

interface FootballDataAPIResponse {
  matches: Array<{
    id: number;
    utcDate: string;
    status: string;
    homeTeam: {
      name: string;
      crest: string;
    };
    awayTeam: {
      name: string;
      crest: string;
    };
    competition: {
      name: string;
    };
    score: {
      fullTime: {
        home: number | null;
        away: number | null;
      };
    };
  }>;
}

export class FootballAPI {
  private apiKey: string;
  private apiUrl = "https://api.football-data.org/v4";

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || "";
  }

  /**
   * Fetch upcoming matches (next 2 weeks)
   */
  async getUpcomingMatches(): Promise<FootballAPIMatch[]> {
    if (!this.apiKey) {
      console.warn("Football API key not found - using mock data");
      return this.getMockMatches();
    }

    try {
      // Get today and 14 days from now
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);

      const dateFrom = today.toISOString().split("T")[0];
      const dateTo = futureDate.toISOString().split("T")[0];

      // Fetch matches from top European leagues
      const competitions = [
        "PL", // Premier League
        "PD", // La Liga
        "BL1", // Bundesliga
        "SA", // Serie A
        "FL1", // Ligue 1
        "CL", // Champions League
      ];

      const allMatches: FootballAPIMatch[] = [];

      for (const competition of competitions) {
        try {
          const response = await fetch(
            `${this.apiUrl}/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            {
              headers: {
                "X-Auth-Token": this.apiKey,
              },
            }
          );

          if (!response.ok) {
            console.error(
              `Failed to fetch ${competition} matches:`,
              response.status
            );
            continue;
          }

          const data: FootballDataAPIResponse = await response.json();
          const matches = this.transformMatches(data.matches);
          allMatches.push(...matches);
        } catch (error) {
          console.error(`Error fetching ${competition}:`, error);
        }
      }

      // Sort by start time
      allMatches.sort((a, b) => a.startTime - b.startTime);

      // Return first 20 matches
      return allMatches.slice(0, 20);
    } catch (error) {
      console.error("Error fetching matches:", error);
      return this.getMockMatches();
    }
  }

  /**
   * Fetch live matches
   */
  async getLiveMatches(): Promise<FootballAPIMatch[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.apiUrl}/matches`, {
        headers: {
          "X-Auth-Token": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: FootballDataAPIResponse = await response.json();
      const liveMatches = data.matches.filter(
        (match) =>
          match.status === "IN_PLAY" ||
          match.status === "PAUSED" ||
          match.status === "LIVE"
      );

      return this.transformMatches(liveMatches);
    } catch (error) {
      console.error("Error fetching live matches:", error);
      return [];
    }
  }

  /**
   * Fetch specific match result
   */
  async getMatchResult(matchId: number): Promise<FootballAPIMatch | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/matches/${matchId}`, {
        headers: {
          "X-Auth-Token": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const matches = this.transformMatches([data]);
      return matches[0] || null;
    } catch (error) {
      console.error("Error fetching match result:", error);
      return null;
    }
  }

  /**
   * Transform API matches to our format
   */
  private transformMatches(
    matches: FootballDataAPIResponse["matches"]
  ): FootballAPIMatch[] {
    return matches.map((match) => ({
      id: match.id,
      homeTeam: {
        name: match.homeTeam.name,
        logo: match.homeTeam.crest,
      },
      awayTeam: {
        name: match.awayTeam.name,
        logo: match.awayTeam.crest,
      },
      league: {
        name: match.competition.name,
      },
      startTime: Math.floor(new Date(match.utcDate).getTime() / 1000),
      status: this.mapStatus(match.status),
      score:
        match.score?.fullTime?.home !== null &&
        match.score?.fullTime?.away !== null
          ? {
              home: match.score!.fullTime.home,
              away: match.score!.fullTime.away,
            }
          : undefined,
    }));
  }

  /**
   * Map API status to our status
   */
  private mapStatus(
    apiStatus: string
  ): "SCHEDULED" | "LIVE" | "FINISHED" {
    switch (apiStatus) {
      case "SCHEDULED":
      case "TIMED":
        return "SCHEDULED";
      case "IN_PLAY":
      case "PAUSED":
      case "LIVE":
        return "LIVE";
      case "FINISHED":
      case "AWARDED":
      case "POSTPONED":
      case "CANCELLED":
      case "SUSPENDED":
        return "FINISHED";
      default:
        return "SCHEDULED";
    }
  }

  /**
   * Get mock matches (fallback)
   */
  private getMockMatches(): FootballAPIMatch[] {
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
