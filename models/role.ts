export interface IRole {
    id: number;
    name: string;
}

export const createRole = (data: any) => {
    const entity: IRole = {
        id: data["id"],
        name: data["name"]
    }

    return entity;
}

export const createRoles = (data: any[]) => {
    let entities: IRole[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createRole(data[i]));
    }

    return entities;
}