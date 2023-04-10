import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div className="flex flex-row p-3 border-b-2 ">
            <h1 className="flex flex-grow p-2 font-semibold">Decentralized Lottery</h1>
            <ConnectButton />
        </div>
    )
}
