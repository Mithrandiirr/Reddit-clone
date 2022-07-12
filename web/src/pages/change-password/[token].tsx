import { Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Layout from '../../components/Layout';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import {Box} from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link'

interface ChangePasswordProps {
}

const ChangePassword: NextPage<{token: string}> = ({token}) => {
        const router = useRouter()
    const [,changePassword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState('')
    return (
            <Layout variant='small'>

            <Formik initialValues={{newPassword: ''}} onSubmit={
             async (values, {setErrors})=> { 
               const response = await changePassword({newPassword: values.newPassword, token})
               
               if(response.data?.changePassword.errors){
                const errorMap= toErrorMap(response.data.changePassword.errors)
                if('token' in errorMap)
                {
                    setTokenError(errorMap.token)
                }
                setErrors(errorMap)
                }else if(response.data?.changePassword.user) {
                 router.push('/')
               }
               }}>
            
             {({isSubmitting})=>
             (
                 <Form>
 
                     <InputField 
                     name='newPassword'
                     placeholder='new password'
                     label='New Password'
                     type='password'
                     />
                  { tokenError ?
                  <>
                  <Box color='red'>{tokenError}</Box>
                  <NextLink href='/forgot-password'>
                    <Link>Forgot Password?</Link>
                  </NextLink>
                  </>
                   
                   
                   : null}
                   <Button 
                   mt={4}
                   type="submit"
                   isLoading={isSubmitting}
                   >
                     Change Password
                   </Button>
                 </Form>
             )
             }
            </Formik>
                            
            </Layout>
        );
}
ChangePassword.getInitialProps = ({query}) => {
    return {
        token: query.token as string
    }
}
export default withUrqlClient(createUrqlClient, {ssr: false})(ChangePassword)