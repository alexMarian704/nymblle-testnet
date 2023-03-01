import React, { FC, useCallback, useState } from 'react'
import ContractsList from './ContractsList'
import { contractsCode } from "../../config/contractsCode"
import { Address, AddressValue, BigUIntValue, Code, CodeMetadata, ContractFunction, NullType, SmartContract, TokenIdentifierValue, Transaction, U64Value, U8Value } from "@elrondnetwork/erdjs";
import { getNetworkState } from '../../store/network';
import { DappProvider } from '../../types/network';
import { accountState, loginInfoState } from '../../store/auth';
import { sendTxOperations } from '../../hooks/core/common-helpers/sendTxOperations';

import { useSnapshot } from 'valtio';
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { useWebWalletTxSend } from '../../hooks/core/common-helpers/useWebWalletTxSend';
import axios, { AxiosResponse } from "axios";
import supabase from '../../config/supabaseConfig';
import { useAccount } from '../../hooks/auth/useAccount';
import { useScTransaction } from '../../hooks/core/useScTransaction';

interface InputType {
    [key: string]: string
}

interface DeployButtonProps {
    type: string
    inputValue: InputType
    name: string
    chainState?: any
    pending: any
    setPending: any
    error: any
    setError: any
    transaction: any
    setTransaction: any
}

const DeployButton: FC<DeployButtonProps> = ({ type, inputValue, name, chainState, setPending, error, setError, setTransaction }) => {
    const accountSnap = useSnapshot(accountState);
    const loginInfoSnap = useSnapshot(loginInfoState);
    const dappProvider = getNetworkState<DappProvider>('dappProvider')
    const apiNetworkProvider = getNetworkState<ApiNetworkProvider>('apiNetworkProvider')
    const { address } = useAccount()

    const { pending, triggerTx, transaction } = useScTransaction({})

    useWebWalletTxSend({ setPending, setTransaction, setError })

    const testDeploy = async () => {
        let argumentsInit: any[] = []

        switch (type) {
            case "tokenswap":
                argumentsInit = [
                    new TokenIdentifierValue(inputValue.input1),
                    new U64Value(Number(inputValue.input2))
                ]
                break;
            case "lottery":
                argumentsInit = [
                    new U8Value(0)
                ]
                break;
            default:
                argumentsInit = []
                break;
        }


        let contract = new SmartContract({});
        let response: AxiosResponse<ArrayBuffer> = await axios.get(`http://localhost:3000/api/${type}`, {
            responseType: "arraybuffer",
            transformResponse: [],
            headers: {
                "Accept": "application/wasm"
            }
        });
        let buffer = Buffer.from(response.data);
        let code = Code.fromBuffer(buffer);
        let transaction = contract.deploy({
            code: code,
            codeMetadata: new CodeMetadata(true, false, false, false),
            initArguments: argumentsInit,
            gasLimit: 10000000,
            chainID: "D"
        })

        transaction.setNonce(accountState.nonce)
        // sendTxOperations(
        //     dappProvider,
        //     transaction,
        //     loginInfoSnap,
        //     apiNetworkProvider,
        //     setTransaction,
        //     setError,
        //     setPending,
        // )
        console.log(error)
        if (pending === false && error === '') {
            const { data, error } = await supabase
                .from("contracts")
                .insert([{ user: address, name: name, contract_type: type, network: chainState, address: "aeasdsad" }])
            console.log(error)
        }
    }

    const testSC = useCallback(() => {
        let ca = "erd1qqqqqqqqqqqqqpgqrs5vn4mrtdghatj4wwj5wrehfnnn2n2zn60qsu59wr"
        let contractfunction = new ContractFunction("deploy_contract")
        let args: any[] = [new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqcs95ksfqg7g6z4udtyuz8arvftd2rhu8n60q9gqhsf")),
        new TokenIdentifierValue(inputValue.input1),
        new U64Value(Number(inputValue.input2))];

        triggerTx({
            smartContractAddress: ca,
            func: contractfunction,
            gasLimit: 100000000,
            args: args,
            value: Number(0)
        }).catch((err) => {
            console.log(err)
        })
    }, [triggerTx]);
    console.log(transaction)

    return (
        <button className="deployModalButton" onClick={testSC}><i className="bi bi-lightning-charge-fill" style={{
            color: "#00e673",
            fontSize: "calc(16px + 0.1vw)",
            marginRight: "2px"
        }}></i>Deploy</button>
    )
}

export default DeployButton