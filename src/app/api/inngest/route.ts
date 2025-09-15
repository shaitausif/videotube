import { serve } from "inngest/next";
import {inngest} from '@/inngest/client'
import { registrationEmail } from "@/inngest/functions/registrationEmail";
import { verificationEmail } from "@/inngest/functions/verificationEmail";
import { subscribersNotification } from "@/inngest/functions/subscribersNotification";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
   registrationEmail,
   verificationEmail,
   subscribersNotification
  ],
});