export interface ICustomer {
    id: number;
    code: string;
    name: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    joinDate?: Date;
    birthDate?: Date;
    gender?: string;
}

export const createCustomer = (data: any) => {
    const entity: ICustomer = {
        id: data["id"],
        code: data["code"],
        name: data["name"],
        email: data["email"] ? data["email"] : null,
        address: data["address"] ? data["address"] : null,
        phoneNumber: data["phone_number"],
        joinDate: data["join_date"],
        birthDate: data["birth_date"],
        gender: data["gender"]
    }

    return entity;
}

export const createCustomers = (data: any[]) => {
    let entities: ICustomer[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createCustomer(data[i]));
    }

    return entities;
}