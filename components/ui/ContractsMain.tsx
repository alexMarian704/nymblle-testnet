import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import React, { FC, useCallback, useEffect, useState } from 'react'
import ContractsList from './ContractsList'
import { contractsCode } from "../../config/contractsCode"
import { Address, AddressValue, BigUIntType, BigUIntValue, Code, CodeMetadata, ContractCallPayloadBuilder, ContractFunction, NullType, ResultsParser, SmartContract, TokenIdentifierValue, Transaction, U64Value, U8Value } from "@elrondnetwork/erdjs";
import { getNetworkState } from '../../store/network';
import { DappProvider } from '../../types/network';
import { accountState, loginInfoState } from '../../store/auth';
import { sendTxOperations } from '../../hooks/core/common-helpers/sendTxOperations';

import { useSnapshot } from 'valtio';
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { useWebWalletTxSend } from '../../hooks/core/common-helpers/useWebWalletTxSend';
import { useScTransaction } from '../../hooks/core/useScTransaction';
import { SCQueryType, useScQuery } from '../../hooks/core/useScQuery';
import supabase from '../../config/supabaseConfig';
import { shortenHash } from '../../utils/shortenHash';
import BigNumber from 'bignumber.js';

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

    /////////////////////////////
    //const [pending, setPending] = useState(false);
    // const accountSnap = useSnapshot(accountState);
    // const loginInfoSnap = useSnapshot(loginInfoState);
    const dappProvider = getNetworkState<DappProvider>('dappProvider')
    const apiNetworkProvider = getNetworkState<ApiNetworkProvider>('apiNetworkProvider')

    // useWebWalletTxSend({ setPending, setTransaction, setError })

    // const testDeploy = async () => {
    //     let contract = new SmartContract({});
    //     let response: AxiosResponse<ArrayBuffer> = await axios.get("http://localhost:3000/api/lotterysalut", {
    //         responseType: "arraybuffer",
    //         transformResponse: [],
    //         headers: {
    //             "Accept": "application/wasm"
    //         }
    //     });
    //     let buffer = Buffer.from(response.data);
    //     let code = Code.fromBuffer(buffer);
    //     let transaction = contract.deploy({
    //         code: code,
    //         codeMetadata: new CodeMetadata(true, false, false, false),
    //         initArguments: [new U8Value(0)],
    //         gasLimit: 10000000,
    //         chainID: "D"
    //     })

    //     transaction.setNonce(accountState.nonce)
    //     sendTxOperations(
    //         dappProvider,
    //         transaction,
    //         loginInfoSnap,
    //         apiNetworkProvider,
    //         setTransaction,
    //         setError,
    //         setPending,
    //     )
    //     console.log(error)
    // }

    useEffect(() => {
        const getAddressPush = async () => {
            if (pending !== false && transaction !== null && error === "") {
                let contractAddress = new Address("erd1qqqqqqqqqqqqqpgqrs5vn4mrtdghatj4wwj5wrehfnnn2n2zn60qsu59wr");
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
                        .insert([{ user: accountSnap.address, name: name, contract_type: input, network: chainState, address: userContractAddress }])
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
            .eq('name', name)


        if (data?.length === 0) {
            if (chainState === "devnet") {
                switch (input) {
                    case "tokenswap":
                        if (inputValue.inpu1 !== "" && inputValue.input2 !== "") {
                            argumentsInit = [
                                new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqnv6f4gmfva26uqepmu5py450rge00l2an60q52aze8")),
                                new TokenIdentifierValue(inputValue.input1),
                                new U64Value(Number(inputValue.input2)),
                            ]
                        } else {
                            hasInputError = true;
                        }
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
                        if (inputValue.inpu1 !== "" && inputValue.input2 !== "") {
                            argumentsInit = [
                                new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq0em87xgzarfaknrtgpxyllqec9kvx7nzn60qhj5qje")),
                                new BigUIntValue(Number(inputValue.input1)),
                                new U64Value(Number((new Date().getTime()) / 1000 + Number(inputValue.input2) * 24 * 60 * 60))
                            ]
                        } else {
                            hasInputError = true;
                        }
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
            } else if (chainState === "testnet") {
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
                            new AddressValue(new Address("erd1qqqqqqqqqqqqqpgq353stmkss82m0kvc3je02h6rp4temqwcn60q0pae05")),
                        ]
                        break;
                    case "crowdfunding":
                        if (inputValue.inpu1 !== "" && inputValue.input2 !== "") {
                            argumentsInit = [
                                new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqcjgrpxjgxy7e2wuquhd0pryvxenc7l48n60q0k2w0y")),
                                new BigUIntValue(Number(inputValue.input1)),
                                new U64Value(Number((new Date().getTime()) / 1000 + Number(inputValue.input2) * 24 * 60 * 60))
                            ]
                        } else {
                            hasInputError = true;
                        }
                        break;
                    case "nftauction":
                        argumentsInit = [
                            new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqrkudl3d0ruvp8lev79x5p9l05lcynzs3n60qyx977z")),
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
            } else {
                argumentsInit = [
                    new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqfrk4qvxkk8ldck9yy5rt98d4kfc6c0z73epqqlqm54")),
                ]
            }

            let ca = chainState === "devnet" ? "erd1qqqqqqqqqqqqqpgqrs5vn4mrtdghatj4wwj5wrehfnnn2n2zn60qsu59wr" : chainState === "testnet" ? "erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua" : "erd1qqqqqqqqqqqqqpgqkhsvr34kg6jhzu3u3atcpdzx6mkkkkt73epqgd6s24"
            let contractfunction = new ContractFunction("deploy_contract")

            if (hasInputError === false) {
            //     const data = new ContractCallPayloadBuilder()
            //     .setFunction(contractfunction)
            //     .setArgs(argumentsInit || [])
            //     .build();
        
            //   const tx = new Transaction({
            //     data:data,
            //     gasLimit: 80000000,
            //     value: Number(0),
            //     chainID: "T",
            //     receiver: new Address(ca),
            //     sender: new Address(accountSnap.address),
            //   });
            //   tx.setNonce(accountSnap.nonce);
            //   try {
            //       await dappProvider.signTransaction(tx);
            //   } catch (error) {
                
            //   }


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
        let ca = chainState === "devnet" ? "erd1qqqqqqqqqqqqqpgqrs5vn4mrtdghatj4wwj5wrehfnnn2n2zn60qsu59wr" : chainState === "testnet" ? "erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua" : ""
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
                <ContractsList title='NFTs' description='NFT Collections and everything else NFT-related' numberOfContracts={3} onOpen={onOpen} setInput={setInput} />
                <ContractsList title='Tokens' description='NFT Collections and everything else NFT-related' numberOfContracts={3} onOpen={onOpen} setInput={setInput} />
                <ContractsList title='Dapps' description='NFT Collections and everything else NFT-related' numberOfContracts={2} onOpen={onOpen} setInput={setInput} />
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
                        {/* <DeployButton type={input} inputValue={inputValue} name={name} chainState={chainState} pending={pending} setPending={setPending} error={error} setError={setError} transaction={transaction} setTransaction={setTransaction}  /> */}
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
        </Box >
    )
}

export default ContractsMain