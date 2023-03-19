import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import React, { FC, useCallback, useEffect, useState } from 'react'
import ContractsList from './ContractsList'
import { contractsCode } from "../../config/contractsCode"
import { Address, AddressValue, BigUIntType, BigUIntValue, Code, CodeMetadata, ContractCallPayloadBuilder, ContractFunction, NullType, ResultsParser, SmartContract, TokenIdentifierValue, Transaction, U64Value, U8Value } from "@elrondnetwork/erdjs";
import { getNetworkState } from '../../store/network';
import { accountState } from '../../store/auth';
import { useSnapshot } from 'valtio';
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { useScTransaction } from '../../hooks/core/useScTransaction';
import supabase from '../../config/supabaseConfig';
import { shortenHash } from '../../utils/shortenHash';

interface InputType {
    [key: string]: string
}

interface ContractsMainProps {
    chainState?: any
}

const ContractsMain: FC<ContractsMainProps> = ({ chainState }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const accountSnap = useSnapshot(accountState);
    const { pending, triggerTx, transaction, error } = useScTransaction({})
    const [input, setInput] = useState("")
    const [inputValue, setInputValue] = useState<InputType>({
        input1: "",
        input2: "",
    })
    const [name, setName] = useState("")
    const [claim, setClaim] = useState("")
    const [pendingClaim, setPendingClaim] = useState(false);
    const [deleteError, setDeleteError] = useState(0);
    const [inputError, setInputError] = useState("");
    const apiNetworkProvider = getNetworkState<ApiNetworkProvider>('apiNetworkProvider')

    useEffect(() => {
        const getAddressPush = async () => {
            if (pending !== false && transaction !== null && error === "") {
                let contractAddress = new Address("erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua");
                let contract = new SmartContract({ address: contractAddress });
                let userAddress = new Address(accountSnap.address);

                let query = contract.createQuery({
                    func: new ContractFunction("getScAddress"),
                    args: [new AddressValue(userAddress)],
                    caller: new Address(accountSnap.address)
                });

                let resultsParser = new ResultsParser()
                let queryResponse = await apiNetworkProvider.queryContract(query)
                let bundle = resultsParser.parseUntypedQueryResponse(queryResponse);
                //console.log(bundle.values[0].toString('hex'));
                const userContractAddress = new Address(bundle.values[0].toString('hex')).bech32()

                const { data: queryData, error: queryError } = await supabase
                    .from("contracts")
                    .select()
                    .eq('address', userContractAddress)
                if (queryData?.length === 0) {
                    const { data, error } = await supabase
                        .from("contracts")
                        .insert([{ user: accountSnap.address, name: name.trim(), contract_type: input, network: chainState, address: userContractAddress }])
                    setClaim(userContractAddress)
                }
            }
        }
        getAddressPush()
    }, [transaction])

    useEffect(() => {
        if (pendingClaim === true && pending === false && transaction !== null) {
            setClaim('')
            setPendingClaim(false)
        }
    }, [pending])

    useEffect(() => {
        if (error !== "" && deleteError === 0) {
            setDeleteError(1)
        }
    }, [error])

    useEffect(() => {
        if (error !== "" && deleteError === 1) {
            setTimeout(() => {
                setDeleteError(0)
            }, 2000)
        }
    }, [deleteError])

    const handleContractInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue({
            ...inputValue,
            [e.target.name]: value
        })
    }

    const sendSCTransaction = useCallback(async () => {
        let argumentsInit: any[] = []
        let hasInputError = false;

        const { data, error } = await supabase
            .from("contracts")
            .select()
            .eq('user', accountSnap.address)
            .eq('name', name.trim())
        
        if(name.trim().length === 0){
            setInputError("Name input needs to be completed")
        }else if(name.trim().length > 14){
            setInputError("Your contract name is too long")
        }else if (data?.length === 0) {
            switch (input) {
                case "tokenswap":
                    if (inputValue.inpu1 !== "" && inputValue.input2 !== "") {
                        argumentsInit = [
                            new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq7ax3xrkh2dh4scjayuj72wcx9046h442n60qrxkgs7")),
                            new TokenIdentifierValue(inputValue.input1),
                            new U64Value(Number(inputValue.input2)),
                        ]
                    } else {
                        hasInputError = true;
                    }
                    break;
                case "lottery":
                    argumentsInit = [
                        new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq7a7gwazshz3x727lvw60mzx6xd68z4n4n60qzxsa63")),
                    ]
                    break;
                case "nftminter":
                    argumentsInit = [
                        new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq4eh72fx9zxtkcrqkfdz320l07jyd0uevn60qlhhmk3")),
                    ]
                    break;
                case "crowdfunding":
                    if (inputValue.inpu1 !== "" && inputValue.input2 !== "") {
                        console.log(Math.ceil(Number((new Date().getTime()) / 1000 + Number(inputValue.input2) * 24 * 60 * 60)))
                        argumentsInit = [
                            new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqcjgrpxjgxy7e2wuquhd0pryvxenc7l48n60q0k2w0y")),
                            new BigUIntValue(Number(inputValue.input1)),
                            new U64Value(Math.ceil(Number((new Date().getTime()) / 1000 + Number(inputValue.input2) * 24 * 60 * 60)))
                        ]
                    } else {
                        hasInputError = true;
                    }
                    break;
                case "nftauction":
                    argumentsInit = [
                        new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqa4r534s9y7zu8f8zx23pvl3rt4uctzmvn60qv47jvj")),
                    ]
                    break;
                case "tokensminter":
                    argumentsInit = [
                        new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqamd2l8e3yct0n6he5vy67llq34m72ffrn60qjt2kz4")),
                    ]
                    break;
                case "vote":
                    argumentsInit = [
                        new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqez3l87u6c8gl04ktptmfl63uryd3smm2n60qp343l8")),
                    ]
                    break;
                default:
                    argumentsInit = []
                    break;
            }

            let ca = "erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua"
            let contractfunction = new ContractFunction("deploy_contract")

            if (hasInputError === false) {
                triggerTx({
                    smartContractAddress: ca,
                    func: contractfunction,
                    gasLimit: 80000000,
                    args: argumentsInit,
                    value: Number(0)
                }).catch((err) => {
                    console.log(err)
                })
                //setName('')
                setInputError("")
                setInputValue({
                    input1: "",
                    input2: ""
                })
                onClose()
            } else {
                setInputError("Inputs needs to be completed")
            }
        } else {
            setInputError("You already have a contract with this name")
        }
    }, [triggerTx]);

    const claimContract = () => {
        let ca = "erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua"
        let contractfunction = new ContractFunction("claim_ownership")
        let args: any[] = [new AddressValue(new Address(claim))];

        triggerTx({
            smartContractAddress: ca,
            func: contractfunction,
            gasLimit: 100000000,
            args: args,
            value: Number(0)
        }).catch((err) => {
            console.log(err)
        })
        //setClaim('');
        setPendingClaim(true)
    }

    return (
        <Box
            as='section'
            width="100%"
            maxWidth="1248px"
            marginTop="40px"
        >
            <h2 style={{
                fontSize: "calc(46px + 0.2vw)",
                fontWeight: "800"
            }}>Contracts List</h2>
            <p style={{
                marginTop: "-4px",
                paddingLeft: "1px",
                fontSize: "calc(16px + 0.1vw)",
                color: "rgb(210,210,210)"
            }}>Find the best smart contract for you. Deploy easily with one click.</p>
            <div>
                <ContractsList title='NFTs' description='NFT Collections and everything else NFT-related.' numberOfContracts={3} onOpen={onOpen} setInput={setInput} />
                <ContractsList title='Tokens' description='Mint and Swap Tokens.' numberOfContracts={3} onOpen={onOpen} setInput={setInput} />
                <ContractsList title='Dapps' description='Create and manage your own Dapps.' numberOfContracts={2} onOpen={onOpen} setInput={setInput} />
            </div>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                isCentered
            >
                <ModalOverlay />
                <ModalContent style={{
                    background: "rgb(16,16,16)"
                }}>
                    <ModalHeader>Contract Data</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="contractInputs">
                            <label>Name</label>
                            <input type="text" value={name} onChange={(e) => {
                                setName(e.target.value)
                            }} />
                        </div>
                        {input !== "" && contractsCode[input] && contractsCode[input][0].input?.length === 0 && <div>
                            <p style={{
                                width: "100%",
                                textAlign: "center",
                                fontSize: "calc(17px + 0.1vw)"
                            }}>No input required</p>
                        </div>}
                        {input !== "" && contractsCode[input] && contractsCode[input][0].input?.length! > 0 && contractsCode[input][0].input?.map((input, i) => {
                            return (
                                <div key={i} className="contractInputs">
                                    <label>{input.label}</label>
                                    <input name={`input${i + 1}`} type="text" value={inputValue[`input${i + 1}`]} onChange={handleContractInput} />
                                </div>
                            )
                        })}
                        {inputError !== "" && <p style={{
                            color: "red",
                            width: "100%",
                            textAlign: "center",
                            marginTop: "7px"
                        }}>{inputError}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <button className="deployModalButton" onClick={sendSCTransaction}><i className="bi bi-lightning-charge-fill" style={{
                            color: "#00e673",
                            fontSize: "calc(16px + 0.1vw)",
                            marginRight: "2px"
                        }}></i>Deploy</button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {
                pending === true && claim === "" && <div className='loadingContainer'>
                    <Spinner
                        speed='0.9s'
                        width="170px"
                        height="170px"
                        thickness='17px'
                        color='rgb(3,151,91)'
                        marginBottom="20px"
                    />
                    <p>Transaction loading....</p>
                    <p>Please wait</p>
                </div>
            }
            {claim !== "" && <div className='loadingContainer'>
                {pending === false && <i className="bi bi-file-arrow-up"></i>}
                {pending === true && <Spinner
                    speed='0.9s'
                    width="170px"
                    height="170px"
                    thickness='17px'
                    color='rgb(3,151,91)'
                    marginBottom="20px"
                />}
                <p>Contract Address: {shortenHash(claim, 7)} <i onClick={() => {
                    navigator.clipboard.writeText(claim)
                }} style={{
                    marginLeft: "4px",
                    fontSize: "calc(19px + 0.1vw)",
                    color: "rgb(3,171,91)",
                    cursor: "pointer"
                }} className="bi bi-back"></i></p>
                {pending === false && <button style={{
                    padding: "6px 18px 6px 18px"
                }} onClick={claimContract}>Claim Ownership</button>}
                {pending === true && <p>Transaction loading....</p>}
                {pending === true && <p>Please wait</p>}
            </div>}
            {
                error !== "" && pending === false && deleteError === 1 && <div className='loadingContainer'>
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <p>Something went wrong</p>
                </div>
            }
        </Box >
    )
}

export default ContractsMain