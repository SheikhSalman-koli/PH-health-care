import express, { Application } from "express";

import { specialityRouter } from "./app/module/specialities/sepeciality.router";

const app: Application = express()

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use('/api/v1', specialityRouter)


export default app