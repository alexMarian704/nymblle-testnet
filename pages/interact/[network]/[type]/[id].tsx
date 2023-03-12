import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { HeaderMenu } from '../../../../components/ui/HeaderMenu'
import { MainLayout } from '../../../../components/ui/MainLayout'
import style from "../../../../style/Contact.module.css"
import supabase from '../../../../config/supabaseConfig'
import { useRouter } from 'next/router'
import { HeaderMenuButtons } from '../../../../components/ui/HeaderMenuButtons'
import { Authenticated } from '../../../../components/tools/Authenticated'
import { LoginModalButton } from '../../../../components/tools/LoginModalButton'
import { getNetworkState } from '../../../../store/network'
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { Address, AddressValue, BigUIntType, BigUIntValue, BytesValue, Code, CodeMetadata, ContractFunction, NullType, ResultsParser, SmartContract, TokenIdentifierValue, TokenPayment, Transaction, U64Value, U8Value } from "@elrondnetwork/erdjs";
import { accountState } from '../../../../store/auth'
import { useSnapshot } from 'valtio'
import { contractsFunctionGet } from '../../../../config/contractFunctions'
import { contractsFunctionSet } from '../../../../config/setFunctions'
import { useScTransaction } from '../../../../hooks/core/useScTransaction'
import BigNumber from 'bignumber.js'
import { useESDTTransfer } from '../../../../hooks/core/useESDTTransfer'

interface FunctionType {
    [key: string]: string
}

interface arrayDataSet {
    title: string
    description: string
    name: string
    args: string[]
    dataType: string[]
    numberOfInputs: number
}

interface arrayDataGet {
    title: string
    description: string
    name: string
}

interface ContractGet {
    [key: string]: arrayDataGet[]
}

interface ContractSet {
    [key: string]: arrayDataSet[]
}

interface ContractData {
    address: string
    name: string
    contract_type: string
    created_at: string
    id: number
    network: string
    user: string
}

const ContractInteract: FC = () => {
    const router = useRouter()
    const { id, network, type } = router.query
    const apiNetworkProvider = getNetworkState<ApiNetworkProvider>
        ('apiNetworkProvider')
    const { triggerTx, transaction, pending, error } = useScTransaction({});
    const { pending: pendingESDT, transaction: transactionESDT, triggerTx: triggerTxESDT, error: errorESDT } = useESDTTransfer({});
    const accountSnap = useSnapshot(accountState);
    const [functionArray, setFunctionArray] = useState<ContractGet>(contractsFunctionGet);
    const [setFunctionsSet, setSetFunctionsSet] = useState<ContractSet>(contractsFunctionSet);
    const [functionValue, setFunctionValue] = useState<FunctionType>({
        function0: "",
        function1: "",
        function2: "",
        function3: "",
        function4: "",
        function5: "",
        function6: "",
    })
    const [function0, setFunction0] = useState("/");
    const [function1, setFunction1] = useState("/");
    const [function2, setFunction2] = useState("/");
    const [function3, setFunction3] = useState("/");
    const [function4, setFunction4] = useState("/");
    const [function5, setFunction5] = useState("/");
    const [inputError, setInputError] = useState(-1);
    const [get, setGet] = useState(false);
    const [contractData, setContractData] = useState<ContractData[]>([]);

    const queryContracts = async () => {
        if (type) {
            let isLotteryActive = true;
            if (type === "lottery" || type === "nftauction" || type === "crowdfunding") {
                let stringAddress = String(id)
                let contractAddress = new Address(stringAddress);
                let contract = new SmartContract({ address: contractAddress });

                let query = contract.createQuery({
                    func: new ContractFunction("getStatus"),
                    args: [],
                    caller: new Address(accountSnap.address)
                });

                let resultsParser = new ResultsParser()
                let queryResponse = await apiNetworkProvider.queryContract(query)
                let bundle = resultsParser.parseUntypedQueryResponse(queryResponse);

                if (bundle.values[0].toString('hex') === "01") {
                    isLotteryActive = false;
                }
            }

            if (isLotteryActive === true || (type !== "lottery" && type !== "nftauction" && type !== "crowdfunding")) {
                let stringType = String(type)
                for (let i = 0; i < contractsFunctionGet[stringType].length; i++) {
                    let stringAddress = String(id)
                    let contractAddress = new Address(stringAddress);
                    let contract = new SmartContract({ address: contractAddress });
                    let userAddress = new Address(accountSnap.address);

                    let query = contract.createQuery({
                        func: new ContractFunction(contractsFunctionGet[stringType][i].name),
                        args: [],
                        caller: new Address(accountSnap.address)
                    });

                    let resultsParser = new ResultsParser()
                    let queryResponse = await apiNetworkProvider.queryContract(query)
                    let bundle = resultsParser.parseUntypedQueryResponse(queryResponse);

                    if (bundle.values[0] == undefined)
                        continue;

                    if ((type === "lottery" || type === "nftauction") && i === 0) {
                        setFunction0("Active")
                    }
                    if (type === "crowdfunding" && i === 3) {
                        setFunction3("Active")
                    }

                    if (bundle.values[0].toString('hex') !== "") {
                        const result = bundle.values[0].toString('hex');
                        if (i === 0) {
                            if (type === "tokenswap" || type === "crowdfunding") {
                                setFunction0((parseInt(result, 16) / (10 ** 18)).toString())
                            } else {
                                setFunction0(result)
                            }
                        } else if (i === 1) {
                            if (type === "lottery" || type === "vote" || type === "crowdfunding") {
                                let date = new Date(parseInt(result, 16) * 1000).toLocaleDateString();
                                setFunction1(date);
                            } else if (type === "tokenswap") {
                                setFunction1((parseInt(result, 16) / (10 ** 18)).toString())
                            } else {
                                setFunction1(result)
                            }
                        } else if (i === 2) {
                            if (type === "lottery" || type === "crowdfunding") {
                                setFunction2(parseInt(result, 16).toString());
                            } else if (type === "vote") {
                                if (result === "01") {
                                    setFunction2("Inactive");
                                } else {
                                    setFunction2("Active");
                                }
                            } else {
                                setFunction2(result)
                            }
                        } else if (i === 3) {
                            if (type === "lottery") {
                                setFunction3((parseInt(result, 16) / (10 ** 18)).toString() + " EGLD");
                            } else {
                                setFunction3(result)
                            }
                        } else if (i === 4) {
                            setFunction4(result)
                        } else if (i === 5) {
                            setFunction5(result)
                        }
                    }
                }
            } else {
                if (type === "crowdfunding") {
                    setFunction3("Inactive")
                } else {
                    setFunction0("Inactive")
                }
            }
        }
    }

    useEffect(() => {

        const getContractData = async () => {
            const { data, error } = await supabase
                .from("contracts")
                .select()
                .eq('address', id)

            if (data != null)
                setContractData(data);
        }

        getContractData();
        queryContracts();
    }, [type])

    useEffect(() => {
        if (transaction !== null) {
            setFunctionValue({
                function0: "",
                function1: "",
                function2: "",
                function3: "",
                function4: "",
                function5: "",
                function6: "",
            })
            setTimeout(() => {
                queryContracts();
            }, 600)
        }
    }, [transaction])

    const queryAll = async (functionName: string) => {
        let stringAddress = String(id)
        let contractAddress = new Address(stringAddress);
        let contract = new SmartContract({ address: contractAddress });
        let userAddress = new Address(accountSnap.address);

        let query = contract.createQuery({
            func: new ContractFunction(functionName),
            args: [],
            caller: new Address(accountSnap.address)
        });

        let resultsParser = new ResultsParser()
        let queryResponse = await apiNetworkProvider.queryContract(query)
        let bundle = resultsParser.parseUntypedQueryResponse(queryResponse);
        console.log(bundle.values[0].toString('hex'));
    }

    function isPositiveFloat(s: any) {
        return !isNaN(s) && Number(s) > 0;
    }

    const sendSCTransaction = useCallback((indexStart: number, functionName: string, argType: any[], divIndex: number, dataType: any[]) => {
        let argumentsInit: any[] = []
        let hasEGLDValue = -1;
        let hasESDTValue = -1;
        let hasError = false;

        let ca: string = `${id}`;
        let contractfunction = new ContractFunction(functionName)

        for (let i = 0; i < argType.length; i++) {
            if (argType[i] === "U64") {
                if (functionValue[`function${indexStart + i}`] !== "") {
                    if (isPositiveFloat(functionValue[`function${indexStart + i}`])) {
                        if (dataType[i] === "Deadline | Number(days)") {
                            argumentsInit.push(new U64Value(Math.ceil(Number((new Date().getTime()) / 1000 + parseFloat(functionValue[`function${indexStart + i}`]) * 24 * 60 * 60))));
                        } else {
                            argumentsInit.push(new U64Value(parseFloat(functionValue[`function${indexStart + i}`])));
                        }
                    } else {
                        setInputError(divIndex + 20)
                        hasError = true;
                    }
                } else {
                    setInputError(divIndex)
                    hasError = true;
                }
            } else if (argType[i] === "ManagedBuffer") {
                if (functionValue[`function${indexStart + i}`] !== "") {
                    if (typeof functionValue[`function${indexStart + i}`] === "string") {
                        argumentsInit.push(BytesValue.fromUTF8(functionValue[`function${indexStart + i}`]));
                    } else {
                        setInputError(divIndex + 20)
                        hasError = true;
                    }
                } else {
                    setInputError(divIndex)
                    hasError = true;
                }
            } else if (argType[i] === "BigUint" || (argType[i] === "EGLD(Optional)" && functionValue[`function${indexStart + i}`] !== "") || (argType[i] === "ESDT(Optional)" && functionValue[`function${indexStart + i}`] !== "")) {
                if (functionValue[`function${indexStart + i}`] !== "") {
                    if (isPositiveFloat(functionValue[`function${indexStart + i}`])) {
                        argumentsInit.push(new BigUIntValue(new BigNumber(parseFloat(functionValue[`function${indexStart + i}`]) * (10 ** 18))));
                    } else {
                        setInputError(divIndex + 20)
                        hasError = true;
                    }
                } else {
                    setInputError(divIndex)
                    hasError = true;
                }
            } else if (argType[i] === "ESDT") {
                if (functionValue[`function${indexStart + i}`] !== "") {
                    if (isPositiveFloat(functionValue[`function${indexStart + i}`])) {
                        hasESDTValue = indexStart + i;
                    } else {
                        setInputError(divIndex + 20)
                        hasError = true;
                    }
                } else {
                    setInputError(divIndex)
                    hasError = true;
                }
            } else if (argType[i] === "EGLD") {
                if (functionValue[`function${indexStart + i}`] !== "") {
                    if (isPositiveFloat(functionValue[`function${indexStart + i}`])) {
                        hasEGLDValue = indexStart + i;
                    } else {
                        setInputError(divIndex + 20)
                        hasError = true;
                    }
                } else {
                    setInputError(divIndex)
                    hasError = true;
                }
            }
        }

        if (type === "nftminter") {
            if (functionValue["function1"] !== functionValue["function1"].toUpperCase()) {
                setInputError(divIndex)
                hasError = true;
            } else {
                setInputError(-1)
                hasError = false;
            }
        }

        if (type === "nftminter" && !hasError) {
            triggerTx({
                smartContractAddress: ca,
                func: contractfunction,
                gasLimit: 80000000,
                args: functionName === "issue_token" ? [BytesValue.fromUTF8(functionValue["function0"]), BytesValue.fromUTF8(functionValue["function1"])] : [BytesValue.fromUTF8(functionValue["function2"]), BytesValue.fromUTF8(functionValue["function3"])],
                value: functionName === "issue_token" ? Number(0.05) : Number(0)
            }).catch((err) => {
                console.log(err)
            })
        } else if (type === "nftauction" && functionName === "start_auction") {
            triggerTx({
                smartContractAddress: accountSnap.address,
                func: new ContractFunction("ESDTNFTTransfer"),
                gasLimit: 100000000,
                args: [BytesValue.fromUTF8(functionValue["function0"]), BytesValue.fromUTF8("1"), BytesValue.fromUTF8("1"), BytesValue.fromUTF8(ca), BytesValue.fromUTF8("start_auction"), ...argumentsInit],
                value: Number(0)
            }).catch((err) => {
                console.log(err)
            })
        } else if (type === "tokensminter" && functionName === "issue_token") {
            argumentsInit.push(new U8Value(18))
            triggerTx({
                smartContractAddress: ca,
                func: contractfunction,
                gasLimit: 100000000,
                args: argumentsInit,
                value: Number(0.05)
            }).catch((err) => {
                console.log(err)
            })
        } else {
            if (!hasError && hasESDTValue === -1) {
                setInputError(-1);
                triggerTx({
                    smartContractAddress: ca,
                    func: contractfunction,
                    gasLimit: 100000000,
                    args: argumentsInit,
                    value: hasEGLDValue != -1 ? Number(functionValue[`function${hasEGLDValue}`]) : Number(0)
                }).catch((err) => {
                    console.log(err)
                })
            } else if (hasESDTValue !== -1 && !hasError) {
                setInputError(-1);
                triggerTxESDT({
                    smartContractAddress: ca,
                    func: contractfunction,
                    gasLimit: 80000000,
                    value: hasESDTValue != -1 ? Number(functionValue[`function${hasEGLDValue}`]) : Number(0)
                }).catch((err) => {
                    console.log(err)
                })
            }
        }

    }, [triggerTx, triggerTxESDT])

    return (
        <MainLayout>
            <HeaderMenu>
                <HeaderMenuButtons enabled={['auth']} />
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
                {contractData?.length > 0 && <div className={style.contractNameContainer}>
                    <h3>Name: <span>{contractData[0].name}</span></h3>
                    <h3>Network: <span>{network}</span></h3>
                    <h3>Type: <span>{type}</span></h3>
                </div>}
                <div className={style.wrapFunctionGet}>
                    {type && functionArray[String(type)].length > 0 && functionArray[String(type)].map((func, i) => {
                        return (
                            <div key={i} className={style.functionGetDiv}>
                                <div>
                                    <p className={style.functionGetTitle}>{func.title}</p>
                                    <p className={style.functionGetDescription}>{func.description}</p>
                                </div>
                                <p className={style.functionGetValueBox}>
                                    {i === 0 ? function0 : i === 1 ? function1 : i === 2 ? function2 : i === 3 ? function3 : i === 4 ? function4 : function5}
                                </p>
                            </div>
                        )
                    })}
                </div>
                <div className={style.wrapFunctionGet}>
                    {type && setFunctionsSet[String(type)].length > 0 && setFunctionsSet[String(type)].map((func, i) => {
                        return (
                            <div key={i} className={style.functionSetDiv}>
                                <div>
                                    <p className={style.functionGetTitle}>{func.title}</p>
                                    <p className={style.functionGetDescription}>{func.description}</p>
                                </div>
                                {func.args.length > 0 && func.args.map((arg, j) => {
                                    return (
                                        <div key={j} className={style.inputSetContainer}>
                                            <input name={`input${j + 1}`} type="text" value={functionValue[`function${j + func.numberOfInputs}`]} placeholder={func.dataType[j]} onChange={(e) => {
                                                setFunctionValue({
                                                    ...functionValue,
                                                    [`function${j + func.numberOfInputs}`]: e.target.value
                                                })
                                            }} />
                                        </div>
                                    )
                                })}
                                {func.args.length == 0 &&
                                    <div className={style.inputSetContainer} style={{
                                        border: "none"
                                    }}>
                                        <p>{func.dataType[0]}</p>
                                    </div>}
                                <button className={style.setButton} onClick={() => sendSCTransaction(func.numberOfInputs, func.name, func.args, i, func.dataType)}><i className="bi bi-check2"></i></button>
                                {inputError === i && <p style={{
                                    color: "red",
                                    width: "100%",
                                    textAlign: "center",
                                    marginTop: "7px"
                                }}>Please complete the required inputs approperly</p>}
                                {inputError === (i + 20) && <p style={{
                                    color: "red",
                                    width: "100%",
                                    textAlign: "center",
                                    marginTop: "7px"
                                }}>Invalid input data type</p>}
                            </div>
                        )
                    })}
                    {pending === true && <div className='loadingContainer'>
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
                    </div>}
                </div>
                <p className={style.docsMessage}>Don't understand what all this stuff do? Please check out the <a href="https://nymblle.com/docs">Docs</a></p>
            </Authenticated>
        </MainLayout>
    )
}

export default ContractInteract