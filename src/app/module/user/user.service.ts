import status from "http-status";
import AppError from "../../../errorHelper/AppError";
import { Speciality, UserRole } from "../../../generated/prisma/client";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, ICreateDoctorPayload, ICreateSuperAdminPayload } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {

    const specialities: Speciality[] = []

    for (const specialityId of payload.specialities) {
        // check the speciality is exist in DB or not 
        const speciality = await prisma.speciality.findUnique({
            where: {
                id: specialityId
            }
        })
        if (!speciality) {
            // throw new Error(`speciality with id ${specialityId} not found!`)
            throw new AppError(status.NOT_FOUND, `speciality with id ${specialityId} not found!`)
        }
        specialities.push(speciality)
    }

    const isUserExist = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }
    })

    if (isUserExist) {
        // throw new Error('User Already Exist With This Email!')
        throw new AppError(status.CONFLICT, 'User Already Exist With This Email!')
    }

    const userCreate = await auth.api.signUpEmail({
        body: {
            password: payload.password,
            email: payload.doctor.email,
            role: UserRole.DOCTOR,
            name: payload.doctor.name,
            needPasswordChange: true
        }
    })

    try {
        const result = await prisma.$transaction(async (tx) => {

            const doctorData = await tx.doctor.create({
                data: {
                    userId: userCreate?.user.id,
                    ...payload.doctor
                }
            })

            const doctorSpecialityData = specialities.map((speciality) => {
                return {
                    doctorId: doctorData?.id,
                    specialityId: speciality?.id
                }
            })

            await tx.doctorSpeciality.createMany({
                data: doctorSpecialityData
            })

            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData?.id
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            emailVerified: true,
                            image: true
                        }
                    },
                    specialities: {
                        select: {
                            speciality: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                },

            })

            return doctor

        })

        return result
    } catch (error) {
        console.log(error)
        await prisma.user.delete({
            where: {
                id: userCreate.user.id
            }
        })
        throw error
    }
}

// ==================================
const createSuperAdmin = async (payload: ICreateSuperAdminPayload) => {

    const isExistEmail = await prisma.user.findUnique({
        where: {
            email: payload.superAdmin.email
        }
    })

    if (isExistEmail) {
        throw new AppError(status.CONFLICT, "'User Already Exist With This Email!'")
    }

    const CreateSuperAdmin = await auth.api.signUpEmail({
        body: {
            password: payload.password,
            email: payload.superAdmin.email,
            role: UserRole.SUPERADMIN,
            name: payload.superAdmin.name,
            needPasswordChange: true
        }
    })


    try {
        const result = await prisma.$transaction(async (tx) => {
            const SuparAdminData = await tx.superAdmin.create({
                data: {
                    userId: CreateSuperAdmin?.user.id,
                    ...payload.superAdmin
                }
            })

            const superAdmin = await tx.superAdmin.findUnique({
                where: {
                    id: SuparAdminData?.id
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            emailVerified: true,
                            image: true
                        }
                    }
                }
            })

            return superAdmin
        })

        return result
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: CreateSuperAdmin?.user.id
            }
        })

        throw error
    }
}


const createAdmin = async (payload: ICreateAdminPayload) => {

    const isExistEmail = await prisma.user.findUnique({
        where: {
            email: payload.admin.email
        }
    })

    if (isExistEmail) {
        throw new AppError(status.CONFLICT, "'User Already Exist With This Email!'")
    }

    const CreateAdmin = await auth.api.signUpEmail({
        body: {
            password: payload.password,
            email: payload.admin.email,
            role: UserRole.ADMIN,
            name: payload.admin.name,
            needPasswordChange: true
        }
    })


    try {
        const result = await prisma.$transaction(async (tx) => {
            const adminData = await tx.admin.create({
                data: {
                    userId: CreateAdmin?.user.id,
                    ...payload.admin
                }
            })

            const admin = await tx.admin.findUnique({
                where: {
                    id: adminData?.id
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            emailVerified: true,
                            image: true
                        }
                    }
                }
            })

            return admin
        })

        return result
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: CreateAdmin?.user.id
            }
        })

        throw error
    }
}




export const userServices = {
    createDoctor,
    createSuperAdmin,
    createAdmin
}