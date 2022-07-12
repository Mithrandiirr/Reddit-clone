import { User } from '../entities/User'
import { MyContext } from 'src/types'
import {Resolver, Arg, Mutation, Field, Ctx, ObjectType, Query} from 'type-graphql'
import argon2 from 'argon2'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { validateRegister } from '../utils/validateRegister'
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput'
import { v4 } from 'uuid'
import { sendEmail } from '../utils/sendEmail'
import {AppDataSource} from '../utils/DataSource'

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[]
    @Field(()=> User , {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async users(): Promise<User[]> {
        return User.find()
    }

    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {req}: MyContext
    ){
        if(!req.session.userId)
        {
            return null
        }
        const user = await User.findOne({where : {id:req.session.userId}})
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { req} : MyContext
    ) : Promise<UserResponse> {
       
        const errors = validateRegister(options)
        if(errors) {
            return {errors}
        }
        const hashedPassword = await argon2.hash(options.password)
        let user


        try{
           const result = await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        username: options.username,
        email: options.email,
        password: hashedPassword,
    })
    .returning('*')
    .execute()
    console.log('result', result)
    user = result.raw[0]
    
        }
       catch(err) {
      if(err.code === '23505')
      {
        return {
            errors: [ {
                field: "username",
                message: "username already has been taken."
            }]
        }
      }
       }
       // store user id session
       // this will set a cookie on the user
       // keep them logged in
       req.session.userId = user.id
        return {user}
    }

    @Mutation(() =>UserResponse)
    async changePassword(
        @Arg("token") token : string,
        @Arg("newPassword") newPassword : string,
        @Ctx() {redis,req} : MyContext
    ): Promise<UserResponse> {
        if(newPassword.length <=2) {
            return {errors:[
                {
                    field: "newPassword",
                    message: "length must be greater than 2"
                }
            ]}
        }
        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if(!userId) {
            return {errors:[
                {
                    field: "token",
                    message: "token expired"
                }
            ]}  
        }
        const parsed = parseInt(userId)
        const user = await User.findOne({where: {id: parsed} })
        
        if(!user){
            return{
                errors:[
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            }
        }
  
        await User.update({id: parsed}, {
            password:await argon2.hash(newPassword)
        })
        await redis.del(key)
        req.session.userId = user.id
        return {user}


    }



    @Mutation(()=> Boolean)
    async forgotPassword(@Arg("email") email:string , @Ctx() {redis}: MyContext)
    {
        const user = await User.findOne({where: {email}})
        if(!user){ return true}

        const token = v4()

        await redis.set(
        FORGET_PASSWORD_PREFIX + token
        ,user.id,
        "ex" as any,
         1000* 60 *60 *24*3
         );
         await sendEmail(
            email,
            `<a href="http:localhost:3000/change-password/${token}">Reset Password</a>`
         )
         return true
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req} : MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
        usernameOrEmail.includes("@") 
        ?{ where : {email: usernameOrEmail}}
        : {where : {username: usernameOrEmail}}
        )
        if(!user)
        {
            return {
                errors : [{
                    field: "usernameOrEmail",
                    message: "username doesn't exist",
                }]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if(!valid)
        {
            return{
                errors: [{
                    field: "password",
                    message: "incorrect password",
                }]
            }
        }
        req.session.userId = user.id
        return {
            user,
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res} : MyContext
    ) {
       return new Promise(resolve => req.session.destroy(err =>
        {
            res.clearCookie(COOKIE_NAME)
            if(err) {
                
                 console.log(err)
                 resolve(false)
                return
            }
            resolve(true)
          

        }))
    }
}