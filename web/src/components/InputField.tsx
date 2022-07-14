import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { Form, useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement>  & {
name:string
label: string
textarea?: boolean
}

const InputField: React.FC<InputFieldProps> = ({label,textarea, size:_, ...props}) => {

  
  const [field, {error}] = useField(props)
  let InputOrTextarea:any = Input;
  if (textarea) {
    InputOrTextarea = Textarea;
  }
    return (
        <FormControl isInvalid={!!error}>
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <InputOrTextarea {...field} {...props} id={field.name} placeholder={props.placeholder} />
       {error? <FormErrorMessage>{error}</FormErrorMessage>:null }
      </FormControl>
        );
}
export default InputField