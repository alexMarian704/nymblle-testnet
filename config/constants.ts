// Your Dapp hostname example: https://www.mydapp.com it should come from env vars
export const dappHostname = process.env.NEXT_PUBLIC_DAPP_HOST;

export const defaultMetaTags = {
  title: 'SmartStack | App',
  description: 'SmartStack App',
  image: `${dappHostname}/og-image.png`,
};
