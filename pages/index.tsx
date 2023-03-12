import {
  Text,
  Flex,
  Box,
  Spinner,
} from '@chakra-ui/react';
import { MainLayout } from '../components/ui/MainLayout';
import { HeaderMenu } from '../components/ui/HeaderMenu';
import { HeaderMenuButtons } from '../components/ui/HeaderMenuButtons';
import { Authenticated } from '../components/tools/Authenticated';
import { LoginModalButton } from '../components/tools/LoginModalButton';
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../config/supabaseConfig';
import { useAccount } from '../hooks/auth/useAccount';
import { shortenHash } from '../utils/shortenHash';
import useWindowDimensions from '../hooks/tools/useWindowDimensions';
import { Address, AddressValue, ContractFunction, ResultsParser, SmartContract } from '@elrondnetwork/erdjs/out';
import { useSnapshot } from 'valtio';
import { getNetworkState } from '../store/network';
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { accountState } from '../store/auth';
import { useScTransaction } from '../hooks/core/useScTransaction';

const Home: FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [userContracts, setUserContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions()
  const accountSnap = useSnapshot(accountState);
  const apiNetworkProvider = getNetworkState<ApiNetworkProvider>('apiNetworkProvider')
  const [unclaimedAddress, setUnclaimedAddress] = useState<string[]>([])
  const [addressLoading, setAddressLoading] = useState(true);
  const { pending, triggerTx, transaction, error } = useScTransaction({})
  const [claimAddress, setClaimAddress] = useState("")

  useEffect(() => {
    const effectFunction = async () => {
      if (address) {
        const { data, error } = await supabase
          .from("contracts")
          .select()
          .eq('user', address)
        setUserContracts(data!.reverse())
        setLoading(false)
      }
    }
    effectFunction();
  }, [address])

  const getUnclaimedContract = async () => {
    let ca =
      "erd1qqqqqqqqqqqqqpgqf3zy9x5902yn2ncqawav2y0y7kxnfkw7n60qh6sdua"
    let contractAddress = new Address(ca);
    let contract = new SmartContract({ address: contractAddress });
    let userAddress = new Address(accountSnap.address);

    let query = contract.createQuery({
      func: new ContractFunction("getUnclaimed"),
      args: [new AddressValue(userAddress)],
      caller: new Address(accountSnap.address)
    });

    let resultsParser = new ResultsParser()
    let queryResponse = await apiNetworkProvider.queryContract(query)
    let bundle = resultsParser.parseUntypedQueryResponse(queryResponse);
    let allAddress = bundle.values[0].toString('hex')
    let shortAddress = ""
    let addressArray = []
    for (let i = 0; i < allAddress.length; i++) {
      if (i < allAddress.length - 1) {
        if (allAddress[i] === "e" && allAddress[i - 1] === "9" && allAddress[i - 2] === "e" && allAddress[i - 3] === "9" && allAddress[i + 1] === "0") {
          shortAddress = shortAddress + allAddress[i]
          const userContractAddress = new Address(shortAddress).bech32()
          addressArray.push(userContractAddress)
          shortAddress = "";
        } else {
          shortAddress = shortAddress + allAddress[i]
        }
      } else {
        shortAddress = shortAddress + allAddress[i]
        const userContractAddress = new Address(shortAddress).bech32()
        addressArray.push(userContractAddress)
      }
    }
    setUnclaimedAddress(addressArray)
    setAddressLoading(false);
  }

  useEffect(() => {
    if(address)
      getUnclaimedContract()
  }, [address])

  useEffect(() => {
    if (transaction && claimAddress !== "") {
      getUnclaimedContract()
      setClaimAddress("")
    }
  }, [transaction])

  const claimContract = (claim: string) => {
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
      setClaimAddress("")
    })
    setClaimAddress(claim)
  }

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
        <div>
          <h2 className='headerText'><i className="bi bi-file-code"></i> Deployed Contracts</h2>
          <div className="mainDeployTitles">
            <div className='mainDeployInfo'>
              {/* <h3>Deployed contracts</h3> */}
              <p>The list of contract instances that you have deployed with smartstack.</p>
            </div>
            <div className='mainDeployButtonDiv'>
              <button onClick={() => {
                router.push("/contracts")
              }}><i className="bi bi-plus"></i> Deploy New Contract</button>
            </div>
          </div>
          <div className='mainDeployBody'>
            <div className='mainDeployBodyNav'>
              <p>Name</p>
              <p>Type</p>
              <p>Address</p>
              <p>Interact</p>
            </div>
            <div className='mainDeployBodyContracts'>
              {loading === false && userContracts?.length > 0 && userContracts.map((contract, i) => {
                return (
                  <div key={i} className="contractContainer">
                    <p>{contract.name}</p>
                    <p>{contract.contract_type}</p>
                    <p>{width > 650 ? shortenHash(contract.address, 4) : shortenHash(contract.address, 3)}<i onClick={() => {
                      navigator.clipboard.writeText(contract.address)
                    }} style={{
                      marginLeft: "4px",
                      fontSize: "calc(15px + 0.1vw)",
                    }} className="bi bi-back" id='copyButton'></i></p>
                    {/* bi bi-file-earmark-plus-fill */}
                    {addressLoading === false && unclaimedAddress.includes(contract.address) === false && <button onClick={() => {
                      router.push(`/interact/${contract.network}/${contract.contract_type}/${contract.address}`)
                    }} ><i className="bi bi-cursor"></i> {width > 700 ? "Interact" : ""}</button>}
                    {addressLoading === false && unclaimedAddress.includes(contract.address) === true && <button onClick={() => {
                      claimContract(contract.address)
                    }} ><i className="bi bi-file-arrow-up"></i> {width > 700 ? "Claim" : ""}</button>}
                  </div>
                )
              })}
              {loading === false && userContracts.length === 0 &&
                <p style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "calc(22px + 0.1vw)",
                  marginTop: "50px"
                }}>
                  No contracts deployed
                </p>}
            </div>
          </div>
          {pending === true && claimAddress !== "" && <div className='loadingContainer'>
            <Spinner
              speed='0.9s'
              width="170px"
              height="170px"
              thickness='17px'
              color='rgb(3,151,91)'
              marginBottom="20px"
            />
            <p>Contract Address: {shortenHash(claimAddress, 7)} <i onClick={() => {
              navigator.clipboard.writeText(claimAddress)
            }} style={{
              marginLeft: "4px",
              fontSize: "calc(19px + 0.1vw)",
              color: "rgb(3,171,91)",
              cursor: "pointer"
            }} className="bi bi-file-earmark-plus"></i></p>
            <p>Transaction loading....</p>
            <p>Please wait</p>
          </div>}
        </div>
      </Authenticated>
    </MainLayout>
  );
};

export default Home;

