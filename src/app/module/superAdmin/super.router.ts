import { Router } from "express";
import { superAdminController } from "./super.controller";
import { requestValidation } from "../../../middleware/requestValidation";
import { superAdminValidation } from "./super.validation";
import { checkAuth } from "../../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router()

router.get('/', superAdminController.getAllSuperAdmin)

router.get('/:id', superAdminController.getSuperAdminById)

router.patch(
    '/update/:id', 
    checkAuth(UserRole.SUPERADMIN),
    requestValidation(superAdminValidation.updateSuperAdminZodSchema),
    superAdminController.updateSuperAdmin
)

router.patch(
    '/delete/:id', 
    checkAuth(UserRole.SUPERADMIN),
    superAdminController.deleteSuperAdmin
)


export const superAdminRouter = router