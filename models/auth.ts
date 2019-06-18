import { IUser } from "./user";
import { IRole } from "./role";

export interface IAuth {
    id: number;
    token: string;
    user: IUser;
    role: IRole;
    organization: any;
    accesses: any[];
    loginDate: Date;
}

export const createAuth = (data: any) => {
    const entity: IAuth = {
        id: data["id"],
        token: data["token"],
        user: data["user"],
        role: data["role"],
        organization: data["organization"],
        accesses: data["accesses"],
        loginDate: data["loginDate"]
    }

    return entity;
}