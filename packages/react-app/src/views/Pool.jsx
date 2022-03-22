import React, { useState } from "react";
import { useContractReader, useNonce, usePoller } from "eth-hooks";
import { useLocalStorage } from "../hooks";
import { TransactionListItem, Balance } from "../components";
import { Button, List, Spin } from "antd";
import { parseEther, formatEther } from "@ethersproject/units";

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
  tx,
  nonce,
  signaturesRequired,
  price,
}) {
  const Arraytransactions = [];
  const contractAddress = readContracts && readContracts[contractName] ? readContracts[contractName].address : "";
  let txresult;
  const [transactions, setTransactions] = useState();

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

  usePoller(() => {
    const getTransactions = async () => {
      if (true) console.log("🛰 Requesting Transaction List");
      const newTransactions = [];

      for (const i in Arraytransactions) {
        const thisNonce = ethers.BigNumber.from(Arraytransactions[i].nonce).toNumber();
        let a = Number(nonce);
        console.log(thisNonce);
        console.log(a);
        if (thisNonce >= a) {
          const validSignatures = [];
          const signatures = Arraytransactions[i].signatures.split(",");
          for (const s in signatures) {
            const signer = await readContracts[contractName].recover(Arraytransactions[i].hash, signatures[s]);
            const isOwner = await readContracts[contractName].isOwner(signer);
            if (signer && isOwner) {
              validSignatures.push({ signer, signature: signatures[s] });
            }
          }
          const update = { ...Arraytransactions[i], validSignatures };
          newTransactions.push(update);
        }
      }
      setTransactions(newTransactions);
    };
    if (readContracts) getTransactions();
  }, 3777);

  const getSortedSigList = async (allSigs, newHash) => {
    const sigList = [];
    for (const s in allSigs) {
      console.log("SIG", allSigs[s]);
      const recover = await readContracts[contractName].recover(newHash, allSigs[s]);
      sigList.push({ signature: allSigs[s], signer: recover });
    }

    sigList.sort((a, b) => {
      return ethers.BigNumber.from(a.signer).sub(ethers.BigNumber.from(b.signer));
    });

    const finalSigList = [];
    const finalSigners = [];
    const used = {};
    for (const s in sigList) {
      if (!used[sigList[s].signature]) {
        finalSigList.push(sigList[s].signature);
        finalSigners.push(sigList[s].signer);
      }
      used[sigList[s].signature] = true;
    }
    console.log("FInal Sig List:  ", finalSigList);
    return [finalSigList, finalSigners];
  };
  if (!signaturesRequired) {
    return <Spin />;
  }
  console.log(transactions);

  return (
    <div style={{ maxWidth: 750, margin: "auto", marginTop: 32, marginBottom: 32 }}>
      <h1>
        <b style={{ padding: 16 }}> Pending Transactions</b>
      </h1>

      <List
        bordered
        dataSource={transactions}
        renderItem={item => {
          console.log("item", item);
          const hasSigned = item.signers.indexOf(address) >= 0;
          const hasEnoughSignatures = item.signatures.length >= signaturesRequired.toNumber();
          console.log(item.value);

          // <Balance balance={item.value} address={address} price={price} provider={mainnetProvider} />;

          return (
            <TransactionListItem
              item={item}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
              readContracts={readContracts}
              contractName={contractName}
              address={address}
            >
              <span>
                {item.signatures.split(",").length}/{signaturesRequired.toNumber()} {hasSigned ? "✅" : ""}
              </span>

              <Button
                onClick={async () => {
                  console.log("item.signatures", item.signatures.split(","));

                  const newHash = await readContracts[contractName].getTransactionHash(
                    item.nonce,
                    item.to,
                    parseEther("" + parseFloat(item.amount).toFixed(12)),
                    item.data,
                  );
                  console.log("newHash", newHash);

                  const signature = await userSigner.signMessage(ethers.utils.arrayify(newHash));
                  console.log("signature", signature);

                  const recover = await readContracts[contractName].recover(newHash, signature);
                  console.log("recover--->", recover);

                  const isOwner = await readContracts[contractName].isOwner(recover);
                  console.log("isOwner", isOwner);

                  if (isOwner) {
                    const [finalSigList, finalSigners] = await getSortedSigList(
                      [...item.signatures.split(","), signature],
                      newHash,
                    );
                    const joinedSigList = finalSigList.join();
                    const joinedFinalSigners = finalSigners.join();
                    const { validSignatures, ...simpleItem } = item;
                    //we remove this array that was previously added to the object, just to deal with GunDB, as it is not necessary. There are probably better ways of doing this...
                    const newItem = {
                      ...simpleItem,
                      signatures: joinedSigList,
                      signers: joinedFinalSigners,
                    };
                    const newSigTx = gun.get(newItem.hash + "newSig").put(newItem);
                    txresult.set(newSigTx);
                  }
                }}
                type="secondary"
              >
                Sign
              </Button>
              <Button
                key={item.hash}
                onClick={async () => {
                  const newHash = await readContracts[contractName].getTransactionHash(
                    item.nonce,
                    item.to,
                    parseEther("" + parseFloat(item.amount).toFixed(12)),
                    item.data,
                  );
                  console.log(item.nonce);
                  console.log(item.to);
                  console.log(item.amount);
                  console.log(item.data);
                  console.log("");

                  console.log("newHash", newHash);

                  console.log("item.signatures", item.signatures.split(","));

                  const [finalSigList, finalSigners] = await getSortedSigList(item.signatures.split(","), newHash);
                  console.log(finalSigList);
                  console.log(item.amount * 10 ** 18);
                  // console.log(ethers.utils.parseEther("" + parseFloat(item.amount).toFixed(12)));
                  console.log(((item.amount * 1).toFixed(18) * 10 ** 18).toString());
                  console.log(item.amount);
                  console.log(ethers.BigNumber.from(parseEther("" + parseFloat(item.amount).toFixed(12))).toNumber());
                  tx(
                    writeContracts[contractName].executeTransaction(
                      item.to,
                      // parseEther("" + parseFloat(item.amount).toFixed(12)),
                      ethers.BigNumber.from(parseEther("" + parseFloat(item.amount).toFixed(12))).toNumber(),
                      item.data,
                      finalSigList,
                      // { gasPrice: 100e9 },
                    ),
                  );
                }}
                type={hasEnoughSignatures ? "primary" : "secondary"}
              >
                Exec
              </Button>
            </TransactionListItem>
          );
        }}
      />
    </div>
  );
}
