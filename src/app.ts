/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application } from "express";
import { indexRouter } from "./app/routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundHandler } from "./middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth from "./app/lib/auth";
import path from "path";
import cors from "cors"
import { envVars } from "./config/env";
import qs from "qs"
import corn from "node-cron"
import { AppointmentService } from "./app/module/appointmnet/appointment.service";
import { PaymentController } from "./app/module/payment/payment.controller";


const app: Application = express()
app.use((req, res, next) => {
    console.log("REQUEST RECEIVED:", req.method, req.originalUrl);
    next();
});

app.set("query parser", (str: string)=> qs.parse(str))

app.set("view engine", "ejs")
app.set("views", path.resolve(process.cwd(), "src/templetes"))

app.post(
    "/webhook", 
    express.raw({ type: "application/json" }), 
    PaymentController.handleStripeWebhookEvent,
)

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["get", "post", "put", "patch", "delete"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

corn.schedule("*/25 * * * *", async () => {
    try {
        console.log('running corn jobs to cancel unpaid appointments');
       await AppointmentService.canceleUnpaidAppointments()
    } catch (error: any) {
        console.log(error);
    }
})

app.use("/api/auth", toNodeHandler(auth))

app.use('/api/v1', indexRouter)


app.use(globalErrorHandler)
app.use(notFoundHandler)


export default app