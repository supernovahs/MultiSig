import React from "react";
import { Link } from "react-router-dom";
import { useContractReader, useEventListener } from "eth-hooks";
import QR from "qrcode.react";
import { ethers } from "ethers";
import { Balance, Address, TransactionListItem } from "../components";
import LocaleProvider from "antd/lib/locale-provider";
import { Spin, List } from "antd";

export default function Home({
  contractName,
  price,
  localProvider,
  mainnetProvider,
  blockExplorer,
  contractConfig,
  readContracts,
  address,
  Executetransactionevents,
}) {
  const contractAddress = readContracts && readContracts[contractName] ? readContracts[contractName].address : "";
  console.log(Executetransactionevents);
  console.log(Executetransactionevents[0]);
  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div>
          <Balance
            address={readContracts && readContracts[contractName] ? readContracts[contractName].address : ""}
            fontSize={64}
            dollarMultiplier={price}
            provider={localProvider}
          />
        </div>
        <div>
          <QR
            value={contractAddress}
            size="170"
            level="H"
            renderAs="svg"
            bgColor="#FFFF00"
            fgColor="blue"
            imageSettings={{ excavate: false }}
          />
        </div>
        <div>
          <Address
            address={contractAddress}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            fontSize={32}
          />
        </div>
        <List
          bordered
          dataSource={Executetransactionevents}
          renderItem={item => {
            return (
              <>
                <TransactionListItem
                  item={item}
                  mainnetProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  price={price}
                  readContracts={readContracts}
                  contractName={contractName}
                />
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
