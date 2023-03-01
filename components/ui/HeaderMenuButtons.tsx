import { Box, Text, Link, Select } from '@chakra-ui/react';
import { FC } from 'react';
import { LoginModalButton } from '../tools/LoginModalButton';
import useWindowDimensions from '../../hooks/tools/useWindowDimensions';
import NextLink from 'next/link';

interface HeaderMenuButtonsProps {
  enabled: string[];
  chainState?: any;
  setChainState?: any;
  changeChain?: any
}

export const HeaderMenuButtons: FC<HeaderMenuButtonsProps> = ({ enabled, setChainState, changeChain }) => {
  const { width } = useWindowDimensions();

  return (
    <Box
      display="flex"
      gap={5}
      alignItems="center"
      sx={{
        '@media screen and (max-width: 515px)': {
          // flexDirection: 'column',
        },
      }}
    >
      <Link href=''
        fontSize="calc(18px + 0.1vw)"
        marginTop="3px"
      ><i className="bi bi-book"></i>{width > 800 ? " Docs" : ""}</Link>
      <NextLink href='/contracts' className='navLink' style={{
        fontSize: "calc(18px + 0.1vw)",
        marginTop: "3px",
      }}>
        <i className="bi bi-file-code"></i>{width > 800 ? " Contracts" : ""}
      </NextLink>
      <Select width="calc(110px + 1vw)"
        cursor="pointer"
        borderColor="rgb(3,111,90)"
        borderWidth="2px"
        height="calc(34px + 0.3vw)"
        onChange={(e) => {
          if (e.target.value === "Testnet") {
            changeChain("testnet")
            setChainState("testnet");
          } else if (e.target.value === "Mainnet") {
            changeChain("mainnet")
            setChainState("mainnet")
          } else {
            changeChain("devnet")
            setChainState("devnet")
          }
        }}
      >
        <option value='Devnet' style={{
          background: "rgb(12,12,12)"
        }}>Devnet</option>
        <option value='Mainnet' style={{
          background: "rgb(12,12,12)"
        }}>Mainnet</option>
        <option value='Testnet' style={{
          background: "rgb(12,12,12)",
        }}>Testnet</option>
      </Select>
      {enabled.includes('auth') && <LoginModalButton text={width > 630 ? " Connect" : ""} />}
    </Box>
  );
};
