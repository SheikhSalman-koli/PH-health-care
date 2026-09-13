import { Speciality } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpeciality = async (payload: Speciality): Promise<Speciality>  => {
    const result = await prisma.speciality.create({
        data: payload
    })

    return result
}


const getAllSpeciality = async () => {
    const result = await prisma.speciality.findMany()
    return result
}


const updateSpeciality = async (id: string, updatedData: Partial<Speciality>) => {
    const result = await prisma.speciality.update({
        where: {
            id
        },
        data: updatedData
    })

    return result
}



export const specialityService = {
    createSpeciality,
    getAllSpeciality,
    updateSpeciality
}