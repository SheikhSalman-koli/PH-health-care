import { Router } from "express";
import { doctorController } from "./doctor.controller";

const router = Router()

router.get('/', doctorController.getAllDoctor)

export const doctorRoutes = router