import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import { adminServices } from "./admin.service";

const getAllAdmin = catchAsync(
    async(req: Request, res: Response)=>{
        const result = await adminServices.getAllAdmin()

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "all admin fetched successfully!",
            data: result
        })
    }
)


const getAdminById = catchAsync(
    async(req: Request, res: Response)=>{
        const {id} = req.params
        const result = await adminServices.getAdminById(id as string)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "get a particuler admin successfully!",
            data: result
        })
    }
)

const updateAdmin = catchAsync(
    async(req: Request, res: Response)=>{
        const {id} = req.params
        const payload = req.body
        const result = await adminServices.updateAdmin(id as string, payload)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "admin updated successfully!",
            data: result
        })
    }
)


const deleteAdmin = catchAsync(
    async(req: Request, res: Response)=>{
        const {id} = req.params
        const result = await adminServices.deleteAdmin(id as string)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "admin deleted successfully!",
            data: result
        })
    }
)


export const adminController = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin
}