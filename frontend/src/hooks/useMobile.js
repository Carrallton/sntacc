import { useMediaQuery } from '@mui/material';

export const useMobile = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isTablet
  };
};