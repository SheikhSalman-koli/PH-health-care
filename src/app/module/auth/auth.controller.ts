import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../../utils/token";

const createPatient = catchAsync(
     async(req: Request, res: Response)=>{
        const body = req?.body
        const result = await authServices.createPatient(body)

         const {accessToken, refreshToken, token, ...rest} = result

        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, token as string)


        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "create patient successfully!",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
     }
)


const loginUser = catchAsync(
     async(req: Request, res: Response)=>{
        const body = req?.body
        const result = await authServices.loginUser(body)

        const {accessToken, refreshToken, token, ...rest} = result

        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, token)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "cuser login successfully!",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
     }
)

export const authController = {
    createPatient,
    loginUser
}