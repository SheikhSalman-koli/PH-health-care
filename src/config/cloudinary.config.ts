import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelper/AppError";
import status from "http-status";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUD_API,
    api_secret: envVars.CLOUDINARY.CLOUD_SECRET
})

export const uploadFileToCloudinary = (
    buffer: Buffer,
    fileName: string
): Promise<UploadApiResponse> => {

    if (!buffer || !fileName) {
        throw new AppError(status.BAD_REQUEST, "File buffer and file name are required for upload");
    }

    const extension = fileName.split('.').pop()?.toLocaleLowerCase()

    const fileNameWithoutExtension = fileName
        .split(".")
        .slice(0, -1)
        .join('.')
        .toLocaleLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "")

    const uniqueName =
        Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileNameWithoutExtension

    const folder = extension === "pdf" ? "pdfs" : "images"

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                public_id: `PH-Health-Care/${folder}/${uniqueName}`,
                folder: `PH-Health-Care/${folder}`
            },
            (error, result) => {
                if (error) {
                    return reject(new AppError(status.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary"))
                }

                resolve(result as UploadApiResponse)
            }
        ).end(buffer)
    })
}

export const deleteImageFromCloudinary = async (url: string) => {

    try {

        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;

        const match = url.match(regex)

        if (match && match[1]) {
            const getPublicId = match[1]

            await cloudinary.uploader.destroy(
                getPublicId, {
                resource_type: "image"
            }
            )
            console.log(`File ${getPublicId} deleted from cloudinary`);

        }
    } catch (error) {
        console.log(error);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed To Delete Image!")
    }

}

export const cloudinaryUpload = cloudinary