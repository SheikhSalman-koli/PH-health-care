import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctor.interface"

const getAllDoctors = async () => {
    const result = await prisma.doctor.findMany({
        where: {
            isDeleted: false
        },
        include: {
            user: true,
            specialities: {
                include: {
                    speciality: true
                }
            }
        }
    })

    return result
}

const getDoctorById = async (id: string) => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false
        },
        include: {
            user: true,
            specialities: {
                include: {
                    speciality: true
                }
            }
        }
    })

    return result
}

const updateDoctor = async (id: string, payload: Partial<IUpdateDoctorPayload>) => {

    const result = await prisma.doctor.update({
        where: {
            id,
            isDeleted: false
        },
        data: payload
    })

    return result
}

const softDeleteDoctor = async (id: string) => {

    const result = await prisma.doctor.update({
        where: {
            id
        },
        data: {
            isDeleted: true
        }
    })

    return result
}


export const doctorServices = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    softDeleteDoctor
}