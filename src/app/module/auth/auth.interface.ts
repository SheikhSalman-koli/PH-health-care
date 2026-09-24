export interface CreatePatientData {
    name: string,
    email: string,
    password: string,

}

export interface LoginData {
    email: string,
    password: string
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string
}