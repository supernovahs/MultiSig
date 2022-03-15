const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("YourContract", function () {
    it("Should deploy YourContract", async function () {
      const YourContract = await ethers.getContractFactory("MultiSig");
      myContract = await YourContract.deploy(31337,1);
      await myContract.deployed();
      const a = await myContract.addSigner("0x823dA057fF623f369AF8d09ffDbe6b00A3a4d870",2);
      const b = await myContract.addSigner("0xA2af723B628020e9D36a5E0d676579ecA86F1103",3);
      const c = await myContract.removeSigner("0x823dA057fF623f369AF8d09ffDbe6b00A3a4d870",2);

      const z= await myContract.addSigner("0x1b37B1EC6B7faaCbB9AddCCA4043824F36Fb88D8",4);
      const zz= await myContract.addSigner("0x54E988f75F9134715763Cb0e05D8aD82005670dc",5);
      const zzz= await myContract.addSigner("0xf092EC608Af9b4c5f7B3971001A53Fe5010Fc451",6);
      const k= await myContract.removeSigner("0x1b37B1EC6B7faaCbB9AddCCA4043824F36Fb88D8",5);
      const owners = await myContract.getOwners();
      const d = await myContract.removeSigner("0xA2af723B628020e9D36a5E0d676579ecA86F1103",2);

    });
  });
});
