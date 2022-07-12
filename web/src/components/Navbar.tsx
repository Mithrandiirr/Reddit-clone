import {Box, Button, Flex, Link} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
interface NavbarProps {

}

export const Navbar: React.FC<NavbarProps> = ({}) => {
    const [{fetching: logoutFetching},logout] = useLogoutMutation()
    const [{data, fetching}] = useMeQuery()
    let body = null;
    if(fetching)
    {
    }
    else if(!data?.me)
    {
        body = (
            <>
            <NextLink href='/login'>
            <Link mr={4}>Login</Link>
            </NextLink>
            <NextLink  href='/register'>
            <Link >Register</Link>
            </NextLink>
            </>
        )
    }
    else {
        body = 
            (<Flex alignItems={'center'} gap={4}>
                <Box>{data.me.username}</Box>
                <Button onClick={() => logout()} isLoading={logoutFetching}>Logout</Button>
            </Flex>)
    }
        return (
            <Flex bg='tan' p={4} >
                <Box ml={'auto'} >
                    {body}
                </Box>
            </Flex>
        );
}