import React from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import QR from "qrcode.react";
import { ethers } from "ethers";
import { Balance, Address } from "../components";
import LocaleProvider from "antd/lib/locale-provider";

export default function Home({ contractName, price, localProvider, mainnetProvider, blockExplorer, contractConfig }) {
  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div>
          <Balance
            address={"0x03E72A5e4c9c83C3a6105789A929406E60A36Fca"}
            // address={readContracts ? readContracts[contractName].address : readContracts}
            provider={localProvider}
            fontSize={64}
            dollarMultiplier={price}
            contractConfig={contractConfig}
            provider={mainnetProvider}
          />
        </div>
        <div>
          <QR
            value={"0x03E72A5e4c9c83C3a6105789A929406E60A36Fca"}
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
            address={"0x03E72A5e4c9c83C3a6105789A929406E60A36Fca"}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            fontSize={32}
          />
        </div>
      </div>
    </div>
  );
}
