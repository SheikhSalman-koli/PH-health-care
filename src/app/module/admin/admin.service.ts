import status from "http-status"
import AppError from "../../../errorHelper/AppError"
import { prisma } from "../../lib/prisma"
import { IUpdateAdminData } from "./admin.interface"
import { UserStatus } from "../../../generated/prisma/enums"


const getAllAdmin = async () => {
    const result = await prisma.admin.findMany({
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


const getAdminById = async (id: string) => {
    const result = await prisma.admin.findUnique({
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

const updateAdmin = async (id: string, payload: IUpdateAdminData) => {
    const isAdminExist = await prisma.admin.findUnique({
        where: { id, isDeleted: false }
    })

    if (!isAdminExist) {
        throw new AppError(status.NOT_FOUND, "Admin not found!")
    }

    const result = await prisma.admin.update({
        where: {
            id,
            isDeleted: false
        },
        data: payload
    })

    return result
}

// soft delete
const deleteAdmin = async (id: string) => {

    const isAdminExist = await prisma.admin.findUnique({
        where: { id, isDeleted: false }
    })

    if (!isAdminExist) {
        throw new AppError(status.NOT_FOUND, "Admin not found!")
    }

    await prisma.$transaction(async (tx) => {

        await tx.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        })

        await tx.user.update({
            where: {
                id: isAdminExist.userId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED
            }
        })

        await tx.session.deleteMany({
            where: {
                userId: isAdminExist.userId
            }
        })

    })

    return {message: "Admin Deleted Successfully!"}
}

export const adminServices = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin
}