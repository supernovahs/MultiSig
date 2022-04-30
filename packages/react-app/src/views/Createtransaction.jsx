import { Button, Select, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { Address, EtherInput, AddressInput, Balance, Events } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { useContractReader } from "eth-hooks";
import { useLocalStorage } from "../hooks";
import { getContractAddress } from "@ethersproject/address";
import { useHistory } from "react-router-dom";
import { WalletConnectInput } from "../components";
const { Option } = Select;
const { ethers } = require("ethers");
const axios = require("axios");
export default function ExampleUI({
  contractAddress,
  poolServerUrl,
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  contractName,
  gun,
  userSigner,
}) {
  const history = useHistory();
  const [methodName, setmethodName] = useState();
  const [to, setTo] = useLocalStorage("to");
  const [amount, setamount] = useLocalStorage("amount", "0");
  const [data, setData] = useState("0x00");
  const [customNonce, setcustomNonce] = useState();
  const [selectDisabled, setSelectDisabled] = useState(false);

  const calldataRef = useRef("0x00");
  const nonce = useContractReader(readContracts, "MultiSig", "nonce");
  const [isWalletConnectTransaction, setIsWalletConnectTransaction] = useState(false);

  console.log(readContracts["MultiSig"]);

  const loadWalletConnectData = ({ to, value, data }) => {
    setTo(to);
    value ? setamount(ethers.utils.formatEther(value)) : setamount("0");
    setData(data);
    setIsWalletConnectTransaction(true);
  };

  useEffect(() => {
    isWalletConnectTransaction && createTransaction();
    setIsWalletConnectTransaction(false);
  }, [isWalletConnectTransaction]);

  const createTransaction = async () => {
    const nonce = await readContracts["MultiSig"].nonce();
    console.log(nonce);
    const nonceformat = nonce.toNumber();
    console.log("nonce", nonce.toNumber());
    console.log(parseEther("" + parseFloat(amount).toFixed(12)));
    console.log(amount);
    console.log(to);
    console.log(data);

    const NewHash = await readContracts[contractName].getTransactionHash(
      nonce,
      to,
      parseEther("" + parseFloat(amount).toFixed(12)),
      data,
    );

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
      console.log(amount);

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

      console.log("result", data);

      setTimeout(() => {
        history.push("/pendingtransaction");
      }, 2000);

      console.log(data);
    }
  };

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 15, margin: "auto", width: 400, marginTop: 64 }}>
        <div style={{ margin: 8, padding: 8 }}>
          <div style={{ padding: 10 }}>
            <Input
              placeholder={"" + (nonce ? nonce.toNumber() : "loading...")}
              bordered
              disabled
              prefix="#"
              value={customNonce}
            />
          </div>

          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} disabled={selectDisabled} style={{ width: "100%" }} onChange={setmethodName}>
              <Option key="TransferEth"> Transfer Eth</Option>
              <Option key="Calldata"> Custom CallData</Option>
              <Option key="Walletconnection">WalletConnect</Option>
            </Select>
          </div>

          {methodName == "Walletconnection" ? (
            <div style={{ padding: 10 }}>
              <WalletConnectInput
                chainId={localProvider?._network.chainId}
                address={contractAddress}
                loadWalletConnectData={loadWalletConnectData}
                mainnetProvider={mainnetProvider}
                price={price}
              />
            </div>
          ) : (
            <>
              <div style={{ padding: 10, margin: 10 }}>
                <AddressInput
                  value={to}
                  placeholder={"Insert Address"}
                  onChange={setTo}
                  ensProvider={mainnetProvider}
                  autoFocus
                />
              </div>
              <div style={{ padding: 10, margin: 10 }}>
                <EtherInput
                  price={price}
                  mode="USD"
                  value={amount}
                  onChange={e => {
                    setamount(e);
                    console.log(amount);
                  }}
                  placeholder="value"
                  autofocus
                />
              </div>
              {methodName != "TransferEth" && (
                <div style={{ padding: 8 }}>
                  <Input
                    value={data}
                    onChange={e => {
                      setData(e.target.value);
                      console.log(amount);
                    }}
                    ref={calldataRef}
                  />
                </div>
              )}

              <Button
                style={{ marginTop: 32 }}
                onClick={async () => {
                  createTransaction();
                }}
              >
                Create
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
