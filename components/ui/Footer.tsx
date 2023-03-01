import { Container, Box, Text, Stack } from '@chakra-ui/react';
import packageJson from '../../package.json';
import Link from "next/link"

export const Footer = () => {
  return (
    <Box
      height="80px"
      bgColor="dappTemplate.dark.darker"
      color="dappTemplate.white"
      display="flex"
      alignItems="center"
    >
      <Container
        maxW="container.xl"
        fontSize="sm"
        fontWeight="normal"
        textAlign="center"
      >
        <Box fontSize="calc(16px + 0.1vw)" fontWeight="700">
          Made with <i className="bi bi-heart-fill" style={{
            color: "rgb(3, 111, 90)"
          }}></i> by the nymblle Team
        </Box>
        <Box
          marginTop="8px"
          fontSize="calc(16px + 0.1vw)" fontWeight="700">
          Need Help? <Link href="/contact" style={{
            color: "rgb(3, 151, 90)",
            textDecoration: "underline",
          }} >Contact Us</Link>
        </Box>
      </Container>
    </Box>
  );
};
