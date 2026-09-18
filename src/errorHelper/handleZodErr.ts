import status from "http-status";
import z from "zod";
import { TErroResponse, TErrorSoures } from "./error.interface";

export const handleZodError =(err: z.ZodError): TErroResponse =>{
    const statusCode = status.BAD_REQUEST
    const message = "Zod Validation Error"
    const errorSoures: TErrorSoures[] = []

    err.issues.forEach(issue=> {
        errorSoures.push({
            path: issue.path.length > 1 ? issue.path.join(" => ") : issue.path.toString(),
            message: issue.message
        })
    })

    return {
        success: false,
        message,
        errorSoures,
        statusCode 
    }

}