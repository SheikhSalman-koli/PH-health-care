import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../../utils/token";
import AppError from "../../../errorHelper/AppError";
import { cookieUtils } from "../../../utils/cookie";
import { envVars } from "../../../config/env";
import auth from "../../lib/auth";

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

const getMe = catchAsync(
    async (req: Request, res: Response)=> {

        const user = req?.user

        if(!user){
            return null
        }

         const result = await authServices.getMe(user)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "profile data retrived successfully!",
            data: result
        })
    }
)

const getNewToken = catchAsync(
    async(req: Request, res: Response)=> {

        const refreshToken = req.cookies["refreshToken"]
        const betterAuthSessionToken = req.cookies["better-auth.session_token"]

         if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
        }

        const result = await authServices.getNewToken(refreshToken, betterAuthSessionToken)

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result

        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                newRefreshToken,
                sessionToken,
            },
        })
    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await authServices.changePassword(payload, betterAuthSessionToken);

        const { accessToken, refreshToken, token } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result,
        });
    }
)

const logout = catchAsync(
    async(req: Request, res: Response) => {
         const betterAuthSessionToken = req.cookies["better-auth.session_token"];

         const result = await authServices.logout(betterAuthSessionToken)

         cookieUtils.clearCookie(res, "accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
         })

         cookieUtils.clearCookie(res, "refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
         })

         cookieUtils.clearCookie(res, "better-auth.session_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
         })

         sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Logged out successfully!",
            data: result,
        });
    }
)

const verifyEmail = catchAsync(
         async(req: Request, res: Response)=>{
        const {email, otp} = req.body
        await authServices.verifyEmail(email, otp)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Verify email successfully!",
        })
     }
)

const forgotPassword = catchAsync(
         async(req: Request, res: Response)=>{
        const {email} = req.body
        await authServices.forgotPassword(email)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Forgot-password reset OTP sent",
        })
     }
)
const resetPassword = catchAsync(
         async(req: Request, res: Response)=>{
        const {email, otp, newPassword} = req.body
        await authServices.resetPassword(email, otp, newPassword)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully!",
        })
     }
)

const gooleLogin =catchAsync((req: Request, res: Response)=> {
    const redirectPath = req.query.redirect as string || "/dashboard"

    const encodedRedirectPath = encodeURIComponent(redirectPath as string)

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google-success?redirect=${encodedRedirectPath}`

    res.render("googleRedirect", {
        callbackURL: callbackURL,
        betterAuthUrl: envVars.BETTER_AUTH_URL
    })
})

const gooleSuccess = catchAsync(
    async(req: Request, res: Response)=> {
        const redirectPath = req.query.redirect as string || "/dashboard" 

        const sessionToken = req.cookies["better-auth.session_token"]

        if(!sessionToken){
            res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`)
        }

        const session = await auth.api.getSession({
            headers: {
                "Cookie" : `better-auth.session_token=${sessionToken}`
            }
        })
       

        if(!session){
            res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`)
            return null
        }

        if(session && !session.user){
            res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`)
        }

        const result = await authServices.googleSuccess(session)

        const { accessToken, refreshToken} = result

        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)

        const isValidRedirect = redirectPath.startsWith('/') && !redirectPath.startsWith('//')
        const finalRedirectPath = isValidRedirect ? redirectPath : "/dashboard"

        res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`)
    }
)

const gooleOauthError =catchAsync((req: Request, res: Response)=> {
    const error = req.query.error || "oauth_failed"
    res.redirect(`${envVars.BETTER_AUTH_URL}/login?error${error}from here`)
})

export const authController = {
    createPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    gooleLogin,
    gooleSuccess,
    gooleOauthError
}