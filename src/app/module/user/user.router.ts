import { Router } from "express";
import { userController } from "./user.controller";
import { requestValidation } from "../../../middleware/requestValidation";
import { checkAuth } from "../../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { userValidation } from "./user.validation";

const router = Router()

router.post(
    '/create-doctor', 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN) , 
    requestValidation(userValidation.createDoctorZodSchema), 
    userController.createDoctor
)

router.post(
    '/create-super-admin', 
    checkAuth(UserRole.SUPERADMIN),
    requestValidation(userValidation.createSuperAdminZodSchema), 
    userController.createSuperAdmin
)

router.post(
    '/create-admin', 
    checkAuth(UserRole.SUPERADMIN),
    requestValidation(userValidation.createAdminZodSchema), 
    userController.createAdmin
)

export const userRoutes = router