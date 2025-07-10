/* eslint-disable no-undef */
// async function main() {
//   const [deployer] = await ethers.getSigners();
//   console.log("Deploying contracts with the account:", deployer.address);

//   const ToDo = await ethers.getContractFactory("ToDo");
//   const todo = await ToDo.deploy();
//   await todo.deployed();

//   console.log("ToDo contract deployed to:", todo.address);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
// });


require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contractArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/ToDo.sol/ToDo.json"));
    const contractFactory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, wallet);

    console.log("Deploying contract...");
    const contract = await contractFactory.deploy();

    await contract.waitForDeployment();
    console.log("Contract deployed at:", await contract.getAddress());
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});