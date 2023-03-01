import {
    ListItem,
    Text,
    OrderedList,
    UnorderedList,
    Flex,
    Link,
    Box,
  } from '@chakra-ui/react';
  import { MainLayout } from '../components/ui/MainLayout';
  import { HeaderMenu } from '../components/ui/HeaderMenu';
  import { HeaderMenuButtons } from '../components/ui/HeaderMenuButtons';
  import { SimpleDemo } from '../components/demo/SimpleDemo';
  import { GetUserDataDemo } from '../components/demo/GetUserDataDemo';
  import { GetLoggingInStateDemo } from '../components/demo/GetLoggingInStateDemo';
  import { GetLoginInfoDemo } from '../components/demo/GetLoginInfoDemo';
  import { Authenticated } from '../components/tools/Authenticated';
  import { CardWrapper } from '../components/ui/CardWrapper';
  import { LoginModalButton } from '../components/tools/LoginModalButton';
  import { FC } from 'react';
  import { changeChain, chainType } from '../config/network';
  import ContractsMain from '../components/ui/ContractsMain';
  
  type ChainFunctions = {
    chainState?: any;
    setChainState?: any;
  };
  
  const Home: FC = ({ chainState, setChainState }: ChainFunctions) => {
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
          {/* <SimpleDemo />
          <Flex gap={8} flexWrap="wrap" justifyContent="center" mb={4}>
            <GetUserDataDemo />
            <GetLoginInfoDemo />
            <GetLoggingInStateDemo />
          </Flex> */}
          {/* <p>{chainType} {chainState}</p> */}
          <ContractsMain chainState={chainState} />
        </Authenticated>
      </MainLayout>
    );
  };
  
  export default Home;
  