import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { UserRole } from "../../../generated/prisma/enums";
import { requestValidation } from "../../../middleware/requestValidation";
import { checkAuth } from "../../../middleware/checkAuth";
import { ScheduleValidation } from "./schedule.validation";

const router = Router();

router.post(
    '/', 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN), 
    requestValidation(ScheduleValidation.createScheduleZodSchema) , 
    ScheduleController.createSchedule
);
router.get(
    '/', 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.DOCTOR),
    ScheduleController.getAllSchedules
);
router.get(
    '/:id', 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.DOCTOR), 
    ScheduleController.getScheduleById
);
router.patch(
    '/:id', 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN),
    requestValidation(ScheduleValidation.updateScheduleZodSchema), 
    ScheduleController.updateSchedule
);
router.delete(
    '/:id', 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN), 
    ScheduleController.deleteSchedule
);

export const scheduleRoutes = router;