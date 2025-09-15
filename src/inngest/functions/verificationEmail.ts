import { NonRetriableError } from "inngest"
import { sendVerificationEmail } from "../../../helpers/SendVerificationEmail"
import { inngest } from "../client"






export const verificationEmail = inngest.createFunction(
    { id : "user-verification" },
    { event : "user/verification" },
    async({event, step}) => {
        try {
            const { email, username, verificationCode } = event.data

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