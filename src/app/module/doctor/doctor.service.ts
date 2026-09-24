/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status"
import AppError from "../../../errorHelper/AppError"
import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctor.interface"
import { UserStatus } from "../../../generated/prisma/enums"

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
            },

        }
    })

    return result
}

const updateDoctor = async (id: string, payload: Partial<IUpdateDoctorPayload>) => {

    const isDoctorExist = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    if (!isDoctorExist) {
        throw new AppError(status.NOT_FOUND, "Docotr not found!")
    }
    const { doctor: doctorData, specialities } = payload;

    const updatedDoctor = await prisma.$transaction(async (tx) => {
        if (doctorData && Object.keys(doctorData).length > 0) {
            await tx.doctor.update({
                where: {
                    id,
                    isDeleted: false,
                },
                data: doctorData,
            });
        }


        if (specialities && specialities.length > 0) {

            for (const speciality of specialities) {
                if (speciality.shouldDelete) {
                    await tx.doctorSpeciality.deleteMany({
                        where: {
                            doctorId: id,
                            specialityId: speciality.specialityId,
                        },
                    });
                } else {
                    await tx.doctorSpeciality.upsert({
                        where: {
                            doctorId_specialityId: {
                                doctorId: id,
                                specialityId: speciality.specialityId,
                            },
                        },
                        create: {
                            doctorId: id,
                            specialityId: speciality.specialityId,
                        },
                        update: {},
                    });
                }
            }
        }


        return await tx.doctor.findUnique({
            where: { id },
            include: {
                specialities: {
                    include: {
                        speciality: true,
                    },
                },
            },
        });

    });

    return updatedDoctor;

}

const softDeleteDoctor = async (id: string) => {

    const isExistDoctor = await prisma.doctor.findUnique({
        where: { id, isDeleted: false }
    })

    if (!isExistDoctor) {
        throw new AppError(status.NOT_FOUND, "Doctor not found")
    }

    await prisma.$transaction(async (tx) => {

         await tx.doctor.update({
            where: {
                id
            },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        })

        await tx.user.update({
            where: {
                id: isExistDoctor?.userId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.BLOCKED
            }
        })

        await tx.doctorSpeciality.deleteMany({
            where: {
                doctorId: id
            }
        })

        await tx.session.deleteMany({
            where: {
                userId: isExistDoctor?.userId
            }
        })

    })

    return { mesaage: "Doctor deleted successfully!" }
}


export const doctorServices = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    softDeleteDoctor
}