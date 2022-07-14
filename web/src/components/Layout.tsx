import React from 'react'
import { Box } from '@chakra-ui/react'
import { Navbar } from './Navbar'
interface LayoutProps {
    children: JSX.Element
    variant?: 'small' | 'regular' | 'medium'
}

const Layout: React.FC<LayoutProps> = ({children, variant = 'regular'}) => {
        return (
            <>
            <Navbar  />
            <Box mt={8} mx="auto" maxW={variant === 'regular' ? "800px" : 'medium' ? '600px': '400px'} w="100%">
                {children}
            </Box>
            </>
            
        );
}
export default Layout