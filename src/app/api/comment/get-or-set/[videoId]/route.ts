import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Comment } from "@/models/comment.model";
import { Video } from "@/models/video.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { PostCommentSchema } from "@/schemas/PostCommentSchema";


// This controller is for posting comments on videos
export async function POST(req : NextRequest,
    { params }: { params: { videoId: string } }
){
    try {
        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        const { videoId } = params
        const { content } = await req.json()
        if(!content) return NextResponse.json({success : false, message : "Content is required"},{ status : 400 })
        const result = PostCommentSchema.safeParse({comment: content})
        if(!result.success) return NextResponse.json({success : false, message : "Invalid inputs"}, {status : 400})
        
        await ConnectDB();
        const isVideoExist = await Video.findById(videoId)
        if(!isVideoExist) return NextResponse.json({success : false, message : "Video doesn't exist"},{status : 404})
    
        const commentCreated = await Comment.create({
            content,
            video : videoId,
            owner : payload._id
        })
        if(!commentCreated) return NextResponse.json({success : false, message : "Unable to comment"},{status : 500})

        const comment = await Comment.aggregate([
            {
                $match : {
                    _id : new mongoose.Types.ObjectId(commentCreated._id)
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "owner",
                    pipeline : [
                        {
                            $project : {
                                avatar : 1,
                                fullName : 1,
                                username : 1
                            }
                        }
                    ]
                },
                
            },
            { $unwind: "$owner" },
            { $addFields : {
              isLiked : false,
              likesCount : 0
            }
          },
            { $project : {
                content : 1,
                owner : 1,
                createdAt : 1,
                updatedAt : 1,
                isLiked : 1,
                likesCount : 1
            }}
        ])

        return NextResponse.json({success : true , data : comment[0], message : "Comment added successfully"},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}



// This controller is for getting comments for a video
export  async function GET(req : NextRequest,
    { params }: { params: { videoId: string } }
) {
   try {
     const { videoId } = params
     const { searchParams } = new URL(req.url)
     const page = searchParams.get("page") || 1
     const limit: any = searchParams.get("limit") || 10
     const skip = (Number(page) -1) * Number(limit)
     const {payload} = await getCurrentUser(req)

 
    //  const filter: any = {}
    //  if(videoId){
    //      filter.video = videoId
    //  }
 
 
     await ConnectDB()
const result = await Comment.aggregate([
  {
    $match: {
      video: new mongoose.Types.ObjectId(videoId)
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            avatar: 1,
            fullName: 1,
            username: 1
          }
        }
      ]
    },
    
  },
  {
    $lookup : {
      from : "likes",
      localField : "_id",
      foreignField : "comment",
      as : "likesCount",
      pipeline : [
        {
          $project : {
            comment : 1,
            likedBy : 1
          }
        }
      ]
    }
  },
  {
    $lookup : {
      from : "dislikes",
      localField : "_id",
      foreignField : "comment",
      as : "disLikesCount"
    }
  },
  {
    $addFields : {
      isLiked : {
        $cond : {
          if: { $in: [new mongoose.Types.ObjectId(payload?._id), "$likesCount.likedBy"] },
                      then: true,
                      else: false,
        }
      },
      isDisLiked : {
        $cond : {
          if : { $in : [ new mongoose.Types.ObjectId(payload?._id), "$disLikesCount.disLikedBy"]},
          then : true,
          else : false
        }
      },
      disLikesCount : {
        $size : "$disLikesCount"
      },
      likesCount : {
        $size : "$likesCount"
      },
      
    }
  },
  {
    $unwind: {
      path: "$owner",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      video: 0 // remove video field
    }
  },
  {
    $sort : {
      createdAt : -1
    }
  },
  {
    $facet: {
      data: [
        { $skip: skip },
        { $limit: limit }
      ],
      total: [
        { $count: "count" }
      ]
    }
  },
  {
    $project: {
      comments: "$data",
      total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] }
    }
  }
]);

const comments = result[0]?.comments || [];
const total = result[0]?.total || 0;
     
     return NextResponse.json({success : true, data : {comments, total} , message : "Comments fetched successfully."},{status : 200})
   } catch (error) {
    return NextResponse.json({success : false, message : error},{status : 500})
   }
}



