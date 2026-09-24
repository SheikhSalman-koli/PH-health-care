import status from "http-status"
import AppError from "../../../errorHelper/AppError"
import { prisma } from "../../lib/prisma"
import { IUpdateSuperAdminData } from "./super.interface"
import { UserStatus } from "../../../generated/prisma/enums"
import { ICreateRequestUser } from "../../interface/requestUser.interface"


const getAllSuparAdmin = async () => {
    const result = await prisma.superAdmin.findMany({
        where: {
            isDeleted: false
        },
        include: {
            user: {
                select: {
                    role: true,
                    emailVerified: true,
                    status: true
                }
            }
        }
    })

    return result
}


const getSuparAdminById = async (id: string) => {
    const result = await prisma.superAdmin.findUnique({
        where: {
            id,
            isDeleted: false
        },
        include: {
            user: {
                select: {
                    role: true,
                    emailVerified: true,
                    status: true
                }
            }
        }
    })

    return result
}

const updateSuperAdmin = async (id: string, payload: IUpdateSuperAdminData) => {

    const isSuperAdminExist = await prisma.superAdmin.findUnique({
        where: { id, isDeleted: false }
    })

    if (!isSuperAdminExist) {
        throw new AppError(status.NOT_FOUND, "Super-Admin not found!")
    }

    const result = await prisma.superAdmin.update({
        where: {
            id,
            isDeleted: false
        },
        data: payload
    })

    return result
}

// soft delete
const deleteSuperAdmin = async (id: string, user: ICreateRequestUser) => {

    const isSuperAdminExist = await prisma.superAdmin.findUnique({
        where: { id, isDeleted: false }
    })

    if (!isSuperAdminExist) {
        throw new AppError(status.NOT_FOUND, "Super-Admin not found!")
    }

    if(isSuperAdminExist?.id === user?.userId){
        throw new AppError(status.BAD_REQUEST, "you cannot delete yourself!")
    }

    await prisma.$transaction(async (tx) => {
        await tx.superAdmin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        })

        await tx.user.update({
            where: {
                id: isSuperAdminExist?.userId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.BLOCKED
            }
        })


        await tx.session.deleteMany({
            where: {
                userId: isSuperAdminExist?.userId
            }
        })

    })

    return { message: "Super Admin Deleted Succesfully!" }
}

export const superAdminServices = {
    getAllSuparAdmin,
    getSuparAdminById,
    updateSuperAdmin,
    deleteSuperAdmin
}