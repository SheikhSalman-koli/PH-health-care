import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { userServices } from "./user.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";


const createDoctor = catchAsync(
    async(req: Request, res: Response)=> {
        const payload = req?.body
        const result = await userServices.createDoctor(payload)

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "doctor created successfully!",
            data: result
        })
    }
)


const createSuperAdmin = catchAsync(
    async(req: Request, res: Response)=> {
        const payload = req?.body
        const result = await userServices.createSuperAdmin(payload)

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "super-admin created successfully!",
            data: result
        })
    }
)


const createAdmin = catchAsync(
    async(req: Request, res: Response)=> {
        const payload = req?.body
        const result = await userServices.createAdmin(payload)

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "admin created successfully!",
            data: result
        })
    }
)


export const userController = {
    createDoctor,
    createSuperAdmin,
    createAdmin
}