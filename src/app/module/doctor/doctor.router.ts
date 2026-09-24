import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { requestValidation } from "../../../middleware/requestValidation";
import { DoctorValidation } from "./doctor.validation";

const router = Router()

router.get('/', doctorController.getAllDoctor)

router.get('/:id', doctorController.getDoctorById)

router.patch(
    '/update-doctor/:id', 
    checkAuth(UserRole.SUPERADMIN),
    requestValidation(DoctorValidation.updateDoctorZodSchema),
    doctorController.updateDoctor
)

router.patch('/delete-doctor/:id', doctorController.softDeleteDoctor)

export const doctorRoutes = router
