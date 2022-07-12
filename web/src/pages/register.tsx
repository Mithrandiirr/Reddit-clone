import React from 'react'
import {Form, Formik} from 'formik'
import {  Box, Button } from '@chakra-ui/react';
import Layout from '../components/Layout'
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import {useRouter} from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
interface registerProps {

}


const Register: React.FC<registerProps> = ({}) => {
    const [,register] = useRegisterMutation()
    const router = useRouter()
        return (
            <Layout variant='small'>

           <Formik initialValues={{username: "", email: "", password: ""}} onSubmit={
            async (values, {setErrors})=> { 
              const response = await register({options: values})
              if(response.data?.register.errors){
                setErrors(toErrorMap(response.data.register.errors))
              }else if(response.data?.register.user) {
                router.push('/')
              }
              }}>
           
            {({isSubmitting})=>
            (
                <Form>

                    <InputField 
                    name='username'
                    placeholder='Username'
                    label='Username' />
                    <Box mt={4}>
                    <InputField 
                    name='email'
                    placeholder='Email'
                    label='Email'
                    type="email"
                    />
                    </Box>
                    
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
                    Register
                  </Button>
                </Form>
            )
            }
           </Formik>
                           
           </Layout>
        );
}

export default withUrqlClient(createUrqlClient)(Register)