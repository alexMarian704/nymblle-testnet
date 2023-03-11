interface arrayData {
    title: string
    description: string
    name: string
}

interface Contract {
    [key: string]: arrayData[]
}


export const contractsFunctionGet: Contract = {
    nftminter: [
        
    ],
    tokenswap: [
        {
            name: "getEgldBalance",
            title: "Egld Balance",
            description: "Create collection of unique NFTs.",
        },
        {
            name: "getEsdtBalance",
            title: "Esdt Balance",
            description: "Swap EGLD with another token, with a fixed rate",
        },
    ],
    nftauction: [
        {
            name: "getStatus",
            title: "Status",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getStartingPrice",
            title: "Starting Price",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getLastPrice",
            title: "Last Price",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getDeadline",
            title: "Deadlinen",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getBid",
            title: "Bid",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getNft",
            title: "Get Nft",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getWinner",
            title: "Winner",
            description: "Let users bid on your NFT, the highest bid wins",
        },
    ],
    crowdfunding: [
        {
            name: "getCurrentFunds",
            title: "Current Funds",
            description: "Raising funds up to a certain amount",
        },
        {
            name: "getTarget",
            title: "Target",
            description: "Raising funds up to a certain amount",
        },
        {
            name: "getDeadline",
            title: "Deadline",
            description: "Raising funds up to a certain amount",
        },
        {
            name: "getStatus",
            title: "Status",
            description: "Raising funds up to a certain amount",
        },
    ],
    lottery: [
        {
            name: "getStatus",
            title: "Status",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getDeadline",
            title: "Deadlin",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getMaxEntries",
            title: "Max Entries",
            description: "Users buy tickets, only one wins",
        },
        // {
        //     name: "getParticipants",
        //     title: "Get Participants",
        //     description: "Users buy tickets, only one wins",
        // },
        {
            name: "getTicketPrice",
            title: "Ticket Price",
            description: "Users buy tickets, only one wins",
        },
    ],
    tokensminter:[

    ],
    vote:[
        // {
        //     name: "getHistory",
        //     title: "Get History",
        //     description: "Users buy tickets, only one wins",
        // },
        {
            name: "getParticipants",
            title: "Participants",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getDeadline",
            title: "Deadline",
            description: "Users buy tickets, only one wins",
        },
        // {
        //     name: "getContent",
        //     title: "Get Content",
        //     description: "Users buy tickets, only one wins",
        // },
        {
            name: "getStatus",
            title: "Status",
            description: "Users buy tickets, only one wins",
        },
    ]
}