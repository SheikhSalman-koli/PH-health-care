/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler,) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error: any) {
            // const message = error instanceof Error ? error?.message : "unknow error"
            // res.status(500).json({
            //     success: false,
            //     message: "failed to fetch",
            //     error: message
            // })
            next(error)
        }
    }
}
