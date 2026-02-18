export interface UserInterface {
  _id: string;
  avatar: string
  username: string;
  fullName? : string;
  email: string;
  bio?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}
