import { Text } from '@chakra-ui/react'
import React, { FC } from 'react'
import { useRouter } from "next/router"

interface ContractsDivProps {
    title: string;
    description?: string;
    icon?: string;
    onOpen:any
    setInput:any
}

const ContractDiv: FC<ContractsDivProps> = ({
    title , description , icon, onOpen, setInput
}) => {
    const router = useRouter();

    return (
        <div className="contractCard" >
            <div className='pushBlock' onClick={()=> router.push(`/${title.replace(/ /g,'').toLowerCase()}`)}></div>
            <div>
                <i className={icon}></i>
            </div>
            <Text
                as="h3"
                width="100%"
                fontSize="calc(20px + 0.1vw)"
                fontWeight="700"
            >{title}</Text>
            <Text
                as="p"
                width="100%"
                fontSize="calc(14px + 0.1vw)"
                fontWeight="400"
                color="rgb(170,170,170)"
                paddingLeft="1px"
            >{description}</Text>
            <button onClick={()=>{
                setInput(title.replace(/ /g,'').toLowerCase())
                onOpen();
            }}>Deploy</button>
        </div>
    )
}

export default ContractDiv