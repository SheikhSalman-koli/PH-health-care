import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";

const createPatient = catchAsync(
     async(req: Request, res: Response)=>{
        const body = req?.body
        const result = await authServices.createPatient(body)

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "create patient successfully!",
            data: result
        })
     }
)


const loginUser = catchAsync(
     async(req: Request, res: Response)=>{
        const body = req?.body
        const result = await authServices.loginUser(body)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "cuser login successfully!",
            data: result
        })
     }
)

export const authController = {
    createPatient,
    loginUser
}