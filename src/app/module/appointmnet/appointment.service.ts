import { v7 as uuidv7 } from "uuid"
import { ICreateRequestUser } from "../../interface/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { ICreateAppointmentPayload } from "./appointment.interface"
import AppError from "../../../errorHelper/AppError"
import status from "http-status"
import { AppointmentStatus, PaymentStatus, UserRole } from "../../../generated/prisma/enums"
import { stripe } from "../../../config/stripe.config"
import { envVars } from "../../../config/env"

const bookAppointment = async (payload: ICreateAppointmentPayload, user: ICreateRequestUser) => {

    const patientData = await prisma.patient.findUnique({
        where: {
            email: user.email
        }
    })

    if (!patientData) {
        return new AppError(status.NOT_FOUND, "Patient not Found!")
    }

    const doctorData = await prisma.doctor.findUnique({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    })

    if (!doctorData) {
        return new AppError(status.NOT_FOUND, "Doctor not Found!")
    }

    const scheduleData = await prisma.schedule.findFirstOrThrow({
        where: {
            id: payload.scheduleId
        }
    })

    // const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    //     where: {
    //         doctorId_scheduleId: {
    //             doctorId: doctorData?.id,
    //             scheduleId: scheduleData.id
    //         }
    //     }
    // })

    const videoCallingId = String(uuidv7())

    const result = await prisma.$transaction(async (tx) => {
        const createAppointment = await tx.appointment.create({
            data: {
                doctorId: doctorData?.id,
                patientId: patientData?.id,
                scheduleId: scheduleData?.id,
                videoCallingId
            }
        })

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData?.id,
                    scheduleId: scheduleData.id
                }
            },
            data: {
                isBooked: true
            }
        })

        // payment intregation will be here!
        const transactionId = String(uuidv7())

        const createPayment = await tx.payment.create({
            data: {
                appointmentId: createAppointment.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        // for debug
        // console.log(
        //     "Stripe environment:",
        //     process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
        //         ? "TEST MODE"
        //         : "LIVE MODE"
        // );
        // const account = await stripe.accounts.retrieve(null);
        // console.log("Backend Stripe Account ID:", account.id);
        const session = await stripe.checkout.sessions.create({
            // payment_method_data: ['card']
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: `Appointment With DR. ${doctorData.name}`
                        },
                        unit_amount: doctorData.appointmentFee * 100
                    },
                    quantity: 1
                }
            ],
            metadata: {
                appointmentId: createAppointment.id,
                paymentId: createPayment.id
            },

            success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_Id=${createAppointment.id}&payment_Id=${createPayment.id}`,

            // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
            cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
        })

        //         console.log("Created Checkout Session:", session.id);
        // console.log("Session mode:", session.livemode);
        // console.log("Session metadata:", session.metadata);

        return {
            appointment: createAppointment,
            payment: createPayment,
            checkoutSessionUrl: session.url
        }
    })

    return {
        appointment: result.appointment,
        payment: result.payment,
        checkoutSessionUrl: result.checkoutSessionUrl
    }
}

const getMyAppointments = async (user: ICreateRequestUser) => {
    //user can be patient or doctor, so we need to check both
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    if (patientData) {
        return prisma.appointment.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        })
    } else if (doctorData) {
        return prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        })
    } else {
        return new AppError(status.NOT_FOUND, "User Not Found!")
    }

}

const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: ICreateRequestUser) => {
    const appointmentData = await prisma.appointment.findUnique({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    })

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData?.doctor.email))
            throw new AppError(status.BAD_REQUEST, "This is not your appointment")

    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status: appointmentStatus
        }
    })


}

const getMySingleAppointment = async (appointmentId: string, user: ICreateRequestUser) => {
    //user can be patient or doctor, so we need to check both
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    if (patientData) {
        return prisma.appointment.findMany({
            where: {
                id: appointmentId,
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        })
    } else if (doctorData) {
        return prisma.appointment.findMany({
            where: {
                id: appointmentId,
                doctorId: doctorData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        })
    } else {
        return new AppError(status.NOT_FOUND, "User Not Found!")
    }

}

const getAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            doctor: true,
            patient: true,
            schedule: true
        }
    });
    return appointments;
}

const bookAppointmentWithPayLater = async (payload: ICreateAppointmentPayload, user: ICreateRequestUser) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user.email
        }
    })

    if (!patientData) {
        return new AppError(status.NOT_FOUND, "Patient not Found!")
    }

    const doctorData = await prisma.doctor.findUnique({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    })

    if (!doctorData) {
        return new AppError(status.NOT_FOUND, "Doctor not Found!")
    }

    const scheduleData = await prisma.schedule.findFirstOrThrow({
        where: {
            id: payload.scheduleId
        }
    })

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData?.id,
                scheduleId: scheduleData.id
            }
        }
    })

    const videoCallingId = String(uuidv7())

    const result = await prisma.$transaction(async (tx) => {
        const createAppointment = await tx.appointment.create({
            data: {
                doctorId: doctorData?.id,
                patientId: patientData?.id,
                scheduleId: doctorSchedule?.id,
                videoCallingId
            }
        })

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData?.id,
                    scheduleId: scheduleData.id
                }
            },
            data: {
                isBooked: true
            }
        })

        const transactionId = String(uuidv7())

        const createPayment = await prisma.payment.create({
            data: {
                appointmentId: createAppointment.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })


        return {
            appointment: createAppointment,
            payment: createPayment
        }
    })

    return result
}

const initialPayment = async (appointmentId: string, user: ICreateRequestUser) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const appointmentData = await prisma.appointment.findUnique({
        where: {
            id: appointmentId,
            patientId: patient.id
        },
        include: {
            doctor: true,
            payment: true
        }
    })

    if (!appointmentData) {
        return new AppError(status.NOT_FOUND, "Appointment not found")
    }
    if (appointmentData.paymentStatus === PaymentStatus.PAID) {
        return new AppError(status.BAD_REQUEST, "Appointment already paid")
    }
    if (appointmentData.status !== AppointmentStatus.CANCELED) {
        return new AppError(status.BAD_REQUEST, "Appointment is not in pending status")
    }

    const session = await stripe.checkout.sessions.create({
        // payment_method_data: ['card']
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'bdt',
                    product_data: {
                        name: `Appointment With DR. ${appointmentData.doctor.name}`
                    },
                    unit_amount: appointmentData.doctor.appointmentFee * 100
                },
                quantity: 1
            }
        ],
        metadata: {
            appointmentId: appointmentId,
            paymentId: appointmentData.payment?.id ?? null
        },

        success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,

        // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
        cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
    })

    return {
        checkoutSessionUrl: session.url
    }

}

const canceleUnpaidAppointments = async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinutesAgo
            },
            paymentStatus: PaymentStatus.UNPAID,
        }
    })

    const appointmentTocancel = unpaidAppointments.map(appointment => appointment.id)

    await prisma.$transaction(async (tx) => {

        await tx.appointment.updateMany({
            where: {
                id: {
                    in: appointmentTocancel
                }
            },
            data: {
                status: AppointmentStatus.CANCELED
            }
        })

        await prisma.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentTocancel
                }
            }
        })

        for (const unpaidAppointment of unpaidAppointments) {
            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false
                }
            })
        }

    })

}



export const AppointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initialPayment,
    canceleUnpaidAppointments
}