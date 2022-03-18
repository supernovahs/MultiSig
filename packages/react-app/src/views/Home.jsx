import React from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import QR from "qrcode.react";
import { ethers } from "ethers";
import { Balance, Address } from "../components";
import LocaleProvider from "antd/lib/locale-provider";
import { Spin } from "antd";

export default function Home({
  contractName,
  price,
  localProvider,
  mainnetProvider,
  blockExplorer,
  contractConfig,
  readContracts,
  address,
}) {
  const contractAddress = readContracts && readContracts[contractName] ? readContracts[contractName].address : "";
  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div>
          <Balance address={contractAddress} fontSize={64} price={price} provider={mainnetProvider} />
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
      </div>
    </div>
  );
}
