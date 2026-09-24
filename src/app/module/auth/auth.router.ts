import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router()

router.post(
    '/create-patients',
    authController.createPatient
)

router.post(
    '/login',
    authController.loginUser
)

router.get(
    '/me',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPERADMIN),
    authController.getMe
)

router.get(
    '/new-token',
    authController.getNewToken
)

router.post(
    '/change-password',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPERADMIN),
    authController.changePassword
)

router.post(
    '/logout',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPERADMIN),
    authController.logout
)

router.post(
    '/verify-email',
    authController.verifyEmail
)

router.post(
    '/forgot-password',
    authController.forgotPassword
)

router.post(
    '/reset-password',
    authController.resetPassword
)

// ===== Google Login =====
router.get(
    '/google-login',
    authController.gooleLogin
)
router.get(
    '/google-success',
    authController.gooleSuccess
)
router.get(
    '/google-oauth-error',
    authController.gooleOauthError
)


export const authRouter = router