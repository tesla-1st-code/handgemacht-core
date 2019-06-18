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
        role: data["role_name"] ? {id: data["role_id"], name: data["role_name"]} : null
    }

    return entity;
}

export const createUsers = (data: any[]) => {
    let entities: IUser[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push({
            id: data[i]["id"],
            name: data[i]["name"],
            email: data[i]["email"] ? data[i]["email"] : null,
            userName: data[i]["user_name"],
            roleId: data[i]["role_id"],
            role: data[i]["role_name"] ? {id: data[i]["role_id"], name: data[i]["role_name"]} : null
        });
    }

    return entities;
}