import { Select } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { List, Button, Spin, Input } from "antd";
import { useTokenList } from "eth-hooks/dapps/dex";
import { Address, AddressInput } from "../components";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useLocalStorage } from "../hooks";
import { useHistory } from "react-router-dom";
import { withSuccess } from "antd/lib/modal/confirm";
import { parseEther, formatEther } from "@ethersproject/units";
import axios from "axios";
const { ethers } = require("ethers");
const { Option } = Select;

export default function Hints({
  contractAddress,
  poolServerUrl,
  yourLocalBalance,
  mainnetProvider,
  price,
  address,
  readContracts,
  blockExplorer,
  contractConfig,
  contractName,
  tx,
  userSigner,
  localProvider,
  signaturesRequired,
  gun,
}) {
  const ownerEvents = useEventListener(readContracts, contractName, "Owner", localProvider, 1);
  const [methodName, setMethodName] = useLocalStorage("addSigner");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner");
  const [data, setdata] = useLocalStorage("Data", "0x00");
  const [newSignatureRequired, setnewSignatureRequired] = useLocalStorage("NewSignatures");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [to, setTo] = useState("0x");
  const history = useHistory();

  return (
    <div>
      <h2 style={{ marginTop: 20, borderBlockEnd: "1px solid red" }}>
        Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin></Spin>}
      </h2>
      <div style={{ border: "3px  solid white" }}>
        <List
          dataSource={ownerEvents}
          renderItem={item => {
            return (
              <List.Item
                key={"owner" + item.args[0] + "blockN" + item.blockNumber}
                style={{ border: "1px solid black" }}
              >
                <div></div>
                <Address
                  address={item.args[0]}
                  ensProvider={mainnetProvider}
                  fontSize={30}
                  blockExplorer={blockExplorer}
                />
                <div>
                  <p>{item.args[1] ? "👍" : "👎"}</p>
                </div>
              </List.Item>
            );
          }}
        />
      </div>

      <div style={{ border: "1px solid #cccccc", padding: 20, width: 400, margin: "auto", marginTop: 10 }}>
        <div style={{ margin: 10, padding: 14 }}>
          <h2>Method</h2>
          <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
            <Option key="addSigner">AddSigner</Option>
            <Option key="removeSigner">Remove Signer</Option>
          </Select>
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <AddressInput
            placeholder={"Input Address"}
            value={newOwner}
            onChange={setNewOwner}
            ensProvider={mainnetProvider}
            autoFocus
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Input
            bordered
            value={newSignatureRequired}
            onChange={e => {
              setnewSignatureRequired(e.target.value);
            }}
            placeholder="New Signature Required"
          />
        </div>

        <Button
          onClick={async () => {
            let calldata = readContracts["MultiSig"].interface.encodeFunctionData(methodName, [
              newOwner,
              newSignatureRequired,
            ]);
            console.log(calldata);
            setdata(calldata);
            setAmount(0);
            setTo(await readContracts["MultiSig"].address);

            const nonce = await readContracts["MultiSig"].nonce();
            const nonceformat = nonce.toNumber();
            console.log("nonce", nonce.toNumber());
            console.log(parseEther("" + parseFloat(amount).toFixed(12)));
            console.log(amount);
            console.log(calldata);
            console.log(to);
            console.log(signaturesRequired);

            const NewHash = await readContracts[contractName].getTransactionHash(nonce, to, 0, calldata);
            console.log("NewHash", NewHash);

            const signature = await userSigner.signMessage(ethers.utils.arrayify(NewHash));
            console.log("signature", signature);

            const recover = await readContracts[contractName].recover(NewHash, signature);
            console.log(recover);
            console.log(userSigner);
            const isOwner = await readContracts[contractName].isOwner(recover);
            console.log(isOwner);
            if (isOwner) {
              console.log("verfied signer");
              console.log(await userSigner.address);
              console.log(signature);
              console.log(address);
              console.log(data);
              console.log(localProvider._network.chainId);
              console.log(nonce);
              console.log(recover);
              console.log(NewHash);

              const txResult = await axios.post(poolServerUrl, {
                chainId: localProvider._network.chainId,
                address: readContracts[contractName].address,
                to,
                amount,
                signatures: signature,
                hash: NewHash,
                data,
                nonce: nonceformat,
                signers: recover,
              });

              console.log(txResult);

              console.log("Result", data);

              setTimeout(() => {
                history.push("/proposetransaction");
              }, 2000);

              //

              console.log(data);
            }
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
