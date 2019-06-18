import { IUser } from "./user";
import { IRole } from "./role";
import { IOrganization } from "./organization";

export interface IAuth {
    token: string;
    user: IUser;
    role: IRole;
    organization: IOrganization;
    accesses: any[];
    loginDate: Date;
}

export const createAuth = (data: any) => {
    const entity: IAuth = {
        token: data["token"],
        user: data["user"],
        role: data["role"],
        organization: data["organization"],
        accesses: data["accesses"],
        loginDate: data["loginDate"]
    }

    return entity;
}