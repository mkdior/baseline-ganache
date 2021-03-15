// SPDX-License-Identifier: CC0
pragma solidity ^0.6.9;

/**
@title IVerifier
@dev Example Verifier Implementation
*/
interface IVerifier {
    function verifyTx(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c, 
            uint[2] memory input
    ) external view returns (bool result);
}
