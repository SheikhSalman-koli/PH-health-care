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
// import AppError from "./errorHelper/AppError";
// import status from "http-status";


const app: Application = express()

app.set("view engine", "ejs")
app.set("views", path.resolve(process.cwd(), "src/templetes"))

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["get", "post", "put", "patch", "delete"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth))

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser())

app.use('/api/v1', indexRouter)

// root route
// app.get('/', (req:Request, res: Response) => {
//     throw new AppError(status.BAD_REQUEST, "just for testing")
// })

app.use(globalErrorHandler)
app.use(notFoundHandler)


export default app