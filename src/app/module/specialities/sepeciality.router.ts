/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { specialityController } from "./sepeciality.controller";

import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { multerUpload } from "../../../config/multer.config";
import { requestValidation } from "../../../middleware/requestValidation";
import { specialityValidation } from "./speciality.validation";

const router = Router()

router.post(
    '/', 
    // checkAuth(UserRole.SUPERADMIN, UserRole.ADMIN), 
    multerUpload.single("file"),
    requestValidation(specialityValidation.CreateSpecialitySchema),
    specialityController.createSpeciality
)

router.get('/', specialityController.getallSpeciality)

router.patch('/:id', checkAuth(UserRole.SUPERADMIN, UserRole.ADMIN), specialityController.updateSpeciality)

export const specialityRouter = router