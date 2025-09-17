import {resend} from "@/lib/resend"
import SubscriptionExpiryEmail from "../emails/SubscriptionExpiryEmail";


// Here, in this file we're sending verification email to the respective email address with exception handling
// Emails are always asynchronous
export async function sendExpiryEmail(
    email : string,
    username : string,

) {
    try {
        await resend.emails.send({
            from: 'VideoTube <onboarding@resend.dev>',
            to: email,
            subject: 'Videotube | Plan Expiration',
            react: SubscriptionExpiryEmail({username}),
          });

        return {success : true, message : 'Subscription Expiry Email sent successfully.'}
    } catch (emailError) {
        console.error('Email sending error:',emailError)
        return {success : false, message : 'Failed to send Subscription Expiry email'}
    }
}