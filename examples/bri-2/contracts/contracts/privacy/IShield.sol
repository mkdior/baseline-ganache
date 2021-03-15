// SPDX-License-Identifier: CC0
pragma solidity ^0.6.9;

interface IShield {

    function getVerifier() external view returns (address);
    function verifyAndPush(
        uint256[8] calldata proof,
        uint256[2] calldata publicInputs,
        bytes32 commitment
    ) external returns (bool);

}
