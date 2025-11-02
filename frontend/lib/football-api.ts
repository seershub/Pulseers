/**
 * Football Data API Client
 * https://www.football-data.org/documentation/quickstart
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

interface FootballDataMatch {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    crest: string;
  };
  competition: {
    id: number;
    name: string;
    emblem: string;
  };
  utcDate: string;
  status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "SUSPENDED" | "CANCELLED";
  score?: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
}

export class FootballAPI {
  private apiKey: string;
  private baseUrl = "https://api.football-data.org/v4";

  constructor() {
    this.apiKey = process.env.FOOTBALL_DATA_API_KEY || "";
  }

  private async fetch(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "X-Auth-Token": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch upcoming matches (next 14 days)
   */
  async getUpcomingMatches(): Promise<FootballAPIMatch[]> {
    try {
      const today = new Date();
      const twoWeeks = new Date(today);
      twoWeeks.setDate(twoWeeks.getDate() + 14);

      const dateFrom = today.toISOString().split("T")[0];
      const dateTo = twoWeeks.toISOString().split("T")[0];

      const data = await this.fetch(
        `/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`
      );

      return this.transformMatches(data.matches || []);
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      return [];
    }
  }

  /**
   * Fetch live matches
   */
  async getLiveMatches(): Promise<FootballAPIMatch[]> {
    try {
      const data = await this.fetch("/matches?status=IN_PLAY");
      return this.transformMatches(data.matches || []);
    } catch (error) {
      console.error("Error fetching live matches:", error);
      return [];
    }
  }

  /**
   * Fetch finished matches (last 7 days)
   */
  async getFinishedMatches(): Promise<FootballAPIMatch[]> {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const dateFrom = weekAgo.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];

      const data = await this.fetch(
        `/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=FINISHED`
      );

      return this.transformMatches(data.matches || []);
    } catch (error) {
      console.error("Error fetching finished matches:", error);
      return [];
    }
  }

  /**
   * Fetch specific match result
   */
  async getMatchResult(matchId: number): Promise<FootballAPIMatch | null> {
    try {
      const data = await this.fetch(`/matches/${matchId}`);
      const transformed = this.transformMatches([data]);
      return transformed[0] || null;
    } catch (error) {
      console.error("Error fetching match result:", error);
      return null;
    }
  }

  /**
   * Transform Football Data API format to our format
   */
  private transformMatches(matches: FootballDataMatch[]): FootballAPIMatch[] {
    return matches.map((match) => ({
      id: match.id,
      homeTeam: {
        name: match.homeTeam.name,
        logo: match.homeTeam.crest || "",
      },
      awayTeam: {
        name: match.awayTeam.name,
        logo: match.awayTeam.crest || "",
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
              home: match.score.fullTime.home,
              away: match.score.fullTime.away,
            }
          : undefined,
    }));
  }

  /**
   * Map Football Data status to our simplified status
   */
  private mapStatus(
    status: FootballDataMatch["status"]
  ): "SCHEDULED" | "LIVE" | "FINISHED" {
    switch (status) {
      case "SCHEDULED":
      case "TIMED":
        return "SCHEDULED";
      case "IN_PLAY":
      case "PAUSED":
        return "LIVE";
      case "FINISHED":
        return "FINISHED";
      default:
        return "SCHEDULED";
    }
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
