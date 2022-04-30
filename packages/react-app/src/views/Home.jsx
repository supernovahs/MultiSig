import React from "react";
import { Link } from "react-router-dom";
import { useContractReader, useEventListener } from "eth-hooks";
import QR from "qrcode.react";
import { ethers } from "ethers";
import { Balance, Address, TransactionListItem } from "../components";
import LocaleProvider from "antd/lib/locale-provider";
import { List } from "antd";

export default function Home({
  contractAddress,
  contractName,
  price,
  provider,
  mainnetProvider,
  blockExplorer,
  contractConfig,
  readContracts,
  address,
  Executetransactionevents,
}) {
  let ethbalance = "";
  const getbal = async () => {
    ethbalance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(ethers.BigNumber.from(ethbalance).toString()));
  };
  getbal();
  console.log(ethbalance);

  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div style={{ fontSize: "1cm", color: "cyan" }}>
          Assets in your Safe:
          {<Balance address={contractAddress} provider={provider} price={price} />}
        </div>

        <div>
          <QR
            value={contractAddress ? contractAddress : ""}
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
                  provider={provider}
                />
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
