
import { ICreateRequestUser } from "./requestUser.interface"

declare global {
    namespace Express {
        interface Request {
            user?: ICreateRequestUser
        }
    }
}