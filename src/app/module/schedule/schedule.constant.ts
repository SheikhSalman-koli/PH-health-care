import { Prisma } from "../../../generated/prisma/client"

export const scheduleSearchableFields = [
    'id',
    'startDateTime',
    'endDateTime'
]

export const schedulefilterableFields = [
    'id',
    'startDateTime',
    'endDateTime'
]

export const scheduleIncludeConfig: Partial<Record<keyof Prisma.ScheduleInclude, Prisma.ScheduleInclude[keyof Prisma.ScheduleInclude]>> = {
   doctorSchedules: true
}