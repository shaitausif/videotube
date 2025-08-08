# This is the Documentation of a Full Stack application named as VidoeTube developed as the combination of YouTube and Twitter with a Real-time messaging features to the user like Whatsapp. 

- The First thing I want to tell about this project is I wrote custom logic for signing up the user and logging in the user and also used NextAuth for third party auth provider I know it's not the best practice but still I am doing it in that way to learn as much as possible.


- I am going to use a package named as next-themes to allow the user to switch between themes like light and dark mode Since React context is not supported in server components. Trying to create a context at the root of your application will cause an error. and so to not make our whole application a client side application I am using next-theme to avoid that


- My getCurrentUser function is going to do the work of verifying JWT in each component even though i know it's very repititive thing but still I don't have any other option as Next.js runs on edge serverless function so that means each function or endpoint is running independently.