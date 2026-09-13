import auth from "../../lib/auth"
import { prisma } from "../../lib/prisma"


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
        throw new Error("faild to register patient!")
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

    return {
        ...data,
        patient
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

    return data
}


export const authServices = {
    createPatient,
    loginUser
}