import { Button, Col, Menu, Row, Alert } from "antd";
import "antd/dist/antd.css";
import { useEventListener } from "eth-hooks/events/useEventListener";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import {
  Account,
  Contract,
  Faucet,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
  CreateNewMultisig,
  WalletConnectInput,
} from "./components";
import { NETWORKS, ALCHEMY_KEY, NETWORK, BACKEND_URL } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, ExampleUI, Hints, Subgraph, Pool, Uniswap } from "./views";
import { useStaticJsonRPC } from "./hooks";
import { Select } from "antd";

const { ethers } = require("ethers");
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

const configuredNetworks = ["mainnet", "matic", "arbitrum", "optimism", "xdai", "rinkeby"];
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  configuredNetworks.push("localhost");
}

const cachedNetwork = window.localStorage.getItem("network");
if (DEBUG) console.log("📡 Connecting to New Cached Network: ", cachedNetwork);

/// 📡 What chain are your contracts deployed to?
let targetNetwork = NETWORKS[cachedNetwork || "mainnet"];
console.log("target Network is ", targetNetwork);

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks

  const networkOptions = ["mainnet", "matic", "Arbitrum", "optimism", "xdai", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  console.log("local Provider is ", localProvider);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;
  console.log(userSigner);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */
  const contractName = "MultiSig";
  const contractAddress = readContracts[contractName] && readContracts[contractName].address;

  const nonce = useContractReader(readContracts, "MultiSig", "nonce");
  // console.log(nonce.toNumber());
  // const nonce = ethers.BigNumber.from(nonceBig).toNumber();
  // const ownerEvents = useEventListener(readContracts, contractName, "Owner", localProvider, 1);

  // calls();
  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
    localChainId,
    myMainnetDAIBalance,
  ]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 130, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 130, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                <p>
                  You have <b>{networkSelected && networkSelected.name}</b> selected.
                </p>
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);
                    // try to add new chain
                    try {
                      await ethereum.request({ method: "wallet_addEthereumChain", params: data });
                    } catch (error) {
                      // if failed, try a network switch instead
                      await ethereum
                        .request({
                          method: "wallet_switchEthereumChain",
                          params: [
                            {
                              chainId: "0x" + targetNetwork.chainId.toString(16),
                            },
                          ],
                        })
                        .catch();
                      if (tx) {
                        console.log(tx);
                      }
                    }
                  }}
                >
                  <b>Click here to switch to {networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = <span></span>;
  }

  const options = [];
  const networkList = Object.keys(NETWORKS);
  for (var i = 0; i < configuredNetworks.length; i++) {
    const networkName = configuredNetworks[i];
    if (networkList.indexOf(networkName) > -1) {
      options.push(
        <Select.Option key={networkName} value={NETWORKS[networkName].name}>
          <span role="img" aria-label={"smile"} style={{ color: NETWORKS[networkName].color, fontSize: 20 }}>
            {NETWORKS[networkName].name}
          </span>
        </Select.Option>,
      );
    }
  }

  const networkSelect = (
    <Select
      size="large"
      defaultValue={targetNetwork.name}
      style={{ textAlign: "left", width: 140, fontSize: 30 }}
      onChange={value => {
        console.log(targetNetwork.name);
        console.log(targetNetwork.chainId);
        console.log(value);
        console.log(NETWORKS[value]);
        if (targetNetwork.chainId !== NETWORKS[value].chainId) {
          window.localStorage.setItem("network", value);
          setTimeout(async () => {
            targetNetwork = NETWORKS[value];

            const ethereum = window.ethereum;
            const data = [
              {
                chainId: "0x" + targetNetwork.chainId.toString(16),
                chainName: targetNetwork.name,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: [targetNetwork.rpcUrl],
                blockExplorerUrls: [targetNetwork.blockExplorer],
              },
            ];
            console.log("data", data);
            // try to add new chain
            try {
              await ethereum.request({ method: "wallet_addEthereumChain", params: data });
            } catch (error) {
              // if failed, try a network switch instead
              await ethereum
                .request({
                  method: "wallet_switchEthereumChain",
                  params: [
                    {
                      chainId: "0x" + targetNetwork.chainId.toString(16),
                    },
                  ],
                })
                .catch();
              if (tx) {
                console.log(tx);
              }
            }
            window.location.reload();
          }, 1000);
        }
      }}
    >
      {options}
    </Select>
  );

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;
  const signaturesRequired = useContractReader(readContracts, contractName, "signaturesRequired");

  console.log(localProvider);

  const Executetransactionevents = useEventListener(
    readContracts,
    contractName,
    "ExecuteTransaction",
    localProvider,
    1,
  );
  console.log(localProvider);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {/* <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      /> */}
      {/* <span className="flex inline-flex sm:ml-auto sm:mt-0 flex-col lg:flex-row ml-2">
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
          networkSelect={networkSelect}
          networkDisplay={networkDisplay}
        />
      </span> */}
      <div style={{ position: "absolute", left: "20" }}>
        <CreateNewMultisig
          address={address}
          mainnetProvider={mainnetProvider}
          localProvider={localProvider}
          NETWORKS={NETWORKS}
        />
      </div>

      <Menu style={{ textAlign: "center", marginTop: 40 }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">Multi Sig</Link>
        </Menu.Item>
        <Menu.Item key="/signers">
          <Link to="/signers">Owners</Link>
        </Menu.Item>
        <Menu.Item key="/proposetransaction">
          <Link to="/proposetransaction">Create</Link>
        </Menu.Item>
        <Menu.Item key="/pendingtransaction">
          <Link to="/pendingtransaction">Pool</Link>
        </Menu.Item>
        <Menu.Item key="/uniswap">
          <Link to="/uniswap">Uniswap</Link>
        </Menu.Item>
        <Menu.Item key="/debug">
          <Link to="/debug">Debug Contracts</Link>
        </Menu.Item>
      </Menu>
      <Switch>
        <Route exact path="/">
          <Home
            contractAddress={contractAddress}
            yourLocalBalance={yourLocalBalance}
            readContracts={readContracts}
            contractName={contractName}
            mainnetProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            price={price}
            contractConfig={contractConfig}
            provider={localProvider}
            address={address}
            Executetransactionevents={Executetransactionevents}
          />
        </Route>
        <Route exact path="/debug">
          <Contract
            name="MultiSig"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>
        <Route path="/signers">
          <Hints
            contractAddress={contractAddress}
            poolServerUrl={BACKEND_URL}
            address={address}
            yourLocalBalance={yourLocalBalance}
            mainnetProvider={mainnetProvider}
            price={price}
            readContracts={readContracts}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
            contractName={contractName}
            tx={tx}
            userSigner={userSigner}
            localProvider={localProvider}
            signaturesRequired={signaturesRequired}
            // ownerEvents={ownerEvents}
          />
        </Route>
        <Route path="/proposetransaction">
          <ExampleUI
            contractAddress={contractAddress}
            poolServerUrl={BACKEND_URL}
            address={address}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            price={price}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            purpose={purpose}
            contractName={contractName}
          />
        </Route>
        <Route path="/pendingtransaction">
          <Pool
            contractAddress={contractAddress}
            poolServerUrl={BACKEND_URL}
            userSigner={userSigner}
            contractName={contractName}
            localProvider={localProvider}
            ensProvider={mainnetProvider}
            writeContracts={writeContracts}
            readContracts={readContracts}
            address={address}
            blockExplorer={blockExplorer}
            tx={tx}
            nonce={nonce}
            signaturesRequired={signaturesRequired}
          />
        </Route>
        <Route path="/uniswap">
          <Uniswap
            readContracts={readContracts}
            contractName={contractName}
            mainnetProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            price={price}
            contractConfig={contractConfig}
            providerlocal={localProvider}
            address={address}
            userSigner={userSigner}
            tx={tx}
            price={price}
            contractName={contractName}
            nonce={nonce}
            yourLocalBalance={yourLocalBalance}
          />
        </Route>
      </Switch>
      <ThemeSwitch />
      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          {USE_NETWORK_SELECTOR && (
            <div style={{ marginRight: 20 }}>
              <NetworkSwitch
                networkOptions={networkOptions}
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
              />
            </div>
          )}
          <Account
            address={address}
            localProvider={localProvider}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
            networkSelect={networkSelect}
            networkDisplay={networkDisplay}
          />
        </div>
        {yourLocalBalance.lte(ethers.BigNumber.from("0")) && (
          <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
        )}
      </div>
      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
