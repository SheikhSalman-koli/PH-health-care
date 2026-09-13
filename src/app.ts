import express, { Application } from "express";
import { indexRouter } from "./app/routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundHandler } from "./middleware/notFound";


const app: Application = express()

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use('/api/v1', indexRouter)

app.use(globalErrorHandler)
app.use(notFoundHandler)


export default app