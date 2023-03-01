interface arrayData {
    title: string
    description: string
    name: string
    args: string[]
    dataType: string[]
    numberOfInputs: number
}

interface Contract {
    [key: string]: arrayData[]
}


export const contractsFunctionSet: Contract = {
    nftminter: [
        {
            name: "issueToken",
            title: "Issue Token",
            description: "Raising funds up to a certain amount",
            args: ["EGLD", "ManagedBuffer", "ManagedBuffer"],
            dataType: ["EGLD | Number", "Token Name | String", "Token Ticker | Number"],
            numberOfInputs:0
        },
        {
            name: "createNft",
            title: "Create NFT",
            description: "Raising funds up to a certain amount",
            args: ["ManagedBuffer", "ManagedBuffer"],
            dataType: ["Name | String", "Uri | String"],
            numberOfInputs:3
        },
    ],
    tokenswap: [
        {
            name: "deposit_egld",
            title: "Deposit Egld",
            description: "Raising funds up to a certain amount",
            args: ["EGLD"],
            dataType: ["EGLD | Number"],
            numberOfInputs:0
        },
        {
            name: "claim_egld",
            title: "Claim Egld",
            description: "Raising funds up to a certain amount",
            args: ["EGLD(Optional)"],
            dataType: ["EGLD | Number (Optional)"],
            numberOfInputs:1
        },
        {
            name: "claim_esdt",
            title: "Claim Esdt",
            description: "Raising funds up to a certain amount",
            args: ["ESDT(Optional)"],
            dataType: ["ESDT | Number (Optional)"],
            numberOfInputs:2
        },
        {
            name: "egld_esdt_swap",
            title: "EGLD ESDT Swap",
            description: "Raising funds up to a certain amount",
            args: ["EGLD"],
            dataType: ["EGLD | Number"],
            numberOfInputs:3
        },
        {
            name: "esdt_egld_swap",
            title: "ESDT EGLD Swap",
            description: "Raising funds up to a certain amount",
            args: ["ESDT"],
            dataType: ["ESDT | Number"],
            numberOfInputs:4
        },
        {
            name: "set_exchange_rate",
            title: "Set Exchange Rate",
            description: "Raising funds up to a certain amount",
            args: ["U64"],
            dataType: ["Rate | Number"],
            numberOfInputs:5
        },
    ],
    nftauction: [
        {
            name: "start_auction",
            title: "Start Auction",
            description: "Raising funds up to a certain amount",
            args: ["BigUint", "U64", "U64"],
            dataType: ["Starting Price | Number", "Deadline | Number", "Nonce | Number"],
            numberOfInputs:0
        },
        {
            name: "send_bid",
            title: "Send Bid",
            description: "Raising funds up to a certain amount",
            args: ["EGLD"],
            dataType: ["EGLD | Number",],
            numberOfInputs:3
        },
        {
            name: "claim",
            title: "Claim funds",
            description: "Raising funds up to a certain amount",
            args: [],
            dataType: ["No input required"],
            numberOfInputs:4
        },
    ],
    crowdfunding: [
        {
            name: "fund",
            title: "Send funds",
            description: "Raising funds up to a certain amount",
            args: ["EGLD"],
            dataType: ["EGLD | Number"],
            numberOfInputs:0
        },
        {
            name: "claim",
            title: "Claim funds",
            description: "Raising funds up to a certain amount",
            args: [],
            dataType: ["No input required"],
            numberOfInputs:1
        },
    ],
    lottery: [
        {
            name: "start_lottery",
            title: "Start Lottery",
            description: "Raising funds up to a certain amount",
            args: ["U64", "BigUint", "U64"],
            dataType: ["Deadline | Number", "Ticket Price | Number", "Max Entries Per User | Number"],
            numberOfInputs:0
        },
        {
            name: "buy_ticket",
            title: "Buy Ticket",
            description: "Raising funds up to a certain amount",
            args: [],
            dataType: ["No input required"],
            numberOfInputs:3
        },
        {
            name: "get_winner_and_send_prize",
            title: "Get Winner And Send Prize",
            description: "Raising funds up to a certain amount",
            args: [],
            dataType: ["No input required"],
            numberOfInputs:3
        },
    ],
    tokensminter: [
        {
            name: "issue_token",
            title: "Issue Token",
            description: "Raising funds up to a certain amount",
            args: ["EGLD", "BigUint", "ManagedBuffer"],
            dataType: ["EGLD | Number", "Token Display Name | String", "Token Ticker | Number"],
            numberOfInputs:0
        },
        {
            name: "claim_tokens",
            title: "Claim Tokens",
            description: "Raising funds up to a certain amount",
            args: ["BigUint"],
            dataType: ["Initial Supply | Number"],
            numberOfInputs:3
        },
    ],
    vote: [
        {
            name: "start_vote",
            title: "Start Vote",
            description: "Raising funds up to a certain amount",
            args: ["EGLD", "ManagedBuffer", "ManagedBuffer"],
            dataType: ["Deadline | String", "Title | String", "Description | String"],
            numberOfInputs:0
        },
    ]
}