
import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.service";
import { sendResponse } from "../../../shared/sendResponse";
import { IQueryParams } from "../../interface/query.builder";


const createMyDoctorSchedule = catchAsync( async (req : Request, res : Response) => {
    const payload = req.body;
    const user = req.user;
    if(!user){
        return null
    }
    const doctorSchedule = await doctorScheduleServices.createDoctorSchedules(user, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Doctor schedule created successfully',
        data: doctorSchedule
    });
});

const getMyDoctorSchedules = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;
    if(!user){
        return null
    }
  
    const result = await doctorScheduleServices.getMyDoctorSchedule(user, query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Doctor schedules retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});

const getAllDoctorSchedules = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result  = await doctorScheduleServices.getAllDoctorSchedules(query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'All doctor schedules retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});

const getDoctorScheduleById = catchAsync(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const scheduleId = req.params.scheduleId;
    const doctorSchedule = await doctorScheduleServices.getDoctorScheduleById(doctorId as string, scheduleId as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Doctor schedule retrieved successfully',
        data: doctorSchedule
    });
});

const updateMyDoctorSchedule = catchAsync( async (req : Request, res : Response) => {
    const payload = req.body;
    const user = req.user;
    if(!user){
        return null
    }
    const updatedDoctorSchedule = await doctorScheduleServices.updateMyDoctorSchedule(user, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,  
        message: 'Doctor schedule updated successfully',
        data: updatedDoctorSchedule
    });
});

const deleteMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user;
    if(!user){
        return null
    }
    await doctorScheduleServices.deleteMyDoctorSchedule(user, id as string, );
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Doctor schedule deleted successfully',
    });
});


export const DoctorScheduleController = {
    createMyDoctorSchedule,
    getMyDoctorSchedules,
    getAllDoctorSchedules,
    getDoctorScheduleById,
    updateMyDoctorSchedule,
    deleteMyDoctorSchedule
}