import { dedupExchange, fetchExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { cacheExchange } from '@urql/exchange-graphcache';
import { updateCache } from "./updateCache";

export const createUrqlClient = (ssrExchange : any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
      updates :{
        Mutation: {
          logout: (_result, args, cache, info) => {
            updateCache<LogoutMutation , MeQuery>(
              cache, 
              {query: MeDocument},
              _result,
              (result, query) => ({me: null})
            )
          },
          login: (_result, args, cache, info) => {
           updateCache<LoginMutation , MeQuery>(
            cache, 
            {query: MeDocument},
            _result,
            (result, query) => {
              if(result.login.errors)
              {
                return query;
              }
              else {
              return {
                me: result.login.user
              }
              }
            }
            )
          },
  
          register: (_result, args, cache, info) => {
            updateCache<RegisterMutation , MeQuery>(
             cache, 
             {query: MeDocument},
             _result,
             (result, query) => {
               if(result.register.errors)
               {
                 return query;
               }
               else {
               return {
                 me: result.register.user
               }
               }
             }
             )
           },
        }
          } 
    }), 
    ssrExchange,
    fetchExchange],
  }) 