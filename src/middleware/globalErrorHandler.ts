/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErroResponse, TErrorSoures } from "../errorHelper/error.interface";
import { handleZodError } from "../errorHelper/handleZodErr";
import AppError from "../errorHelper/AppError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log(err);
    }

    let errorSoures: TErrorSoures[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR
    let message: string = "Internal Server Error"
    let stack: string | undefined = undefined

    if (err instanceof z.ZodError) {
        const simpilfiedError = handleZodError(err)
        statusCode = simpilfiedError.statusCode as number
        message = simpilfiedError.message
        errorSoures = [...simpilfiedError.errorSoures]
        // stack = err.stack
    }else if(err instanceof AppError){
        statusCode = err.statusCode
        message = err.message
        stack = err.stack
        errorSoures = [
            {
                path: '',
                message: err.message
            }
        ]
    }else if(err instanceof Error){
        statusCode = status.INTERNAL_SERVER_ERROR
        message = err.message
        stack = err.stack
        errorSoures = [
            {
                path: '',
                message: err.message
            }
        ]
    }

    const errorResponse: TErroResponse = {
        success: false,
        message: message,
        errorSoures,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorResponse)
}