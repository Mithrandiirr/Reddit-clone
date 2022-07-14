import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { updateCache } from "./updateCache";

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginationPosts",
      hasMore,
      posts: results,
    };
  };
};
export const createUrqlClient = (ssrExchange : any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
      keys: {
        PaginationPosts: () => null
      },
      resolvers:{
        Query : {
          posts: cursorPagination()
        },
      },
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