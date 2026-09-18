import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

const createDoctorZodSchema = z.object({
    password: z.string().min(6, "too short password, minimum 6 characters required"),

    doctor: z.object({
        name: z.string("name is required, and must be string"),
        email: z.email("invalid email address!"),
        profilePhoto: z.url("profilePhoto must be an url").optional(),
        contactNumber: z.string("contact number required").min(11, "must have 11 characters").max(14, "a bangladeshi number can not be more then 14").optional(),
        address: z.string("address is required").optional(),
        registrationNumber: z.string("registration number is required"),
        experience: z.number("experience must be a number").nonnegative("experience can not be negative").optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE], "Gender must be either MALE or FEMALE"),
        appointmentFee: z.number("appointmentFee is required").nonnegative("appointmentFee can not be negative"),
        qualification: z.string("qualification is required"),
        currentWorkingPlace: z.string("currentWorkingPlace is required"),
        designation: z.string("designation is required")
    }),

    specialities: z.array( z.uuid()).min(1, "A doctor must have one speciality")
})


const createSuperAdminZodSchema = z.object({
    password: z.string('required').min(6, "password must have 6 characters"),

    superAdmin: z.object({
        name: z.string("name is required, and must be string"),
        email: z.email("invalid email address!"),
        profilePhoto: z.url("you have to provide image url").optional(),
        contactNumber: z.string().min(11, "contact number must have 11 characters").max(14, "contact number can not be more then 14 characters").optional()
    })
})

const createAdminZodSchema = z.object({
    password: z.string('required').min(6, "password must have 6 characters"),

    admin: z.object({
        name: z.string("name is required, and must be string"),
        email: z.email("invalid email address!"),
        profilePhoto: z.url("you have to provide image url").optional(),
        contactNumber: z.string().min(11, "contact number must have 11 characters").max(14, "contact number can not be more then 14 characters").optional()
    })
})

export const userValidation = { 
    createDoctorZodSchema,
    createSuperAdminZodSchema,
    createAdminZodSchema
}
