import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";


const router = Router();

router.post(
    "/book-appointments", 
    checkAuth(UserRole.PATIENT), 
    AppointmentController.bookAppointment
);
router.get(
    "/my-appointments", 
    checkAuth(UserRole.PATIENT, UserRole.DOCTOR), 
    AppointmentController.getMyAppointments
);
router.patch(
    "/change-appointment-status/:id", 
    checkAuth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPERADMIN),
    AppointmentController.changeAppointmentStatus
);
router.get(
    "/my-single-appointment/:id", 
    checkAuth(UserRole.PATIENT, UserRole.DOCTOR), 
    AppointmentController.getMySingleAppointment
);
router.get(
    "/all-appointments", 
    checkAuth(UserRole.ADMIN, UserRole.SUPERADMIN), 
    AppointmentController.getAllAppointments
);
router.post(
    "/book-appointment-with-pay-later", 
    checkAuth(UserRole.PATIENT), 
    AppointmentController.bookAppointmentWithPayLater
);
router.post(
    "/initiate-payment/:id", 
    checkAuth(UserRole.PATIENT), 
    AppointmentController.initiatePayment
);

export const AppointmentRoutes = router;