import { VideoInterface } from "@/models/video.model";

export interface PlaylistOwner {
    _id: string;
    username: string;
    avatar: string;
    fullName: string;
}

export interface PlaylistInterface {
    _id: string;
    name: string;
    description: string;
    videos: VideoInterface[];
    owner: PlaylistOwner;
    createdAt: string;
    updatedAt: string;
}
