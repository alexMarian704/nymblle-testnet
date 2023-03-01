import { Box, BoxProps } from '@chakra-ui/react';
import { FC, useCallback, PropsWithChildren } from 'react';

interface ActionButtonProps extends BoxProps {
  onClick: () => void;
  isFullWidth?: boolean;
  disabled?: boolean;
}

export const ActionButton: FC<PropsWithChildren<ActionButtonProps>> = ({
  children,
  onClick,
  isFullWidth = false,
  disabled = false,
  ...props
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick?.();
    }
  }, [disabled, onClick]);

  return (
    <Box
      as="button"
      borderColor="rgb(3, 111, 90)"
      borderWidth={2}
      bgColor="transparent"
      fontSize="calc(16px + 0.1vw)"
      py={1}
      px={6}
      rounded="8px"
      fontWeight="600"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      color="dappTemplate.white"
      userSelect="none"
      _hover={!disabled ? { bg: 'rgb(3, 111, 90)' } : {}}
      transition="background-color .3s"
      width={isFullWidth ? '100%' : 'auto'}
      onClick={handleClick}
      opacity={!disabled ? 1 : 0.5}
      {...props}
      outline="none"
    >
      {children}
    </Box>
  );
};
