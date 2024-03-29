import "reflect-metadata";
import {ApolloServer} from 'apollo-server-express'
import express from 'express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import connectRedis from 'connect-redis'
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import cors from 'cors'
import Redis from "ioredis";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { DataSource } from "typeorm"
const main = async  () =>
{
  const AppDataSource = new DataSource({
    type: "postgres",
    username: "postgres",
    password: "123456",
    database: "reddit",
    synchronize: true,
    logging: true,
    
    migrations: ["./migrations/*"],
    entities: [User, Post],
})
  AppDataSource.initialize()
  .then(() => {
      AppDataSource.runMigrations()
    })
  .catch((error) => console.log(error))
    const app = express();
    const RedisStore = connectRedis(session)
    const redis =new Redis()
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
          client: redis as any, 
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
        context: ({ req, res}) : MyContext => ({ req, res, redis})
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
