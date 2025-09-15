import {resend} from "@/lib/resend"
import RegistraionEmail from "../emails/RegistrationEmail";


// Here, in this file we're sending verification email to the respective email address with exception handling
// Emails are always asynchronous
export async function sendRegistrationEmail(
    email : string,
    username : string,
) {
    try {
        await resend.emails.send({
            from: 'VideoTube <onboarding@resend.dev>',
            to: email,
            subject: 'Videotube | Registration Email',
            react: RegistraionEmail({username, email}),
          });

        return {success : true, message : 'Verification Email sent successfully.'}
    } catch (emailError) {
        console.error('Email sending error:',emailError)
        return {success : false, message : 'Failed to send Verification email'}
    }
}