import {
    Text,
    Flex,
    Box,
  } from '@chakra-ui/react';
  import { MainLayout } from '../components/ui/MainLayout';
  import { HeaderMenu } from '../components/ui/HeaderMenu';
  import { HeaderMenuButtons } from '../components/ui/HeaderMenuButtons';
  import { Authenticated } from '../components/tools/Authenticated';
  import { LoginModalButton } from '../components/tools/LoginModalButton';
  import { FC } from 'react';
  import ContractsMain from '../components/ui/ContractsMain';
  
  type ChainFunctions = {
    chainState?: any;
  };
  
  const Home: FC = ({ chainState }: ChainFunctions) => {
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
          <ContractsMain chainState={chainState} />
        </Authenticated>
      </MainLayout>
    );
  };
  
  export default Home;
  