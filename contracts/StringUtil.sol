// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

library StringUtil {
    // Compiles also with calldata + public/external; No change is gas
    function toBytes32(string memory _str) internal pure returns (bytes32) {
        return bytes32(bytes(_str));
    }

    function isEmpty(string memory _str) internal pure returns (bool) {
        return bytes(_str).length == 0;
    }
}
