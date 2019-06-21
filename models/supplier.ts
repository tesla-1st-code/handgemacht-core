export interface ISupplier {
    id: number;
    code: string;
    name: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    joinDate?: Date;
    userCreated?: string;
    createdDate?: Date;
    userUpdated?: string;
    updatedDate?: Date;
}

export const createSupplier = (data: any) => {
    const entity: ISupplier = {
        id: data["id"],
        code: data["code"],
        name: data["name"],
        email: data["email"],
        address: data["address"],
        phoneNumber: data["phone_number"],
        joinDate: data["join_date"],
        userCreated: data["user_created"] ? data["user_created"] : null,
        createdDate: data["created_date"] ? data["created_date"] : null,
        userUpdated: data["user_updated"] ? data["user_updated"] : null,
        updatedDate: data["updated_date"] ? data["updated_date"] : null
    }

    return entity;
}

export const createSuppliers = (data: any[]) => {
    let entities: ISupplier[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createSupplier(data[i]));
    }

    return entities;
}