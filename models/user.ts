import { IRole } from "./role";

export interface IUser {
    id: number;
    code: string;
    name: string;
    email?: string;
    userName: string;
    roleId: number;
    role?: IRole
}

export const createUser = (data: any) => {
    const entity: IUser = {
        id: data["id"],
        code: data["code"],
        name: data["name"],
        email: data["email"],
        userName: data["user_name"],
        roleId: data["role_id"],
        role: {
            id: data["role_id"], 
            name: data["role_name"]
        }
    }

    return entity;
}

export const createUsers = (data: any[]) => {
    let entities: IUser[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createUser(data[i]));
    }

    return entities;
}