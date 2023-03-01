// Tools used internally by sent transactions hooks
import { Account, TransactionWatcher, Transaction, CallArguments, TokenPayment, ContractFunction, AddressValue, Address, SmartContract } from '@elrondnetwork/erdjs';
import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { WalletConnectProvider } from '@elrondnetwork/erdjs-wallet-connect-provider';
import { HWProvider } from '@elrondnetwork/erdjs-hw-provider';
import { Dispatch, SetStateAction } from 'react';
import { setAccountState, LoginInfoState, accountState } from '../../../store/auth';
import { ApiNetworkProvider, NetworkConfig, ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers';
import { LoginMethodsEnum } from '../../../types/enums';
import { WalletProvider, WALLET_PROVIDER_TESTNET } from '@elrondnetwork/erdjs-web-wallet-provider';
import { DappProvider } from '../../../types/network';
import { errorParse } from '../../../utils/errorParse';
import axios from 'axios';
import { useSnapshot } from 'valtio';
import { chainType } from '../../../config/network';

export interface TransactionCb {
  transaction?: Transaction | null;
  error?: string;
  pending?: boolean;
}

export const postSendTxOperations = async (
  tx: Transaction,
  setTransaction: Dispatch<SetStateAction<Transaction | null>>,
  apiNetworkProvider: ApiNetworkProvider,
  cb?: (params: TransactionCb) => void
) => {
  const transactionWatcher = new TransactionWatcher(apiNetworkProvider);
  await transactionWatcher.awaitCompleted(tx);
  setTransaction(tx);
  cb?.({ transaction: tx, pending: false });
  const sender = tx.getSender();
  const senderAccount = new Account(sender);
  const userAccountOnNetwork = await apiNetworkProvider.getAccount(sender);
  senderAccount.update(userAccountOnNetwork);
  setAccountState('address', senderAccount.address.bech32());
  setAccountState('nonce', senderAccount.getNonceThenIncrement());
  setAccountState('balance', senderAccount.balance.toString());
};

export const sendTxOperations = async (
  dappProvider: DappProvider,
  tx: Transaction,
  loginInfoSnap: LoginInfoState,
  apiNetworkProvider: ApiNetworkProvider,
  proxyProvider: ProxyNetworkProvider,
  setTransaction: Dispatch<SetStateAction<Transaction | null>>,
  setError: Dispatch<SetStateAction<string>>,
  setPending: Dispatch<SetStateAction<boolean>>,
  webWalletRedirectUrl?: string,
  cb?: (params: TransactionCb) => void
) => {
  try {
    //////////////////////
    // const accountSnap = useSnapshot(accountState);
    // let cevaFunctie: CallArguments = {
    //   gasLimit: 80000000,
    //   value: TokenPayment.egldFromAmount(0),
    //   func: new ContractFunction("deploy_contract"),
    //   args: [
    //     new AddressValue(new Address("erd1qqqqqqqqqqqqqpgqez3l87u6c8gl04ktptmfl63uryd3smm2n60qp343l8")),
    //   ],
    //   chainID:"T"
    // }
    // let contractTest = new SmartContract({address:new Address("erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua") })
    // let txTest = contractTest.call(cevaFunctie);
    // txTest.setNonce(accountSnap.nonce)
    ////////////////////////////////////////////

   // console.log(apiNetworkProvider.getNetworkConfig());
    const provider = new WalletProvider(WALLET_PROVIDER_TESTNET);
    console.log(chainType)

    if (dappProvider instanceof WalletProvider) {
      const currentUrl = window?.location.href;
      await dappProvider.signTransaction(tx, {
        callbackUrl: webWalletRedirectUrl || currentUrl,
      });
    }
    if (dappProvider instanceof ExtensionProvider) {
      //await provider.signTransaction(tx);
      await dappProvider.signTransaction(tx);
    }
    if (dappProvider instanceof WalletConnectProvider) {
      //await provider.signTransaction(tx);
      await dappProvider.signTransaction(tx);
    }
    if (dappProvider instanceof HWProvider) {
      //await provider.signTransaction(tx);
      await dappProvider.signTransaction(tx);
    }
    if (loginInfoSnap.loginMethod !== LoginMethodsEnum.wallet) {
      //await apiNetworkProvider.sendTransaction(tx);
      //await proxyProvider.sendTransaction(tx);
      const response = await axios.post("https://testnet-gateway.elrond.com/transaction/send", tx.toSendable(), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      console.log(response.data);
      
      //await proxyProvider.sendTransaction(tx);
      await postSendTxOperations(tx, setTransaction, apiNetworkProvider, cb);
    }
  } catch (e) {
    const err = errorParse(e);
    setError(err);
    cb?.({ error: err });
  } finally {
    setPending(false);
    cb?.({ pending: false });
  }
};
