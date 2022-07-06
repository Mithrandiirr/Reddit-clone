import React from 'react'
import { Box } from '@chakra-ui/react'
interface LayoutProps {
    children: JSX.Element
    variant?: 'small' | 'regular'
}

const Layout: React.FC<LayoutProps> = ({children, variant = 'regular'}) => {
        return (
            <Box mt={8} mx="auto" maxW={variant === 'regular' ? "800px" : "400px"} w="100%">
                {children}
            </Box>
        );
}
export default Layout