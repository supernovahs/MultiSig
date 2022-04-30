pragma solidity ^0.8.10;

import "./MultisigWallet.sol";

contract Factory  {

    MultiSig multisig;

    function createNewMultiSig (address[] memory owners,uint chainId,uint NoOfSignaturesRequired)public {
        multisig = new MultiSig(chainId,owners,NoOfSignaturesRequired);
    }



}