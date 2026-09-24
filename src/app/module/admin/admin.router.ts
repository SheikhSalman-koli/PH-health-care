import { Router } from "express";
import { requestValidation } from "../../../middleware/requestValidation";
import { checkAuth } from "../../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";


const router = Router()

router.get('/', adminController.getAllAdmin)

router.get('/:id', adminController.getAdminById)

router.patch(
    '/update/:id', 
    checkAuth(UserRole.SUPERADMIN),
    requestValidation(adminValidation.updateAdminZodSchema),
    adminController.updateAdmin
)

router.patch(
    '/delete/:id', 
    checkAuth(UserRole.SUPERADMIN),
   adminController.deleteAdmin
)


export const adminRouter = router