import { useRouter } from "next/router"
import React from "react"
import { useMeQuery } from "../generated/graphql"

export const useIsAuth = () => {
    const router = useRouter()
    const [{data,fetching}] = useMeQuery()

React.useEffect(()=> {
  if(!fetching && !data?.me)
  {
    router.replace('/login?next=' + router.pathname)
  }
}, [fetching, data, router])
}