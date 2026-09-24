import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { superAdminServices } from "./super.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";

const getAllSuperAdmin = catchAsync(
    async(req: Request, res: Response)=>{
        const result = await superAdminServices.getAllSuparAdmin()

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "all super-admin fetched successfully!",
            data: result
        })
    }
)


const getSuperAdminById = catchAsync(
    async(req: Request, res: Response)=>{
        const {id} = req.params
        const result = await superAdminServices.getSuparAdminById(id as string)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "get a particuler super-admin successfully!",
            data: result
        })
    }
)

const updateSuperAdmin = catchAsync(
    async(req: Request, res: Response)=>{
        const {id} = req.params
        const payload = req.body
        const result = await superAdminServices.updateSuperAdmin(id as string, payload)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "super-admin updated successfully!",
            data: result
        })
    }
)


const deleteSuperAdmin = catchAsync(
    async(req: Request, res: Response)=>{
        const {id} = req.params
        const user = req.user

        if(!user){
            return null
        }
        const result = await superAdminServices.deleteSuperAdmin(id as string, user)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "super-admin deleted successfully!",
            data: result
        })
    }
)


export const superAdminController = {
    getAllSuperAdmin,
    getSuperAdminById,
    updateSuperAdmin,
    deleteSuperAdmin
}