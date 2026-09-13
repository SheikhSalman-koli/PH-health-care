import { Speciality, UserRole } from "../../../generated/prisma/client";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {

    const specialities: Speciality[] = []

    for (const specialityId of payload.specialities) {
        const speciality = await prisma.speciality.findUnique({
            where: {
                id: specialityId
            }
        })
        if (!speciality) {
            throw new Error(`speciality with id ${specialityId} not found!`)
        }
        specialities.push(speciality)
    }

    const isUserExist = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }
    })

    if (isUserExist) {
        throw new Error('User Already Exist With This Email!')
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
                    specialities:{
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
    }

}


export const userServices = {
    createDoctor
}