// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./interfaces/IPulseers.sol";

/**
 * @title Pulseers
 * @notice Decentralized social signaling platform for football matches
 * @dev UUPS Upgradeable proxy pattern with namespaced storage (ERC-7201)
 */
contract Pulseers is
    IPulseers,
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    /// @custom:storage-location erc7201:pulseers.storage.main
    struct PulseersStorage {
        mapping(uint256 => Match) matches;
        mapping(uint256 => mapping(address => bool)) userSignals;
        mapping(uint256 => mapping(address => uint8)) userTeamChoice;
        uint256[] matchIds;
        uint256 totalSignals;
    }

    // keccak256(abi.encode(uint256(keccak256("pulseers.storage.main")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant PULSEERS_STORAGE_LOCATION =
        0x8a7d8e6e5d4c3b2a1f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a300;

    function _getPulseersStorage()
        private
        pure
        returns (PulseersStorage storage $)
    {
        assembly {
            $.slot := PULSEERS_STORAGE_LOCATION
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract
     * @param _owner The owner address
     */
    function initialize(address _owner) public initializer {
        __Ownable_init(_owner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @notice Add multiple matches in batch
     * @dev Only owner can add matches
     */
    function addMatches(
        uint256[] calldata _matchIds,
        string[] calldata _teamAs,
        string[] calldata _teamBs,
        string[] calldata _leagues,
        string[] calldata _logoAs,
        string[] calldata _logoBs,
        uint256[] calldata _startTimes
    ) external override onlyOwner {
        require(_matchIds.length > 0, "Empty arrays");
        require(
            _matchIds.length == _teamAs.length &&
                _matchIds.length == _teamBs.length &&
                _matchIds.length == _leagues.length &&
                _matchIds.length == _logoAs.length &&
                _matchIds.length == _logoBs.length &&
                _matchIds.length == _startTimes.length,
            "Array length mismatch"
        );

        PulseersStorage storage $ = _getPulseersStorage();

        for (uint256 i = 0; i < _matchIds.length; i++) {
            uint256 matchId = _matchIds[i];
            require($.matches[matchId].matchId == 0, "Match already exists");
            require(_startTimes[i] > block.timestamp, "Invalid start time");

            $.matches[matchId] = Match({
                matchId: matchId,
                teamA: _teamAs[i],
                teamB: _teamBs[i],
                league: _leagues[i],
                logoA: _logoAs[i],
                logoB: _logoBs[i],
                startTime: _startTimes[i],
                signalsTeamA: 0,
                signalsTeamB: 0,
                isActive: true
            });

            $.matchIds.push(matchId);
        }

        emit MatchesAdded(_matchIds, block.timestamp);
    }

    /**
     * @notice Signal support for a team in a match
     * @param _matchId The match ID
     * @param _teamId Team ID (1 for Team A, 2 for Team B)
     */
    function signal(uint256 _matchId, uint8 _teamId)
        external
        override
        whenNotPaused
        nonReentrant
    {
        require(_teamId == 1 || _teamId == 2, "Invalid team ID");

        PulseersStorage storage $ = _getPulseersStorage();
        Match storage matchData = $.matches[_matchId];

        require(matchData.matchId != 0, "Match does not exist");
        require(matchData.isActive, "Match not active");
        require(!$.userSignals[_matchId][msg.sender], "Already signaled");

        // Allow signaling during live matches (startTime + 2 hours buffer)
        require(
            block.timestamp < matchData.startTime + 2 hours,
            "Match signaling period ended"
        );

        $.userSignals[_matchId][msg.sender] = true;
        $.userTeamChoice[_matchId][msg.sender] = _teamId;

        if (_teamId == 1) {
            matchData.signalsTeamA++;
        } else {
            matchData.signalsTeamB++;
        }

        $.totalSignals++;

        emit SignalAdded(_matchId, msg.sender, _teamId, block.timestamp);
    }

    /**
     * @notice Deactivate a match (prevent further signals)
     * @param _matchId The match ID to deactivate
     */
    function deactivateMatch(uint256 _matchId) external override onlyOwner {
        PulseersStorage storage $ = _getPulseersStorage();
        Match storage matchData = $.matches[_matchId];

        require(matchData.matchId != 0, "Match does not exist");
        require(matchData.isActive, "Match already deactivated");

        matchData.isActive = false;

        emit MatchDeactivated(_matchId);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get all match IDs
     */
    function getAllMatchIds()
        external
        view
        override
        returns (uint256[] memory)
    {
        PulseersStorage storage $ = _getPulseersStorage();
        return $.matchIds;
    }

    /**
     * @notice Get multiple matches by IDs
     */
    function getMatches(uint256[] calldata _matchIds)
        external
        view
        override
        returns (Match[] memory)
    {
        PulseersStorage storage $ = _getPulseersStorage();
        Match[] memory result = new Match[](_matchIds.length);

        for (uint256 i = 0; i < _matchIds.length; i++) {
            result[i] = $.matches[_matchIds[i]];
        }

        return result;
    }

    /**
     * @notice Check if a user has signaled for a match
     */
    function hasUserSignaled(uint256 _matchId, address _user)
        external
        view
        override
        returns (bool)
    {
        PulseersStorage storage $ = _getPulseersStorage();
        return $.userSignals[_matchId][_user];
    }

    /**
     * @notice Get which team a user signaled for
     */
    function getUserTeamChoice(uint256 _matchId, address _user)
        external
        view
        returns (uint8)
    {
        PulseersStorage storage $ = _getPulseersStorage();
        return $.userTeamChoice[_matchId][_user];
    }

    /**
     * @notice Get signal percentages for a match
     */
    function getSignalPercentages(uint256 _matchId)
        external
        view
        override
        returns (uint256 percentageA, uint256 percentageB)
    {
        PulseersStorage storage $ = _getPulseersStorage();
        Match storage matchData = $.matches[_matchId];

        uint256 total = matchData.signalsTeamA + matchData.signalsTeamB;

        if (total == 0) {
            return (50, 50); // Default 50-50 if no signals
        }

        percentageA = (matchData.signalsTeamA * 100) / total;
        percentageB = (matchData.signalsTeamB * 100) / total;
    }

    /**
     * @notice Get platform statistics
     */
    function getStats()
        external
        view
        override
        returns (
            uint256 totalMatches,
            uint256 activeMatches,
            uint256 totalSignals
        )
    {
        PulseersStorage storage $ = _getPulseersStorage();
        totalMatches = $.matchIds.length;
        totalSignals = $.totalSignals;

        for (uint256 i = 0; i < $.matchIds.length; i++) {
            if ($.matches[$.matchIds[i]].isActive) {
                activeMatches++;
            }
        }
    }

    /**
     * @notice Get a single match by ID
     */
    function getMatch(uint256 _matchId)
        external
        view
        returns (Match memory)
    {
        PulseersStorage storage $ = _getPulseersStorage();
        return $.matches[_matchId];
    }

    /**
     * @notice Authorize upgrade (UUPS)
     * @dev Only owner can upgrade
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
