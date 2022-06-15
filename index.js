import {ethers} from "./ethers.js";
import { abi, contractAddress } from "./constants.js";
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethInput =  document.getElementById("ethAmountInput");
const balanceBtn = document.getElementById("balanceBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceBtn.onclick = get_balance;
withdrawBtn.onclick = withdraw;



async function connect(){
    if (typeof window.ethereum !== "undefined"){
        console.log("I see a Metamask!");
        const accounts = await window.ethereum.request ({method: "eth_requestAccounts"});
        console.log(accounts);
        connectButton.innerHTML = "Connected!";
    }else{
        connectButton.innerHTML = "Please, install Metamask";
    };
};
async function fund(){
const ethAmount = ethInput.value;
console.log(`Funding with ${ethAmount}`);
if (typeof window.ethereum !== "undefined"){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract =await new ethers.Contract(contractAddress, abi, signer);
    try{
    console.log(contract);
    const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      console.log(transactionResponse);
      await listenForTxToMine(transactionResponse, provider);
      console.log("Done");
    } catch(e) {
        console.log(e);
    }
    
}
}
function listenForTxToMine(transactionResponse, provider){
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve,reject)=>{
        provider.once(transactionResponse.hash, (transactionReceipt)=>{
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        });
    })
    
};
async function get_balance(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract =await new ethers.Contract(contractAddress, abi, signer);
    const balance = await contract.provider.getBalance(contract.address);
    console.log(`Contract balance is ${ethers.utils.formatEther(balance)} ETH`);
}
async function withdraw(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await new ethers.Contract(contractAddress, abi, signer);
    try{
    const transactionResponse = await contract.withdraw();
    await listenForTxToMine(transactionResponse,provider);
    console.log("All funds withdrawn!")
    }
    catch(e){
        console.log(e);
    };
}