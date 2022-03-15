import React, { useState } from "react";
import { useContractReader } from "eth-hooks";
import { useLocalStorage } from "../hooks";
import { TransactionListItem } from "../components";

const { ethers } = require("ethers");

export default function Pool({
  gun,
  userSigner,
  contractName,
  localProvider,
  address,
  writeContracts,
  mainnetProvider,
  readContracts,
  blockExplorer,
}) {
  const Arraytransactions = [];
  const contractAddress = readContracts && readContracts[contractName] ? readContracts[contractName].address : "";
  let txresult;

  if (
    readContracts &&
    readContracts[contractName] &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId
  ) {
    txresult = gun.get(contractAddress + "_" + localProvider._network.chainId);
    console.log(txresult);
    txresult.map().once(async transaction => {
      Arraytransactions.push(transaction);
    });
    console.log(Arraytransactions);
  }

  return (
    <div>
      <h2>Transaction Pool</h2>
    </div>
  );
}
