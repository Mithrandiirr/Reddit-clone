import { Post } from '../entities/Post'
import {Resolver, Query, Arg,  Mutation, Field, InputType, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType} from 'type-graphql'
import { MyContext } from 'src/types'
import { isAuth } from '../middleware/isAuth'
import { AppDataSource } from '../utils/DataSource'

@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text:string
}

@ObjectType()
class PaginationPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0,80)
    }

    @Query(() => PaginationPosts)
    async posts(
        @Arg('limit', () => Int) limit : number,
        @Arg('cursor', ()=> String , {nullable: true}) cursor : string | null
    ): Promise<PaginationPosts> {
        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = Math.min(50, limit) +1
        const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await AppDataSource.query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );
        // const qb =  AppDataSource
        // .getRepository(Post)
        // .createQueryBuilder("p")
        // .orderBy('"createdAt"' , 'DESC')     
        // .take(realLimitPlusOne);
        
        // if(cursor) {
        //     qb.where('"createdAt" <:cursor', { 
        //         cursor: new Date(parseInt(cursor))
        //      });
        // };
        // const posts = await qb.getMany();
        return{ 
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === realLimitPlusOne
        }
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg('id') id: number): Promise<Post| null>  {
        return Post.findOne({where: {id}})
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() {req} : MyContext
        ): Promise<Post>
        {
      
        return Post.create({
            ...input,
            creatorId: req.session.userId
        }).save()
    }

    @Mutation(() => Post)
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String , { nullable:true}) title: string
        ): Promise<Post | null>  {
            const post = await Post.findOne({where: {id}});
            if(!post)
            {
                return null
            }
            if(typeof title!== 'undefined')
            {
                Post.update({id}, {title})
            }

        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number
        ): Promise<boolean>  {
            try{
               Post.delete(id)
            }
            catch(err)
            {
                console.error(err)
            }
           
        return true
    }
}