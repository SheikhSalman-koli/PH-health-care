import { Gender } from "../../../generated/prisma/enums";


interface IUpdateDoctorSpecialityPayload {
    specialityId: string;
    shouldDelete?: boolean
}

export interface IUpdateDoctorPayload {
    doctor?: {
        name: string;
        profilePhoto: string;
        contactNumber: string;
        address: string;
        registrationNumber: string;
        experience: number;
        gender: Gender
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string
    }

    specialities?: IUpdateDoctorSpecialityPayload[]
}