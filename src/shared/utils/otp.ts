import bcrypt from "bcrypt";
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
}
export const hashOtp = async (otp: number) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp.toString(), salt);
}
export const verifyOtp = async (otp: number, hashedOtp: string) => {
    return await bcrypt.compare(otp.toString(), hashedOtp);
}