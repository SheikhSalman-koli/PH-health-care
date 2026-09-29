import z from "zod"

const CreateSpecialitySchema = z.object({
      title : z.string("Title is required"),
    description : z.string("Description is required").optional(),
})

export const specialityValidation = {
    CreateSpecialitySchema
}