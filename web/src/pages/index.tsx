import { Box, Button, Flex, Heading, Link, Spinner, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import { Navbar } from "../components/Navbar"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"
import NextLink from 'next/link'
import Layout from "../components/Layout"
import { useState } from "react"
const Index = () => 
{
    const [variables , setVariables ] = useState({
        limit:10,
        cursor: null as null | string
    })
const [{data, fetching}] = usePostsQuery({
    variables
})
console.log(data?.posts.hasMore)
    return(
    <Layout variant="medium">
        <>
      
     <NextLink href='/create-post'>
     <Link fontWeight={500} >
     Create Post
     </Link>
     </NextLink>
     {!data && fetching ?
  (  <Flex justifyContent='center'><Spinner speed="0.7s" color='red.500' thickness="3px" /></Flex> )
  :
  <Stack mt={5}  spacing={8}>
  {!data ? null : data.posts.posts.map((p)=> 
  <Box p={4} key={p.id} shadow='md' borderWidth='1px'> 
     <Heading  fontSize='xl'>
     {p.title}
     </Heading>
     <Text mt={4}>
     {p.textSnippet}
     </Text>
  </Box>
  )}
  </Stack>
    }
  {data && data.posts.hasMore ? 
<Flex>
    <Button onClick={() =>setVariables({
        limit: variables.limit,
        cursor: data.posts.posts[data.posts.posts.length -1].createdAt
    })} isLoading={fetching} m='auto' my={8}>
    Load More
    </Button>
</Flex>  
: null
}
        </>
    
   
    </Layout>
)}
export default withUrqlClient(createUrqlClient, {ssr: false})(Index)
