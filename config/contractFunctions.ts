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
            title: "Get Egld Balance",
            description: "Create collection of unique NFTs.",
        },
        {
            name: "getEsdtBalance",
            title: "Get Esdt Balance",
            description: "Swap EGLD with another token, with a fixed rate",
        },
    ],
    nftauction: [
        {
            name: "getStartingPrice",
            title: "Get Starting Price",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getLastPrice",
            title: "Get Last Price",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getDeadline",
            title: "Get Deadlinen",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getBid",
            title: "Get Bid",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getNft",
            title: "Get Nft",
            description: "Let users bid on your NFT, the highest bid wins",
        },
        {
            name: "getWinner",
            title: "Get Winner",
            description: "Let users bid on your NFT, the highest bid wins",
        },
    ],
    crowdfunding: [
        {
            name: "getCurrentFunds",
            title: "Get Current Funds",
            description: "Raising funds up to a certain amount",
        },
        {
            name: "getTarget",
            title: "Get Target",
            description: "Raising funds up to a certain amount",
        },
        {
            name: "getDeadline",
            title: "Get Deadline",
            description: "Raising funds up to a certain amount",
        },
        {
            name: "getStatus",
            title: "Get Status",
            description: "Raising funds up to a certain amount",
        },
    ],
    lottery: [
        {
            name: "getStatus",
            title: "Get Status",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getDeadline",
            title: "Get Deadlin",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getMaxEntries",
            title: "Get Max Entries",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getParticipants",
            title: "Get Participants",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getTicketPrice",
            title: "Get Ticket Price",
            description: "Users buy tickets, only one wins",
        },
    ],
    tokensminter:[

    ],
    vote:[
        {
            name: "getDeadline",
            title: "Get Deadline",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getHistory",
            title: "Get History",
            description: "Users buy tickets, only one wins",
        },
        // {
        //     name: "getContent",
        //     title: "Get Content",
        //     description: "Users buy tickets, only one wins",
        // },
        {
            name: "getParticipants",
            title: "Get Participants",
            description: "Users buy tickets, only one wins",
        },
        {
            name: "getStatus",
            title: "Get Status",
            description: "Users buy tickets, only one wins",
        },
    ]
}