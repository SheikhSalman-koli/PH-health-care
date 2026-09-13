import { Request, Response } from "express"
import { catchAsync } from "../../../shared/catchAsync"
import { doctorServices } from "./doctor.service"
import { sendResponse } from "../../../shared/sendResponse"
import status from "http-status"

const getAllDoctor = catchAsync(
    async(req: Request, res: Response)=> {

        const result = await doctorServices.getAllDoctors()

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "doctor fetched successfully!",
            data: result
        })
    }
)

export const doctorController = {
    getAllDoctor
}
