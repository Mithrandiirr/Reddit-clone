
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
    allowGlobalContext: true,
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
      },
    entities: [Post, User],
    dbName: "db",
    type: "postgresql",
    debug : !__prod__,
} as Parameters<typeof MikroORM.init>[0]
