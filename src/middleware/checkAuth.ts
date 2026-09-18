/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelper/AppError";
import status from "http-status";
import { prisma } from "../app/lib/prisma";
import { envVars } from "../config/env";
import { JwtUtils } from "../utils/jwt";

export const checkAuth = (...authRole: UserRole[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(authRole.length);
        // session token varification
        const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token")

        if (!sessionToken) {
            throw new AppError(status.UNAUTHORIZED, "you have no session to access this route!")
        }

        if (sessionToken) {
            const isExistSession = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            })

            if (isExistSession && isExistSession?.user) {
                const user = isExistSession?.user

                const now = new Date()
                const expiredAt = new Date(isExistSession?.expiresAt)
                const createdAt = new Date(isExistSession?.createdAt)

                const sessionLifeTime = expiredAt.getTime() - createdAt.getTime()
                const sessionRemaining = expiredAt.getTime() - now.getTime()
                const sessionRemainingPercent = (sessionRemaining / sessionLifeTime) * 100

                if (sessionRemainingPercent < 20) {
                    res.setHeader("X-Session-Refresh", "true")
                    res.setHeader("X-Session-Expires_At", expiredAt.toISOString())
                    res.setHeader("X-Time-Remaining", sessionRemaining.toString())

                    console.log("Session Expiring Soon!!");
                }

                if (user?.status === UserStatus.BLOCKED || user?.status === UserStatus.DELETED) {
                    throw new AppError(status.UNAUTHORIZED, "unauthrized access, user is not active")
                }

                if (user?.isDeleted) {
                    throw new AppError(status.UNAUTHORIZED, "unauthrized access, user is deleted")
                }

                if (authRole.length > 0 && !authRole.includes(user?.role)) {
                    throw new AppError(status.FORBIDDEN, "forbidden access! you do not have permission to access this resources")
                }
            }
        }

        // access token verification
        const accessToken = cookieUtils.getCookie(req, 'accessToken')

        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED, "you are not authorized!")
        }

        const verifyToken = JwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET)

        if (!verifyToken.success) {
            throw new AppError(status.UNAUTHORIZED, "you are not authorized!")
        }

        if (authRole.length > 0 && !authRole.includes(verifyToken?.data!.role)) {
            throw new AppError(status.FORBIDDEN, "forbidden access! you do not have permission to access this resources")
        }

        next()

    } catch (error: any) {
        next(error)
    }
}