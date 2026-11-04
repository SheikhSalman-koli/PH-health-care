import auth from "../app/lib/auth";
import { prisma } from "../app/lib/prisma"
import { envVars } from "../config/env";
import { UserRole } from "../generated/prisma/enums"

export const seedSuperAdmin = async () => {

    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                email: envVars.SUPAR_ADMIN_EMAIL,
                role: UserRole.SUPERADMIN
            }
        })

        if (isSuperAdminExist) {
            console.log("Super admin already exists. Skipping seeding super admin.");
            return;
        }

        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: envVars.SUPAR_ADMIN_EMAIL,
                password: envVars.SUPAR_ADMIN_PASSWORD,
                name: "Super_Admin",
                role: UserRole.SUPERADMIN,
                needPasswordChange: true,
                rememberMe: false
            }
        })

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: superAdminUser.user.id
                },
                data: {
                    emailVerified: true
                }
            })

            await tx.superAdmin.create({
                data: {
                    userId: superAdminUser.user.id,
                    name: "Super_Admin",
                    email: envVars.SUPAR_ADMIN_EMAIL,
                }
            })
        })

        const getSuperAdmin = await prisma.superAdmin.findFirst({
            where: {
                email: envVars.SUPAR_ADMIN_EMAIL
            },
            include: {
                user: true
            }
        })

        console.log('super-admin created successfully!', getSuperAdmin);
    } catch (error) {
        console.log('an error occourd during super admin creation', error);
        await prisma.user.delete({
            where: {
                email: envVars.SUPAR_ADMIN_EMAIL
            }
        })
    }

}