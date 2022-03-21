import { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } from "@uniswap/sdk";
import React, { useState } from "react";
import { Swap } from "../components";
import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import abis from "../wethabi.json";
import swapABI from "../uniswapABI.json";
import { Select, Button } from "antd";
import { EtherInput } from "../components";
import { useHistory } from "react-router-dom";
import { useContractReader } from "eth-hooks";
const { history } = useHistory;
const { ethers } = require("ethers");
const { Option } = Select;

export default function Uniswap(
  address,
  readContracts,
  writeContracts,
  localProvider,
  blockExplorer,
  userSigner,
  contractConfig,
  mainnetProvider,
  tx,
  price,
  contractName,
  gun,
) {
  const nonce = useContractReader(readContracts, "MultiSig", "nonce");
  //   //   console.log(`The chainId of mainnet is ${ChainId.MAINNET}.`);
  const chainId = 4;
  const tokenAddress = "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735";
  const decimals = 18;
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rinkeby.infura.io/v3/d21c9a0af06049d980fc5df2d149e4bb",
  );

  const DAI = new Token(chainId, tokenAddress, decimals, "DAI", "Dai Stablecoin");
  console.log(DAI);
  const ethPrivkey = "a36091e29b0da9e37adb32f91df6942aee60fe27babda5553fa31ea59b5e451f";
  let pair;
  async function callFetch() {
    pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider);
    const route = new Route([pair], WETH[4]);
    console.log(route.midPrice.toSignificant(6)); // 201.306
    console.log(route.midPrice.invert().toSignificant(6));
    const trade = new Trade(route, new TokenAmount(WETH[4], "1000000000000000"), TradeType.EXACT_INPUT);
    console.log(trade.executionPrice.toSignificant(6));
    console.log(trade.nextMidPrice.toSignificant(6));
    console.log(trade);
    const slippageTolerance = new Percent("50", "10000");
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const path = [WETH[DAI.chainId].address, DAI.address];
    const to = "";
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const value = trade.inputAmount.raw;
    // await provider.send("eth_requestAccounts", []);
    // const signer = provider.getSigner();
    // console.log(signer);
    console.log(path);
    console.log(amountOutMin);
    console.log(deadline);
    console.log(value);
    console.log(slippageTolerance);
    console.log(WETH[4].address);
    console.log(abis.abi);
    // console.log(signer.address);
    const wallet = new ethers.Wallet(ethPrivkey, provider);
    const signer = wallet.provider.getSigner(wallet.address);

    const weth = new ethers.Contract(WETH[4].address, abis.abi, signer);
    console.log(weth);

    console.log(amountOutMin[2]);

    const swapiface = new ethers.utils.Interface(swapABI.swapabi);
    console.log(swapiface);

    const swaptx = swapiface.encodeFunctionData("swapExactETHForTokens", [
      amountOutMin[2],
      path,
      "0x1b37B1EC6B7faaCbB9AddCCA4043824F36Fb88D8",
      deadline,
    ]);
    console.log(swaptx);
    // const tx = await weth.approve("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", 1000000000000000, {
    //   value: 0,
    //   gasPrice: 100 * 1000000000,
    // });
    // console.log(tx);

    // const signer = selectedProvider.getSigner();
    // const uniswap = new ethers.Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", [
    //   "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    //   signer,
    // ]);

    // const tx = await uniswap.sendExactETHForTokens(amountOutMin, path, to, deadline, { value, gasPrice: 20e9 });
    // const txmine = await tx.wait();
    // console.log(`Transaction  Hash: ${txmine}`);
  }
  callFetch();
  const [selectfrom, setselectfrom] = useState();
  const [selectto, setselectto] = useState();
  const [amount, setamount] = useState();
  const WethContract = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const RouterContract = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  return (
    <div>
      <h2>Uniswap Meta</h2>
      <div style={{ border: "1px solid #cccccc", padding: 15, margin: "auto", width: 400, marginTop: 64 }}>
        <div style={{ margin: 8, padding: 8 }}>
          <div style={{ padding: 10 }}>
            <Select value={selectfrom} style={{ width: "100%" }} onChange={setselectfrom}>
              <Option key="ETH">ETH</Option>
            </Select>
            <h2 style={{ marginTop: 5, marginDown: 10 }}>TO</h2>
            <Select value={selectto} style={{ width: "100%" }} onChange={setselectto}>
              <Option key="DAI">DAI</Option>
            </Select>
          </div>
          <div style={{ padding: 10 }}>
            <EtherInput
              price={price}
              mode="USD"
              value={amount}
              onChange={setamount}
              placeholder="value"
              autofocus
            ></EtherInput>
          </div>

          <Button
            onClick={async () => {
              const nonce = await readContracts["MultiSig"].nonce();
              console.log(amount);
              console.log(nonce ? nonce : "");

              if (selectfrom == "ETH" && selectto == "DAI") {
                const iface = new ethers.utils.Interface(abis.abi);
                console.log(iface);
                const approvetx = iface.encodeFunctionData("approve", [RouterContract, amount]);
                console.log(approvetx);

                // const approvehash = await readContracts[contractName ? contractName : ""].getTransactionHash(
                //   nonce,
                //   WethContract,
                //   0,
                //   approvetx,
                // );
                // console.log("Approve Hash", approvehash);

                // const approvesig = await userSigner.signMessage(ethers.utils.arrayify(approvehash));
                // console.log("Signature for Approving", approvesig);

                // const approverecover = await readContracts[contractName].recover(approvehash, approvesig);
                // console.log(approverecover);

                // const isOwner = await readContracts[contractName].isOwner(approverecover);
                // if (isOwner) {
                //   const approveresult = await gun.get(approvehash).put({
                //     chainId: localProvider._network.chainId,
                //     address: readContracts[contractName].address,
                //     WethContract,
                //     amount: 0,
                //     signatures: approvesig,
                //     hash: approvehash,
                //     approvetx,
                //     nonce: nonce.toNumber(),
                //     signers: approverecover,
                //   });

                //   console.log(approveresult);

                //   await gun
                //     .get(readContracts[contractName].address + "_" + localProvider._network.ChainId)
                //     .set(approveresult);
                //   approveresult.once(data => {
                //     console.log("data", data);
                //   });
                //   setTimeout(() => {
                //     history.push("/mainnetdai");
                //   }, 2000);
                // }
              }
            }}
          >
            Swap
          </Button>
        </div>
      </div>
    </div>
  );
}
