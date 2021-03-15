// SPDX-License-Identifier: CC0
pragma solidity ^0.6.9;

import "./lib/MerkleTreeSHA256.sol";
import "./IShield.sol";
import "./IVerifier.sol";

contract Shield is IShield, MerkleTreeSHA256 {
    // CONTRACT INSTANCES:
    IVerifier private verifier; // the verification smart contract

    // FUNCTIONS:
    constructor(address _verifier, uint _treeHeight) public MerkleTreeSHA256(_treeHeight) {
        verifier = IVerifier(_verifier);
    }

    // returns the verifier contract address that this shield contract uses for proof verification
    function getVerifier() external override view returns (address) {
        return address(verifier);
    }

    function verifyAndPush(
        uint256[8] calldata _proof,
        uint256[2] calldata _publicInputs,
        bytes32 _newCommitment
    ) external override returns (bool) {

        // verify the proof
        bool result = verifier.verifyTx([_proof[0], _proof[1]], [[_proof[2], _proof[3]], [_proof[4], _proof[5]]], [_proof[6], _proof[7]], [_publicInputs[0], _publicInputs[1]]);
        require(result, "The proof failed verification in the verifier contract");

        // update contract states
        insertLeaf(_newCommitment); // recalculate the root of the merkleTree as it's now different
        return true;
    }

}
