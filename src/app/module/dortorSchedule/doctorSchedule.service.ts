import status from "http-status";
import AppError from "../../../errorHelper/AppError";
import { DoctorSchedules, Prisma } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.builder";
import { ICreateRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { doctorScheduleFilterableFields, doctorScheduleIncludeConfige, doctorScheduleSearchableFields } from "./doctorSchedule.constant";
import { ICreateDoctorSchedulePayload, IUpdateDoctorSchedulePayload } from "./doctorSchedule.interface";


const createDoctorSchedules = async (user: ICreateRequestUser ,payload: ICreateDoctorSchedulePayload) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where : {
            email : user.email
        },
        select: {id: true}
    })

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
        doctorId : doctorData.id,
        scheduleId
    }))

    await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    })

    const result = await prisma.doctorSchedules.findMany({
        where:{
            doctorId: doctorData.id,
            scheduleId: {
                in: payload.scheduleIds
            }
        },
        include: {
            schedule: true
        }
    })

    return result

}

const getMyDoctorSchedule = async (user: ICreateRequestUser, query: IQueryParams) => {
    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user.email
        },
        select: {id: true}
    })

    const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(
        prisma.doctorSchedules,
        {
            doctorId: doctorData?.id,
            ...query
        },
        {
            searchableFields: doctorScheduleSearchableFields,
            filterableFields: doctorScheduleFilterableFields
        }
    )

    const doctorSchedules = await queryBuilder
        .search()
        .sort()
        .where(
            {isBooked: false}
        )
        .include({
            schedule: true,
            doctor: {
                include: {
                    user: true
                }
            }
        })
        .dynamicInclude(doctorScheduleIncludeConfige)
        .pagination()
        .execute()

        return doctorSchedules
}

const getAllDoctorSchedules = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules, query, {
        filterableFields: doctorScheduleFilterableFields,
        searchableFields: doctorScheduleSearchableFields
    })

    const result = await queryBuilder
    .search()
    .filter()
    .pagination()
    .dynamicInclude(doctorScheduleIncludeConfige)
    .sort()
    .execute();

    return result;
}

const getDoctorScheduleById =async(doctorId: string, scheduleId: string)=>{
    const result = await prisma.doctorSchedules.findUnique({
        where:{
            doctorId_scheduleId: {
                doctorId: doctorId,
                scheduleId: scheduleId
            }
        },
        include:{
            schedule: true,
            doctor: true
        }
    })

    return result
}

const updateMyDoctorSchedule =async(user: ICreateRequestUser, payload: IUpdateDoctorSchedulePayload)=>{

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user.email
        },
        select: {id: true}
    })

    if(!doctorData){
        throw new AppError(status.NOT_FOUND, 'Doctor not found')
    }

    const deleteIds = payload.scheduleIds.filter((schedule) => schedule.shouldDelete).map((schedule) => schedule.id)

    const createIds = payload.scheduleIds.filter((schedule)=> !schedule.shouldDelete).map((schedule)=> schedule.id)

    const result = await prisma.$transaction(async(tx)=>{
        await tx.doctorSchedules.deleteMany({
            where:{
                isBooked: false,
                doctorId: doctorData.id,
                scheduleId: {
                    in: deleteIds
                }
            }
        })

        const scheduleData = createIds?.map((scheduleId)=>({
             doctorId: doctorData.id,
             scheduleId
        }))

        await tx.doctorSchedules.createMany({
            data: scheduleData
        })

    })

    return result

}


const deleteMyDoctorSchedule =async(user: ICreateRequestUser, id: string)=>{
    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user.email
        },
        select: {id: true}
    })

    if(!doctorData){
        throw new AppError(status.NOT_FOUND, 'Doctor not found')
    }

    await prisma.doctorSchedules.deleteMany({
        where: {
            isBooked: false,
            doctorId: doctorData.id,
            scheduleId: id
        }
    })
}


export const doctorScheduleServices = {
    createDoctorSchedules,
    getMyDoctorSchedule,
    getAllDoctorSchedules,
    getDoctorScheduleById,
    updateMyDoctorSchedule,
    deleteMyDoctorSchedule
}