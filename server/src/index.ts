import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import microConfig from './mikro-orm.config'
import {ApolloServer} from 'apollo-server-express'
import express from 'express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import { createClient } from "redis";
import connectRedis from 'connect-redis'
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import cors from 'cors'

const main = async  () =>
{
    const orm = await MikroORM.init(microConfig)
    await orm.getMigrator().up()
    
    const app = express();
    let redisClient = createClient({ legacyMode: true })
    redisClient.connect().catch(console.error)
    let RedisStore = connectRedis(session)
    
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true
      })
    )
    app.use(
      session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
          client: redisClient as any, 
          disableTouch: true,
        }),
        cookie:{
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10 ,
          httpOnly: true,
          secure: __prod__,
          sameSite: 'lax', //csrf
        },
        saveUninitialized: false,
        secret: "cvcxvxcvxfffggd",
        resave: false,
      })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res}) : MyContext => ({em :orm.em , req, res})
    })
    apolloServer.applyMiddleware({
        app,
        cors: false
      });

    app.listen(4000, () => {
    console.log('server started on localhost:4000')
    })
}
main().catch((err) => {
    console.error(err)
})
