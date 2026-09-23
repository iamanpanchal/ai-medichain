// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MediChain
 * @notice Anchors medical record hashes on-chain so they can be
 *         independently verified by any party without exposing PHI.
 *
 * Only the deployer (MediChain backend wallet) can anchor records.
 * Anyone can verify a record by calling verifyRecord().
 */
contract MediChain {
    address public immutable owner;

    struct RecordAnchor {
        bytes32 hash;       // SHA-256 of the encrypted file
        address anchoredBy; // wallet that submitted the transaction
        uint256 timestamp;  // block timestamp of anchoring
    }

    // recordId (e.g. "MR-1024") → anchor data
    mapping(string => RecordAnchor) private _records;

    event RecordAnchored(
        string indexed recordId,
        bytes32 indexed hash,
        address indexed anchoredBy,
        uint256 timestamp
    );

    event RecordUpdated(
        string indexed recordId,
        bytes32 indexed newHash,
        address indexed updatedBy,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "MediChain: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Anchor a new record hash on-chain.
     * @param recordId  Platform record identifier (e.g. "MR-1024").
     * @param hash      SHA-256 of the encrypted file as bytes32.
     */
    function anchorRecord(string calldata recordId, bytes32 hash) external onlyOwner {
        require(bytes(recordId).length > 0, "MediChain: empty recordId");
        require(hash != bytes32(0),         "MediChain: empty hash");
        require(_records[recordId].timestamp == 0, "MediChain: record already anchored; use updateRecord");

        _records[recordId] = RecordAnchor({ hash: hash, anchoredBy: msg.sender, timestamp: block.timestamp });
        emit RecordAnchored(recordId, hash, msg.sender, block.timestamp);
    }

    /**
     * @notice Update an existing anchor (e.g. re-encryption or correction).
     */
    function updateRecord(string calldata recordId, bytes32 newHash) external onlyOwner {
        require(_records[recordId].timestamp != 0, "MediChain: record not anchored yet");
        _records[recordId].hash      = newHash;
        _records[recordId].timestamp = block.timestamp;
        emit RecordUpdated(recordId, newHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a record.
     * @return hash        The stored hash (bytes32(0) if not anchored).
     * @return anchoredBy  Wallet that anchored the record.
     * @return timestamp   Unix timestamp of anchoring.
     */
    function verifyRecord(string calldata recordId)
        external
        view
        returns (bytes32 hash, address anchoredBy, uint256 timestamp)
    {
        RecordAnchor memory anchor = _records[recordId];
        return (anchor.hash, anchor.anchoredBy, anchor.timestamp);
    }

    /**
     * @notice Check whether a record has been anchored.
     */
    function isAnchored(string calldata recordId) external view returns (bool) {
        return _records[recordId].timestamp != 0;
    }
}
