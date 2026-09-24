import z from "zod";

const updateSuperAdminZodSchema = z.object({
    name: z.string("name is required, and must be string"),
    profilePhoto: z.url("you have to provide image url"),
    contactNumber: z.string().min(11, "contact number must have 11 characters").max(14, "contact number can not be more then 14 characters")
}).partial()

export const superAdminValidation = {
    updateSuperAdminZodSchema
}

