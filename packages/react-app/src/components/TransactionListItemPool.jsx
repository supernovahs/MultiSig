import React, { useState } from "react";
import { Button, List } from "antd";

import { Address, Balance, Blockie, TransactionDetailsModal } from "../components";
import { EllipsisOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
const { ethers } = require("ethers");
const TransactionListItemPool = function ({
  item,
  mainnetProvider,
  blockExplorer,
  price,
  readContracts,
  contractName,
  children,
  address,
  provider,
}) {
  item = item.args ? item.args : item;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [txnInfo, setTxnInfo] = useState(null);
  console.log(item);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const contractInterface = readContracts && readContracts[contractName] && readContracts[contractName].interface;

  console.log("🔥🔥🔥🔥", item);
  console.log(item.amount._hex);
  //   console.log(ethers.BigNumber.from(item.amount).toNumber());
  let txnData = "";
  if (item.data !== "0x00") {
    try {
      txnData = contractInterface.parseTransaction(item);
    } catch (error) {
      console.log("ERROR", error);
    }
  }

  return (
    <>
      <TransactionDetailsModal
        visible={isModalVisible}
        txnInfo={txnData}
        addressTo={item.to}
        value={item.amount * 10 ** 18}
        handleOk={handleOk}
        mainnetProvider={mainnetProvider}
        price={price}
        provider={provider}
      />
      {
        <List.Item key={item.hash} style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 55,
              fontSize: 12,
              opacity: 0.5,
              display: "flex",
              flexDirection: "row",
              width: "90%",
              justifyContent: "space-between",
            }}
          >
            <p>
              <h1 style={{ color: "Red" }}>Event:&nbsp;</h1>
              {/* {item.data !== "0x00" ? txnData.functionFragment.name : "Send ETH"}&nbsp; */}
            </p>
            <p>
              <b>Addressed to :&nbsp;</b>
              {txnData !== "" ? txnData.args[0] : item.to}
            </p>
          </div>
          {<h2 style={{ padding: 16 }}>#{typeof item.nonce === "number" ? item.nonce : item.nonce.toNumber()}</h2>}
          <span>
            <h2>
              {" "}
              <Blockie size={4} scale={8} address={item.hash} />
            </h2>{" "}
            {item.hash.substr(0, 6)}
          </span>
          <Address address={item.to} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={16} />
          <h2>
            {(item.amount = "0" ? 0 : item.amount.toFixed(4))}
            ETH
          </h2>
          <>{children}</>
          <Button onClick={showModal}>
            <EllipsisOutlined />
          </Button>
        </List.Item>
      }
    </>
  );
};
export default TransactionListItemPool;
