import { Router } from "express";
import { specialityRouter } from "../module/specialities/sepeciality.router";
import { authRouter } from "../module/auth/auth.router";
import { userRoutes } from "../module/user/user.router";
import { doctorRoutes } from "../module/doctor/doctor.router";
import { superAdminRouter } from "../module/superAdmin/super.router";
import { adminRouter } from "../module/admin/admin.router";
import { scheduleRoutes } from "../module/schedule/schedule.router";
import { DoctorScheduleRoutes } from "../module/dortorSchedule/doctorSchedule.router";
import { AppointmentRoutes } from "../module/appointmnet/appointment.route";

const router = Router()

router.use('/auth', authRouter)

router.use('/speciality', specialityRouter)

router.use("/users", userRoutes)

router.use("/doctors", doctorRoutes)

router.use("/super-admin", superAdminRouter)

router.use("/admin", adminRouter)

router.use("/schedules", scheduleRoutes)

router.use("/doctor-schedules", DoctorScheduleRoutes)

router.use("/appointments", AppointmentRoutes)


export const indexRouter = router
