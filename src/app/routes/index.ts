import { Router } from "express";
import { specialityRouter } from "../module/specialities/sepeciality.router";
import { authRouter } from "../module/auth/auth.router";
import { userRoutes } from "../module/user/user.router";
import { doctorRoutes } from "../module/doctor/doctor.router";

const router = Router()

router.use('/auth', authRouter)

router.use('/speciality', specialityRouter)

router.use("/users", userRoutes)

router.use("/doctors", doctorRoutes)

export const indexRouter = router
