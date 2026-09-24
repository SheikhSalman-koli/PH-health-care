import { UserRole } from "../../generated/prisma/enums";

export interface ICreateRequestUser {
    userId: string,
    email: string,
    role: UserRole
}