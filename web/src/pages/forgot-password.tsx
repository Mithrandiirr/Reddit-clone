import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { Box } from '@chakra-ui/react';
import router from 'next/router';
import React, { useState } from 'react'
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { toErrorMap } from '../utils/toErrorMap';
import login from './login';
import { useChangePasswordMutation, useForgotPasswordMutation } from '../generated/graphql';

interface forgotPasswordProps {

}

const forgotPassword: React.FC<forgotPasswordProps> = ({}) => {
        const [,forgotPassword] = useForgotPasswordMutation()
        const [complete,setComplete] = useState(false)
        return (
            <Layout variant='small'>

            <Formik initialValues={{email: ''}} onSubmit={
             async (values)=> { 
               await forgotPassword(values)
               setComplete(true)
               }}>
            
             {({isSubmitting})=> complete ?<Box>We have sent you an email</Box> :
             (
                 <Form>
 
                     <InputField 
                     name='email'
                     placeholder='Email'
                     label='Email'
                     type='email'
                     />
                    
                   <Button 
                   mt={4}
                   type="submit"
                   isLoading={isSubmitting}
                   >
                     Forgot Password
                   </Button>
                 </Form>
             )
             }
            </Formik>
                            
            </Layout>
        );
}
export default forgotPassword