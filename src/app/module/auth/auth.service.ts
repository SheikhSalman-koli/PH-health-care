import status from "http-status"
import AppError from "../../../errorHelper/AppError"
import auth from "../../lib/auth"
import { prisma } from "../../lib/prisma"
import { UserStatus } from "../../../generated/prisma/enums"
import { tokenUtils } from "../../../utils/token"


interface CreatePatientData {
    name: string,
    email: string,
    password: string,
    
}

const createPatient =async(payload: CreatePatientData)=> {
    const {name, email, password} = payload

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        }
    })

    if(!data?.user){
        // throw new Error("faild to register patient!")
        throw new AppError(status.BAD_REQUEST, "faild to register patient!")
    }

    try {
        const patient = await prisma.$transaction(async (tx)=> {

        const patientTx = await tx.patient.create({
            data: {
                userId: data?.user.id,
                name: payload.name,
                email: payload.email,
            }
        })

        return patientTx
    })

      const accessToken = tokenUtils.getAccessToken({
        userId: data?.user.id,
        email: data?.user.email,
        role: data?.user.role,
        emailVerified: data?.user.emailVerified,
       isDeleted: data?.user.isDeleted,
        status: data?.user.status
    })
    const refreshToken = tokenUtils.getRefreshToken({
        userId: data?.user.id,
        email: data?.user.email,
        role: data?.user.role,
        emailVerified: data?.user.emailVerified,
       isDeleted: data?.user.isDeleted,
        status: data?.user.status
    })

    return {
        ...data,
        patient,
        accessToken,
        refreshToken
    }
    
    } catch (error) {
        console.log(error)
        await prisma.user.delete({
            where: {
                id: data?.user.id
            }
        })
        throw error
    }
}

interface LoginData {
    email: string,
    password: string
}

const loginUser =async(payload: LoginData)=>{
    const {email, password} = payload

    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if(data?.user.status === UserStatus.BLOCKED){
        throw new AppError(status.FORBIDDEN, "user is blocked")
    }

    if(data?.user.isDeleted || data?.user.status === UserStatus.DELETED){
        throw new AppError(status.NOT_FOUND, "user is deleted")
    }
    
    const accessToken = tokenUtils.getAccessToken({
        userId: data?.user.id,
        email: data?.user.email,
        role: data?.user.role,
        emailVerified: data?.user.emailVerified,
       isDeleted: data?.user.isDeleted,
        status: data?.user.status
    })
    const refreshToken = tokenUtils.getRefreshToken({
        userId: data?.user.id,
        email: data?.user.email,
        role: data?.user.role,
        emailVerified: data?.user.emailVerified,
       isDeleted: data?.user.isDeleted,
        status: data?.user.status
    })

    return {
        ...data,
        accessToken,
        refreshToken
    }
}


export const authServices = {
    createPatient,
    loginUser
}