import { FC, PropsWithChildren } from 'react';
import { Box } from '@chakra-ui/react';
import { Logo } from './Logo';

export const HeaderMenu: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap="2"
      py={2}
      borderBottom="1px solid rgb(110,110,110)"
    >
      <Logo />
      {children}
    </Box>
  );
};
