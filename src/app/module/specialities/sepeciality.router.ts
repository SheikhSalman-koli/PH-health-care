import { Router } from "express";
import { specialityController } from "./sepeciality.controller";

const router = Router()

router.post('/', specialityController.createSpeciality)

router.get('/', specialityController.getallSpeciality)

router.patch('/:id', specialityController.updateSpeciality)

export const specialityRouter = router