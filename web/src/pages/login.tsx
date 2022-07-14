import React from 'react'
import {Form, Formik} from 'formik'
import {  Box, Button, Flex } from '@chakra-ui/react';
import Layout from '../components/Layout'
import InputField from '../components/InputField';
import { useLoginMutation, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import {Link} from '@chakra-ui/react';
import NextLink from 'next/link'
interface registerProps {

}


const Login: React.FC<registerProps> = ({}) => {
    const [,login] = useLoginMutation()
    const router = useRouter()
  console.log(router)
        return (
            <Layout variant='small'>

           <Formik initialValues={{usernameOrEmail: "", password: ""}} onSubmit={
            async (values, {setErrors})=> { 
              const response = await login(values)
              if(response.data?.login.errors){
                setErrors(toErrorMap(response.data.login.errors))
              }else if(response.data?.login.user) {
                if(typeof router.query.next === 'string')
                {
                  router.push(router.query.next)
                }
                else {
                  router.push('/')
                }
              }
              }}>
           
            {({isSubmitting})=>
            (
                <Form>

                    <InputField 
                    name='usernameOrEmail'
                    placeholder='Username or Email'
                    label='Username or Email' />
                    <Box mt={4}>
                    <InputField 
                    name='password'
                    placeholder='password'
                    label='Password'
                    type="password"
                    />
                        </Box>
                        <Flex mt={4} alignItems='center'>
                        <Button 
                  
                  type="submit"
                  isLoading={isSubmitting}
                  >
                    login
                  </Button>

                  <NextLink  href='/forgot-password'>
                    <Link width='100%' textAlign='end'>
                    Forgot Password ?
                    </Link>
                 
                  </NextLink>
                        </Flex>
                  
                </Form>
            )
            }
           </Formik>
                           
           </Layout>
        );
}

export default withUrqlClient(createUrqlClient)(Login)