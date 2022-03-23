import { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } from "@uniswap/sdk";
import React, { useState, useEffect } from "react";
import { Swap } from "../components";
import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import wethabis from "../wethabi.json";
import swapABI from "../uniswapABI.json";
import { Select, Button } from "antd";
import { EtherInput } from "../components";
import { useHistory } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { parseEther } from "@ethersproject/units";
import LocaleProvider from "antd/lib/locale-provider";
const { ethers } = require("ethers");

const { Option } = Select;

export default function Uniswap({
  address,
  readContracts,
  writeContracts,
  providerlocal,
  blockExplorer,
  userSigner,
  mainnetProvider,
  tx,
  price,
  contractName,
  gun,
  yourLocalBalance,
}) {
  const history = useHistory();
  console.log(providerlocal);
  const chainId = 4;
  const tokenAddress = "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735";
  const decimals = 18;
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rinkeby.infura.io/v3/d21c9a0af06049d980fc5df2d149e4bb",
  );

  const DAI = new Token(chainId, tokenAddress, decimals, "DAI", "Dai Stablecoin");
  console.log(DAI);

  const UnitokenAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

  const UNI = new Token(chainId, UnitokenAddress, decimals, "UNI", "UNI Coin");
  console.log(UNI);

  // async function callFetch() {
  //   pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider);
  //   const route = new Route([pair], WETH[4]);
  //   console.log(route.midPrice.toSignificant(6)); // 201.306
  //   console.log(route.midPrice.invert().toSignificant(6));
  //   const trade = new Trade(route, new TokenAmount(WETH[4], "1000000000000000000"), TradeType.EXACT_INPUT);
  //   console.log(trade.executionPrice.toSignificant(6));
  //   console.log(trade.nextMidPrice.toSignificant(6));
  //   console.log(trade);
  //   const slippageTolerance = new Percent("50", "10000");

  //   const amountOutMin = trade.minimumAmountOut(slippageTolerance);
  //   console.log(amountOutMin);
  // const path = [WETH[DAI.chainId].address, DAI.address];
  // const to = "";
  // const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  // const value = trade.inputAmount.raw;

  // await provider.send("eth_requestAccounts", []);
  // const signer = provider.getSigner();
  // console.log(signer);
  // console.log(path);
  // console.log(amountOutMin);
  // console.log(deadline);
  // console.log(value);
  // console.log(slippageTolerance);
  // console.log(WETH[4].address);
  // console.log(abis.abi);
  // console.log(signer.address);
  // const wallet = new ethers.Wallet(ethPrivkey, provider);
  // const signer = wallet.provider.getSigner(wallet.address);

  // const weth = new ethers.Contract(WETH[4].address, abis.abi, signer);
  // console.log(weth);

  // const swapiface = new ethers.utils.Interface(swapABI.swapabi);
  // console.log(swapiface);

  // const swaptx = swapiface.encodeFunctionData("swapExactETHForTokens", [
  //   amountOutMin[1],
  //   path,
  //   "0x1b37B1EC6B7faaCbB9AddCCA4043824F36Fb88D8",
  //   deadline,
  // ]);
  // console.log(swaptx);
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

  // callFetch();
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
              <Option key="UNI">UNI</Option>
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
              console.log(amount);
              const formatamount = ethers.BigNumber.from(parseEther("" + parseFloat(amount).toFixed(12)));
              console.log(ethers.BigNumber.from(formatamount).toString());
              console.log((amount * 10 ** 18).toString());
              const stringamount = (amount * 10 ** 18).toString();
              console.log(stringamount);
              const nonce = await tx(readContracts["MultiSig"].nonce());
              console.log(nonce.toNumber());
              const wethiface = new ethers.utils.Interface(wethabis.abi);
              console.log(wethiface);

              const approveEthToUni = async () => {
                const approvetx = wethiface.encodeFunctionData("approve", [RouterContract, formatamount]);
                console.log(approvetx);

                const approvehash = await readContracts[contractName].getTransactionHash(
                  nonce,
                  WethContract,
                  0,
                  approvetx,
                );

                const approvesig = await userSigner.signMessage(ethers.utils.arrayify(approvehash));
                console.log("Signature for Approving", approvesig);

                const approverecover = await readContracts[contractName].recover(approvehash, approvesig);
                console.log(approverecover);
                console.log(providerlocal._network.chainId);

                const isOwner = await readContracts[contractName].isOwner(approverecover);
                if (isOwner) {
                  const approveresult = await gun.get(approvehash).put({
                    chainId: providerlocal._network.chainId,
                    address: readContracts[contractName].address,
                    to: WethContract,
                    amount: 0,
                    signatures: approvesig,
                    hash: approvehash,
                    data: approvetx,
                    nonce: nonce.toNumber(),
                    signers: approverecover,
                  });

                  console.log(approveresult);

                  await gun
                    .get(readContracts[contractName].address + "_" + providerlocal._network.chainId)
                    .set(approveresult);
                  approveresult.once(data => {
                    console.log("data", data);
                  });
                }
              };

              const approveEthToDai = async () => {
                const approvetx = wethiface.encodeFunctionData("approve", [RouterContract, stringamount]);
                console.log(approvetx);
                // console.log(nonce);

                const approvehash = await readContracts[contractName].getTransactionHash(
                  nonce,
                  WethContract,
                  0,
                  approvetx,
                );
                console.log("Approve Hash", approvehash);

                const approvesig = await userSigner.signMessage(ethers.utils.arrayify(approvehash));
                console.log("Signature for Approving", approvesig);

                const approverecover = await readContracts[contractName].recover(approvehash, approvesig);
                console.log(approverecover);
                console.log(providerlocal._network.chainId);

                const isOwner = await readContracts[contractName].isOwner(approverecover);
                if (isOwner) {
                  const approveresult = await gun.get(approvehash).put({
                    chainId: providerlocal._network.chainId,
                    address: readContracts[contractName].address,
                    to: WethContract,
                    amount: 0,
                    signatures: approvesig,
                    hash: approvehash,
                    data: approvetx,
                    nonce: nonce.toNumber(),
                    signers: approverecover,
                  });

                  console.log(approveresult);

                  await gun
                    .get(readContracts[contractName].address + "_" + providerlocal._network.chainId)
                    .set(approveresult);
                  approveresult.once(data => {
                    console.log("data", data);
                  });
                }
              };
              if (selectfrom == "ETH" && selectto == "DAI") {
                approveEthToDai();
              }
              if (selectfrom == "ETH" && selectto == "UNI") {
                approveEthToUni();
              }

              setTimeout(() => {
                history.push("/mainnetdai");
              }, 2000);
            }}
          >
            Approve
          </Button>

          <Button
            onClick={() => {
              //SwapExactETHforTokens

              async function EthToUni() {
                const stringamount = ethers.BigNumber.from(parseEther("" + parseFloat(amount).toFixed(12)));
                const nonce = await tx(readContracts["MultiSig"].nonce());
                const pair = await Fetcher.fetchPairData(UNI, WETH[UNI.chainId], provider);
                console.log(pair);
                const route = new Route([pair], WETH[4]);
                console.log(route);
                console.log(route.midPrice.toSignificant(6)); // 201.306
                console.log(route.midPrice.invert().toSignificant(6));
                const trade = new Trade(route, new TokenAmount(WETH[4], stringamount), TradeType.EXACT_INPUT);
                console.log(trade);
                // console.log(trade.executionPrice.toSignificant(6));
                console.log(trade.nextMidPrice.toSignificant(6));
                console.log(trade);
                const slippageTolerance = new Percent("50", "10000");

                const amountOutMin = trade.minimumAmountOut(slippageTolerance);

                const path = [WETH[UNI.chainId].address, UNI.address];
                console.log(path);
                const to = "";
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
                const value = trade.inputAmount.raw;

                const swapiface = new ethers.utils.Interface(swapABI.swapabi);
                console.log(swapiface);

                const swaptx = swapiface.encodeFunctionData("swapExactETHForTokens", [
                  0,
                  path,
                  readContracts[contractName].address,
                  deadline,
                ]);
                console.log(swaptx);

                const swaphash = await readContracts[contractName].getTransactionHash(
                  nonce,
                  RouterContract,
                  stringamount,
                  swaptx,
                );
                console.log("Swap Hash", swaphash);

                const swapsig = await userSigner.signMessage(ethers.utils.arrayify(swaphash));
                console.log("Swap Sig", swapsig);

                const swaprecover = await readContracts[contractName].recover(swaphash, swapsig);
                console.log("swap REcover signer", swaprecover);

                const swapisOwner = await readContracts[contractName].isOwner(swaprecover);

                if (swapisOwner) {
                  const swapresult = await gun.get(swaphash).put({
                    chainId: providerlocal._network.chainId,
                    address: readContracts[contractName].address,
                    to: RouterContract,
                    amount: amount,
                    signatures: swapsig,
                    hash: swaphash,
                    data: swaptx,
                    nonce: nonce.toNumber(),
                    signers: swaprecover,
                  });

                  console.log("swap Result", swapresult);

                  await gun
                    .get(readContracts[contractName].address + "_" + providerlocal._network.chainId)
                    .set(swapresult);

                  swapresult.once(data => {
                    console.log("data", data);
                  });
                }
              }

              async function EthToDai() {
                const stringamount = ethers.BigNumber.from(parseEther("" + parseFloat(amount).toFixed(12)));
                const nonce = await tx(readContracts["MultiSig"].nonce());
                const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider);
                const route = new Route([pair], WETH[4]);

                console.log(route.midPrice.toSignificant(6)); // 201.306
                console.log(route.midPrice.invert().toSignificant(6));
                const trade = new Trade(route, new TokenAmount(WETH[4], stringamount), TradeType.EXACT_INPUT);
                // console.log(trade.executionPrice.toSignificant(6));
                console.log(trade.nextMidPrice.toSignificant(6));
                console.log(trade);
                const slippageTolerance = new Percent("50", "10000");

                const amountOutMin = trade.minimumAmountOut(slippageTolerance);

                const path = [WETH[DAI.chainId].address, DAI.address];
                const to = "";
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
                const value = trade.inputAmount.raw;

                const swapiface = new ethers.utils.Interface(swapABI.swapabi);
                console.log(swapiface);

                const swaptx = swapiface.encodeFunctionData("swapExactETHForTokens", [
                  0,
                  path,
                  readContracts[contractName].address,
                  deadline,
                ]);
                console.log(swaptx);

                const swaphash = await readContracts[contractName].getTransactionHash(
                  nonce,
                  RouterContract,
                  stringamount,
                  swaptx,
                );
                console.log("Swap Hash", swaphash);

                const swapsig = await userSigner.signMessage(ethers.utils.arrayify(swaphash));
                console.log("Swap Sig", swapsig);

                const swaprecover = await readContracts[contractName].recover(swaphash, swapsig);
                console.log("swap REcover signer", swaprecover);

                const swapisOwner = await readContracts[contractName].isOwner(swaprecover);

                if (swapisOwner) {
                  const swapresult = await gun.get(swaphash).put({
                    chainId: providerlocal._network.chainId,
                    address: readContracts[contractName].address,
                    to: RouterContract,
                    amount: amount,
                    signatures: swapsig,
                    hash: swaphash,
                    data: swaptx,
                    nonce: nonce.toNumber(),
                    signers: swaprecover,
                  });

                  console.log("swap Result", swapresult);

                  await gun
                    .get(readContracts[contractName].address + "_" + providerlocal._network.chainId)
                    .set(swapresult);

                  swapresult.once(data => {
                    console.log("data", data);
                  });
                }
              }
              if (selectfrom == "ETH" && selectto == "DAI") {
                EthToDai();
              }

              if (selectfrom == "ETH" && selectto == "UNI") {
                EthToUni();
              }

              setTimeout(() => {
                history.push("/mainnetdai");
              }, 2000);
            }}
          >
            Swap
          </Button>
        </div>
      </div>
    </div>
  );
}
