import { Post } from "../entities/Post"
import { User } from "../entities/User"
import { DataSource } from "typeorm"

export const AppDataSource =  new DataSource({
    type: "postgres",
    username: "postgres",
    password: "123456",
    database: "reddit",
    synchronize: true,
    logging: true,
    entities: [User, Post],
})
AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))