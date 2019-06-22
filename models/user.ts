import { IRole } from "./role";

export interface IUser {
    id: number;
    name: string;
    email?: string;
    userName: string;
    roleId: number;
    role?: IRole
}

export const createUser = (data: any) => {
    const entity: IUser = {
        id: data["id"],
        name: data["name"],
        email: data["email"] ? data["email"] : null,
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