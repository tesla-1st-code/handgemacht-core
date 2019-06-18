import { IUser } from "./user";
import { IRole } from "./role";
import { IOrganization } from "./organization";

export interface IUserAuth {
    token: string;
    user: IUser;
    role: IRole;
    organization: IOrganization;
    accesses: any[];
    loginDate: Date;
}

export const createUserAuth = (data: any) => {
    const entity: IUserAuth = {
        token: data["token"],
        user: data["user"],
        role: data["role"],
        organization: data["organization"],
        accesses: data["accesses"],
        loginDate: data["loginDate"]
    }

    return entity;
}