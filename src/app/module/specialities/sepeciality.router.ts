import { Router } from "express";
import { specialityController } from "./sepeciality.controller";

const router = Router()

router.post('/speciality', specialityController.createSpeciality)

export const specialityRouter = router