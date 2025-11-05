// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IPulseers
 * @notice Interface for the Pulseers social signaling platform
 */
interface IPulseers {
    /// @notice Match data structure
    struct Match {
        uint256 matchId;        // Unique match ID from API
        string teamA;           // Team A name
        string teamB;           // Team B name
        string league;          // League name
        string logoA;           // Team A logo URL
        string logoB;           // Team B logo URL
        uint256 startTime;      // Match start timestamp
        uint256 signalsTeamA;   // Total signals for Team A
        uint256 signalsTeamB;   // Total signals for Team B
        bool isActive;          // Active for signaling
    }

    /// @notice Emitted when matches are added to the contract
    event MatchesAdded(uint256[] matchIds, uint256 timestamp);

    /// @notice Emitted when a user signals for a team
    event SignalAdded(
        uint256 indexed matchId,
        address indexed user,
        uint8 teamId,
        uint256 timestamp
    );

    /// @notice Emitted when a match is deactivated
    event MatchDeactivated(uint256 indexed matchId);

    /**
     * @notice Add multiple matches in batch
     * @param _matchIds Array of match IDs
     * @param _teamAs Array of team A names
     * @param _teamBs Array of team B names
     * @param _leagues Array of league names
     * @param _logoAs Array of team A logo URLs
     * @param _logoBs Array of team B logo URLs
     * @param _startTimes Array of match start timestamps
     */
    function addMatches(
        uint256[] calldata _matchIds,
        string[] calldata _teamAs,
        string[] calldata _teamBs,
        string[] calldata _leagues,
        string[] calldata _logoAs,
        string[] calldata _logoBs,
        uint256[] calldata _startTimes
    ) external;

    /**
     * @notice Signal support for a team in a match
     * @param _matchId The match ID
     * @param _teamId Team ID (1 for Team A, 2 for Team B)
     */
    function signal(uint256 _matchId, uint8 _teamId) external;

    /**
     * @notice Deactivate a match (prevent further signals)
     * @param _matchId The match ID to deactivate
     */
    function deactivateMatch(uint256 _matchId) external;

    /**
     * @notice Get all match IDs
     * @return Array of all match IDs
     */
    function getAllMatchIds() external view returns (uint256[] memory);

    /**
     * @notice Get multiple matches by IDs
     * @param _matchIds Array of match IDs to fetch
     * @return Array of Match structs
     */
    function getMatches(uint256[] calldata _matchIds)
        external
        view
        returns (Match[] memory);

    /**
     * @notice Check if a user has signaled for a match
     * @param _matchId The match ID
     * @param _user The user address
     * @return True if user has signaled
     */
    function hasUserSignaled(uint256 _matchId, address _user)
        external
        view
        returns (bool);

    /**
     * @notice Get signal percentages for a match
     * @param _matchId The match ID
     * @return percentageA Percentage for Team A (0-100)
     * @return percentageB Percentage for Team B (0-100)
     */
    function getSignalPercentages(uint256 _matchId)
        external
        view
        returns (uint256 percentageA, uint256 percentageB);

    /**
     * @notice Get platform statistics
     * @return totalMatches Total number of matches
     * @return activeMatches Number of active matches
     * @return totalSignals Total signals across all matches
     */
    function getStats()
        external
        view
        returns (
            uint256 totalMatches,
            uint256 activeMatches,
            uint256 totalSignals
        );
}
