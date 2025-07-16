// next.config.js or next.config.mjs

const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // ✅ Google profile pictures
      'avatars.githubusercontent.com', // ✅ GitHub profile pictures
      'res.cloudinary.com'
    ],
  },
};

export default nextConfig;
