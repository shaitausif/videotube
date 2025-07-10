import mongoose, { Schema , Document } from "mongoose";


export interface Playlist extends Document{
    name : string,
    description : string,
    videos : [mongoose.Types.ObjectId],
    owner : mongoose.Types.ObjectId,
    createdAt? : Date,
    updatedAt? : Date,
}

const playlistSchema = new Schema<Playlist>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.models.Playlist || mongoose.model<Playlist>("Playlist", playlistSchema);