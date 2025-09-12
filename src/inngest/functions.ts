import { NonRetriableError } from "inngest";
import { sendRegistrationEmail } from "../../helpers/SendRegistrationEmail";
import { inngest } from "./client";
import { success } from "zod";
import { sendVerificationEmail } from "../../helpers/SendVerificationEmail";


export const registrationEmail = inngest.createFunction(
    { id : "user-registraion" },
    { event : 'user/sign-up' },

    async({ event, step }) => {
        try {
            const { email, username } = event.data
            // Send Registration Email
            const emailResponse = await step.run('get-email-response',async() => {
                const res = await sendRegistrationEmail(email, username)
                if(!res.success){
                    throw new NonRetriableError("Failed to send the registration Email to the User.")
                }
                return res
            })
            console.log(emailResponse)
        } catch (error: any) {
            console.log("Error running step",error.message)
            return {success : false}
        }
    }
)



export const verificationEmail = inngest.createFunction(
    { id : "user-verification" },
    { event : "user/verification" },
    async({event, step}) => {
        try {
            const { email, username, verificationCode } = event.data
            console.log(verificationCode, username, email)

            const emailResponse = await step.run('get-email-res',async() => {
                
                const res = await sendVerificationEmail(email, username, verificationCode)
                if(!res.success){
                    throw new NonRetriableError("Failed to send the Verification Email to the user")
                }
                return res
            })
            console.log(emailResponse)
        } catch (error: any) {
            console.log("Error running step",error.message)
            return {success : false}
        }
    }
)