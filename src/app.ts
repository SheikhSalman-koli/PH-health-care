import express, { Application } from "express";
import { indexRouter } from "./app/routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundHandler } from "./middleware/notFound";
import cookieParser from "cookie-parser";
// import AppError from "./errorHelper/AppError";
// import status from "http-status";


const app: Application = express()

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