import { Post } from "../entities/Post"
import { User } from "../entities/User"
import { DataSource } from "typeorm"
import path from "path"

export const AppDataSource =  new DataSource({
    type: "postgres",
    username: "postgres",
    password: "123456",
    database: "reddit",
    synchronize: true,
    logging: true,
    
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post],
})
AppDataSource.initialize()
    .then(() => {
      AppDataSource.runMigrations()
    })
    .catch((error) => console.log(error))