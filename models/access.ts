import { IRole } from "./role";

export interface IAccess {
    id: number;
    roleId: number;
    role?: IRole;
    menu: string;
}

export const createAccess = (data: any) => {
    const entity: IAccess = {
        id: data["id"],
        roleId: data["role_id"],
        role: {
            id: data["role_id"],
            name: data["role_name"]
        },
        menu: data["menu"]
    }

    return entity;
}

export const createAccesses = (data: any[]) => {
    let entities: IAccess[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createAccess(data[i]));
    }

    return entities;
}