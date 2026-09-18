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


const getDoctorById = catchAsync(
    async(req: Request, res: Response)=> {

        const {id} = req.params
        const result = await doctorServices.getDoctorById(id as string)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "doctor fetched successfully!",
            data: result
        })
    }
)

const updateDoctor = catchAsync(
    async(req: Request, res: Response)=> {

        const {id} = req.params
        const payload = req.body
        const result = await doctorServices.updateDoctor(id as string, payload)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "doctor updated successfully!",
            data: result
        })
    }
)

const softDeleteDoctor = catchAsync(
    async(req: Request, res: Response)=> {

        const {id} = req.params
        // const isDeletedData = req.body
        const result = await doctorServices.softDeleteDoctor(id as string)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "doctor deleted successfully!",
            data: result
        })
    }
)

export const doctorController = {
    getAllDoctor,
    getDoctorById,
    updateDoctor,
    softDeleteDoctor
}
