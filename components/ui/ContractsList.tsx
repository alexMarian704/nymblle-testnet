import { Box, Flex, Text } from '@chakra-ui/react'
import React, { FC, useEffect, useState } from 'react'
import ContractDiv from './ContractDiv';
import { dataContracts } from "../../config/data"

interface ContractsListProps {
    title: string;
    description?: string;
    numberOfContracts: number;
    onOpen:any
    setInput:any
}

const ContractsList: FC<ContractsListProps> = ({
    title, description, numberOfContracts, onOpen, setInput
}) => {
    const [contractPush, setContractPush] = useState<any[]>([])

    useEffect(() => {
        let pushDiv: any[] = []
        let nr;
        if (title === "NFTs") {
            nr = dataContracts.nft.length;
        } else if (title === "Tokens") {
            nr = dataContracts.tokens.length;
        } else {
            nr = dataContracts.dapps.length;
        }
        for (let i = 0; i < nr; i++) {
            if (title === "NFTs") {
                pushDiv.push(
                    <ContractDiv key={i} title={dataContracts.nft[i].title} description={dataContracts.nft[i].description} icon={dataContracts.nft[i].icon} onOpen={onOpen} setInput={setInput} />
                )
            } else if (title === "Tokens") {
                pushDiv.push(
                    <ContractDiv key={i} title={dataContracts.tokens[i].title} description={dataContracts.tokens[i].description} icon={dataContracts.tokens[i].icon} onOpen={onOpen} setInput={setInput}/>
                )
            } else {
                pushDiv.push(
                    <ContractDiv key={i} title={dataContracts.dapps[i].title} description={dataContracts.dapps[i].description} icon={dataContracts.dapps[i].icon} onOpen={onOpen} setInput={setInput}/>
                )
            }
        }
        setContractPush([...pushDiv])
    }, [])

    return (
        <Box
            marginTop="40px"
        >
            <Text
                fontSize="calc(24px + 0.1vw)"
                fontWeight="600"
            >{title}</Text>
            <Text
                fontSize="calc(14px + 0.1vw)"
                fontWeight="400"
                color="rgb(210,210,210)"
            >{description}</Text>
            <section className='contractsFlex'>
                {contractPush}
            </section>
        </Box>
    )
}

export default ContractsList