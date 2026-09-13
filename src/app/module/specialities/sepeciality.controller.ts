import { Request, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";

const createSpeciality = catchAsync(
    async(req: Request, res: Response) => {
        const payload = req?.body

        const result =await specialityService.createSpeciality(payload)

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "speciality created successfully!",
            data: result
        })
    }
)



const getallSpeciality = catchAsync(
    async (req: Request, res: Response)=> {
         const result = await specialityService.getAllSpeciality()
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: "all speciality retrived successfully!",
            data: result
        })
    }
)


const updateSpeciality = catchAsync(
    async(req: Request, res: Response) => {
         const {id} = req.params
        const result = await specialityService.updateSpeciality(id as string, req.body)

        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: "speciality updated successfully!",
            data: result
        })
    }
)

export const specialityController = {
    createSpeciality,
    getallSpeciality,
    updateSpeciality
}