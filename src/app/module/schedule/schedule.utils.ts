export const ConvertDateTime = async (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date( date.getTime() + offset )
}