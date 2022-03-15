import { Select } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { List, Button, Spin, Input } from "antd";
import { useTokenList } from "eth-hooks/dapps/dex";
import { Address, AddressInput } from "../components";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useLocalStorage } from "../hooks";
import { useHistory } from "react-router-dom";
const { ethers } = require("ethers");
const { Option } = Select;

export default function Hints({
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
}) {
  const ownerEvents = useEventListener(readContracts, contractName, "Owner", localProvider, 1);
  const [methodName, setMethodName] = useLocalStorage("addSigner");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner");
  const [data, setdata] = useLocalStorage("Data", "0x00");
  const [newSignatureRequired, setnewSignatureRequired] = useLocalStorage("NewSignatures");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [to, setTo] = useLocalStorage("to");
  const history = useHistory();

  console.log(signaturesRequired);
  console.log(ownerEvents);
  return (
    <div>
      <h2 style={{ marginTop: 20 }}>
        Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin></Spin>}
      </h2>
      <List
        bordered
        dataSource={ownerEvents}
        renderItem={item => {
          return (
            <List.Item key={"owner" + item.args[0] + "blockN" + item.blockNumber}>
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
          onClick={() => {
            let calldata = readContracts[contractName].interface.encodeFunctionData(methodName, [
              newOwner,
              newSignatureRequired,
            ]);
            console.log(calldata);
            setdata(calldata);
            setAmount("0");
            setTo(readContracts[contractName].address);
            setTimeout(() => {
              history.push("/exampleui");
            }, 800);
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
