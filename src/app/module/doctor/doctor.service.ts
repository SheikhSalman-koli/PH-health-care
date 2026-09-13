import { prisma } from "../../lib/prisma"

const getAllDoctors = async ()=> {
    const result = await prisma.doctor.findMany({
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

export const doctorServices = {
    getAllDoctors
}