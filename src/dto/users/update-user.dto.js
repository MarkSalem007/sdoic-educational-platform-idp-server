import { userStatus } from "@prisma/client";
import { updateUserSchema } from "../../validators/index.js";

export const mapUpdateUserRequest = (body) => {
    return updateUserSchema.parse(body);
};