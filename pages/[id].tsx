import { Box, Text, Flex, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Spinner } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react'
import { FC } from 'react';
import { Authenticated } from '../components/tools/Authenticated';
import { LoginModalButton } from '../components/tools/LoginModalButton';
import { HeaderMenu } from '../components/ui/HeaderMenu';
import { HeaderMenuButtons } from '../components/ui/HeaderMenuButtons';
import { MainLayout } from '../components/ui/MainLayout';
import { changeChain } from '../config/network';
import dynamic from 'next/dynamic'
import { contractsCode } from '../config/contractsCode'
import { useRouter } from 'next/router'
import { Address, AddressValue, BigUIntType, BigUIntValue, Code, CodeMetadata, ContractFunction, NullType, ResultsParser, SmartContract, TokenIdentifierValue, Transaction, U64Value, U8Value } from "@elrondnetwork/erdjs";
import { useScTransaction } from '../hooks/core/useScTransaction';
import { shortenHash } from '../utils/shortenHash';
import { useSnapshot } from 'valtio';
import { accountState } from '../store/auth';
import supabase from '../config/supabaseConfig';
import { getNetworkState } from '../store/network';
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';

const SyntaxHighlighter = dynamic(import('react-syntax-highlighter/dist/esm/default-highlight'), { ssr: false })

type ChainFunctions = {
    chainState?: any;
    setChainState?: any;
};

interface InputType {
    [key: string]: string
}

const RenderContract: FC = ({ chainState, setChainState }: ChainFunctions) => {
    const router = useRouter();
    const [id, setId] = useState<any>(router.query.id);
    const [nightOwlThemeState, setNightOwlThemeState] = useState<{ [key: string]: React.CSSProperties; } | undefined>(undefined)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [inputValue, setInputValue] = useState<InputType>({
        input1: "",
        input2: "",
    })
    const { pending, triggerTx, transaction, error } = useScTransaction({})
    const [name, setName] = useState("")
    const [claim, setClaim] = useState("")
    const [pendingClaim, setPendingClaim] = useState(false);
    const [deleteError, setDeleteError] = useState(0);
    const accountSnap = useSnapshot(accountState);
    const apiNetworkProvider = getNetworkState<ApiNetworkProvider>('apiNetworkProvider')

    useEffect(() => {
        setId(router.query.id)
    }, [router.query.id])

    useEffect(() => {
        (async () => {
            const { nightOwl } =
                await import('react-syntax-highlighter/dist/esm/styles/hljs');
            setNightOwlThemeState(nightOwl);
        })();
    }, [])

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
                        .insert([{ user: accountSnap.address, name: name, contract_type: id, network: chainState, address: userContractAddress }])
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

    const deploySC = useCallback(() => {
        let argumentsInit: any[] = []

        
        switch (id) {
            case "tokenswap":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqnv6f4gmfva26uqepmu5py450rge00l2an60q52aze8")),
                    new TokenIdentifierValue(inputValue.input1),
                    new U64Value(Number(inputValue.input2)),
                   //new U8Value(0)
                ]
                break;
            case "lottery":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq9a2xnq64u5c8meytze7gjt66g99tc208n60q6w3y88")),
                ]
                break;
            case "nftminter":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqxfwsnq0pyqa7e3kysnp57rmryg4hputnn60qh7p5kx")),
                ]
                break;
            case "crowdfunding":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq0em87xgzarfaknrtgpxyllqec9kvx7nzn60qhj5qje")),
                    new BigUIntValue(Number(inputValue.input1)),
                    new U64Value(Number((new Date().getTime())/1000 + Number(inputValue.input2)*24*60*60))
                ]
                break;
            case "nftauction":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqz6hkazz2vlu8pdsjv2zeckrd38kku68un60q6tmeng")),
                ]
                break;
            case "tokensminter":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq49gxv5fg2ren55ul33lj7zkt2jv7mrcqn60q2c8drl")),
                ]
                break;
            case "vote":
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq9jk447536d2u3vs3lfpl3rj7xsyjdgwwn60qa7k5pc")),
                ]
                break;
            default:
                argumentsInit = []
                break;
        }

        let ca = "erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua"
        let contractfunction = new ContractFunction("deploy_contract")

        triggerTx({
            smartContractAddress: ca,
            func: contractfunction,
            gasLimit: 100000000,
            args: argumentsInit,
            value: Number(0)
        }).catch((err) => {
            console.log(err)
        })
        //setName('')
        setInputValue({
            input1: "",
            input2: ""
        })
        onClose()
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
        //setName('')
        //setClaim('');
        setPendingClaim(true)
    }

    const handleContractInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue({
            ...inputValue,
            [e.target.name]: value
        })
    }

    return (
        <MainLayout>
            <HeaderMenu>
                <HeaderMenuButtons enabled={['auth']} changeChain={changeChain} setChainState={setChainState} />
            </HeaderMenu>
            <Authenticated
                spinnerCentered
                fallback={
                    <>
                        <Box
                            height="300px"
                            background="rgba(12,12,12,0.4)"
                            borderRadius="7px"
                            border="1px solid rgb(110,110,110)"
                            width="calc(450px + 1vw)"
                            margin="auto"
                            marginTop="50px"
                            paddingTop="51px"
                            sx={{
                                '@media screen and (max-width: 500px)': {
                                    width: "95%",
                                },
                            }}
                        >
                            <Flex flexDirection="column" alignItems="center">
                                <i className="bi bi-wallet2"
                                    style={{
                                        fontSize: "calc(50px + 0.2vw)",
                                        color: "rgb(3, 131, 90)"
                                    }}
                                ></i>
                                <Text
                                    fontSize="calc(25px + 0.1vw)"
                                    fontWeight="600"
                                >Connect Your Wallet</Text>
                            </Flex>
                            <Flex mt={4} justifyContent="center">
                                <LoginModalButton text={"Connect Wallet"} />
                            </Flex>
                        </Box>
                    </>
                }
            >
                <>
                    {id !== undefined && <div className="backNavContracts">
                        <section style={{
                            display: "flex",
                            alignItems: 'center'
                        }}>
                            <button className="backButton" onClick={() => router.push("/contracts")}><i className="bi bi-caret-left"></i></button>
                            <div className='backNavContractsDetails'>
                                <i className={contractsCode[id][0].icon}></i>
                                <div>
                                    <h2>{contractsCode[id][0].title}</h2>
                                    <p>{contractsCode[id][0].description}</p>
                                </div>
                            </div>
                        </section>
                        <button className='deployContractButton' onClick={() => {
                            onOpen()
                        }}><i className="bi bi-plus"></i> Deploy Contract</button>
                    </div>}
                    {id !== undefined && <div className="backNavContracts">
                        <p>{contractsCode[id][0].longDescription}</p>
                    </div>}
                    <Accordion allowMultiple style={{
                        marginTop: "25px"
                    }}>
                        {id !== undefined && contractsCode[id].map((contract, i) => {
                            return (
                                <AccordionItem key={i}>
                                    <h2>
                                        <AccordionButton>
                                            <Box flex="1" textAlign="left" fontSize="calc(17px + 0.1vw)">
                                                {contract.name}
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel>
                                        <div>
                                            <SyntaxHighlighter language='rust' style={nightOwlThemeState} wrapLines={true} wrapLongLines={true} customStyle={{
                                                borderRadius: "9px",
                                                boxShadow: "0px 0px 8px 1px rgba(0,0,0,0.32)",
                                                paddingLeft: "11px",
                                            }}>
                                                {contract.code}
                                            </SyntaxHighlighter>
                                        </div>
                                    </AccordionPanel>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
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
                                {id !== "" && contractsCode[id] && contractsCode[id][0].input?.length === 0 && <div>
                                    <p style={{
                                        width: "100%",
                                        textAlign: "center",
                                        fontSize: "calc(17px + 0.1vw)"
                                    }}>No input required</p>
                                </div>}
                                {id !== "" && contractsCode[id] && contractsCode[id][0].input?.length! > 0 && contractsCode[id][0].input?.map((input, i) => {
                                    return (
                                        <div key={i} className="contractInputs">
                                            <label>{input.label}</label>
                                            <input name={`input${i + 1}`} type="text" value={inputValue[`input${i + 1}`]} onChange={handleContractInput} />
                                        </div>
                                    )
                                })}
                            </ModalBody>
                            <ModalFooter>
                                <button className="deployModalButton" onClick={() => {
                                    deploySC()
                                }}><i className="bi bi-lightning-charge-fill" style={{
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
                        }} className="bi bi-file-earmark-plus"></i></p>
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
                </>
            </Authenticated>
        </MainLayout>
    )
}

export default RenderContract