import { Router } from "express";
import { doctorController } from "./doctor.controller";

const router = Router()

router.get('/', doctorController.getAllDoctor)

router.get('/:id', doctorController.getDoctorById)

router.patch('/update-doctor/:id', doctorController.updateDoctor)

router.patch('/delete-doctor/:id', doctorController.softDeleteDoctor)

export const doctorRoutes = router

// TASK