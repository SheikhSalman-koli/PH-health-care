import { Request, Response } from "express";
import { specialityService } from "./speciality.service";

const createSpeciality =async(req: Request, res: Response)=> {
    try {
        const result = await specialityService.createSpeciality(req.body)

        res.status(201).json({
            success: true,
            message: "speciality created successfully!",
            data: result
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.send({
             success: false,
            message: `failed to create speciality! for ${message}`,
        })
    }
}

export const specialityController = {
    createSpeciality
}