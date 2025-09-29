import { useMediaQuery } from 'react-responsive';

/**
 * Custom hook for detecting mobile screen sizes
 * Returns true for mobile devices (768px and below)
 */
export const useMobileDetection = () => {
  const isMobile = useMediaQuery({ 
    query: '(max-width: 768px)' 
  });
  
  const isTablet = useMediaQuery({ 
    query: '(min-width: 769px) and (max-width: 1024px)' 
  });
  
  const isDesktop = useMediaQuery({ 
    query: '(min-width: 1025px)' 
  });
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    // Convenience flag for anything smaller than desktop
    isSmallScreen: isMobile || isTablet
  };
};