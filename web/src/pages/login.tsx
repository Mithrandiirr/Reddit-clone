import React from 'react'
import {Form, Formik} from 'formik'
import {  Box, Button } from '@chakra-ui/react';
import Layout from '../components/Layout'
import InputField from '../components/InputField';
import { useLoginMutation, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
interface registerProps {

}


const Login: React.FC<registerProps> = ({}) => {
    const [,login] = useLoginMutation()
    const router = useRouter()
        return (
            <Layout variant='small'>

           <Formik initialValues={{usernameOrEmail: "", password: ""}} onSubmit={
            async (values, {setErrors})=> { 
              const response = await login(values)
              if(response.data?.login.errors){
                setErrors(toErrorMap(response.data.login.errors))
              }else if(response.data?.login.user) {
                router.push('/')
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
                  <Button 
                  mt={4}
                  type="submit"
                  isLoading={isSubmitting}
                  >
                    login
                  </Button>
                </Form>
            )
            }
           </Formik>
                           
           </Layout>
        );
}

export default withUrqlClient(createUrqlClient)(Login)