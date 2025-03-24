import dotenv from "dotenv";

dotenv.config();

const EMAIL = process.env.EMAIL!;
const PASSWORD = process.env.PASSWORD!;

export const emailConfig = {
  service: "Gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
};
