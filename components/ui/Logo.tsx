import NextLink from 'next/link';
import { Box, Text } from '@chakra-ui/react';
import useWindowDimensions from '../../hooks/tools/useWindowDimensions';

export const Logo = () => {
  const { width } = useWindowDimensions();

  return (
    <NextLink href="/">
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        position="relative"
        userSelect="none"
      >
        <Text
          as="span"
          cursor="pointer"
          mb={0}
          fontSize="calc(27px + 0.3vw)"
          fontWeight="900"
          color="dappTemplate.white"
        >
          <i className="bi bi-stack" style={{
            color: "rgb(3, 111, 90)",
            marginRight: "7px"
          }}></i>{width > 630 ? "nymblle" : ""}
        </Text>
      </Box>
    </NextLink>
  );
};
