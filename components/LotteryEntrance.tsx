import { abi, contractAddresses } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { Provider, useEffect, useState } from "react"
import { BigNumber, ethers, ContractTransaction, ContractInterface, Signer } from "ethers"
import { useNotification } from "web3uikit"

interface contractAddressesInterface {
    [key: string]: string[]
}

export default function LotteryEntrance() {
    const addresses: contractAddressesInterface = contractAddresses
    const { chainId: chainIdHex, isWeb3Enabled, web3 } = useMoralis()
    const chainId = parseInt(chainIdHex!)
    const raffleAddress = chainId in addresses ? addresses[chainId][0] : undefined
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEnteranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEnteranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = ((await getEnteranceFee()) as BigNumber).toString()
        const numPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString()
        const recentWinnerFromCall = (await getRecentWinner()) as string
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    const checkEvents = async () => {
        try {
            const raffle = new ethers.Contract(
                raffleAddress!,
                abi as ContractInterface,
                web3 as ethers.providers.Provider
            )
            console.log(raffle)
            raffle.on("WinnerPicked", () => updateUI())
        } catch (e) {
            console.log(e)
        }
    }

    const handleSuccess = async (tx: ContractTransaction) => {
        try {
            await tx.wait(1)
            updateUI()
            handleNewNotification()
            checkEvents()
        } catch (e) {
            console.log(e)
        }
    }
    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "TransactionComplete",
            title: "Tx Notification",
            position: "topR",
        })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <p>hi from lottery</p>
            {raffleAddress ? (
                <div>
                    <p>
                        this is the entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")}{" "}
                        ETH.
                    </p>
                    <p>this many people entered the raffle: {numPlayers}.</p>
                    <p>this is the most recent winner: {recentWinner}.</p>
                    <button
                        className="bg-blue-500 hover:bg-blue-700  text-white font-bold py-2 px-4 rounded"
                        onClick={async () =>
                            await enterRaffle({
                                onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                                onError: (e) => console.log(e),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                </div>
            ) : (
                <div>
                    <p>No raffle address detected</p>
                </div>
            )}
        </div>
    )
}
