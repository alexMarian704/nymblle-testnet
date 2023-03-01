import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        minHeight: '100vh',
        overflowX: 'hidden',
        color: 'dappTemplate.white',
        bgColor: 'rgb(30, 66, 70)',
        bg: 'radial-gradient(circle, rgba(30, 66, 70, 1) 10%, rgba(12, 12, 12, 1) 100%)',
        bgRepeat: 'no-repeat',
        bgAttachment: 'fixed',
      },
      '*': {
        '&::-webkit-scrollbar': {
          width: 1.5,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'dappTemplate.dark.base',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'dappTemplate.light',
          borderRadius: 1.5,
        },
        scrollbarWidth: 'auto',
        scrollbarColor: 'dappTemplate.light dappTemplate.dark.base',
      },
    },
  },
  // fonts: {
  //   heading: 'Poppins, sans-serif',
  //     body: 'Poppins, sans-serif',
  //   },
  colors: {
    dappTemplate: {
      bgStripes: '#2c3440',
      shadowColor: '#141414',
      dark: {
        lighter: '#3c4757',
        base: '#222831',
        darker: 'rgb(18,18,18)',
      },
      light: '#FAFFFD',
      white: '#ffffff',
      color1: {
        lighter: '#59a1ea',
        base: '#3C91E6',
        darker: '#1c7bda',
      },
      color2: {
        lighter: '#b0dd49',
        base: '#A2D729',
        darker: '#8ab722',
      },
      color3: {
        lighter: '#fb9567',
        base: '#FA824C',
        darker: '#f9611c',
      },
    },
  },
  components: {
    Alert: {
      variants: {
        subtle: {
          container: {
            bg: 'dappTemplate.dark.lighter',
          },
        },
      },
    },
  },
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1560px',
  },
});
