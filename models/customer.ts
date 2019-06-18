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
        phoneNumber: data["phone_number"] ? data["phone_number"] : null,
        joinDate: data["join_date"] ? data["join_date"] : null,
        birthDate: data["birth_date"] ? data["birth_date"] : null,
        gender: data["gender"] ? data["gender"] : null
    }

    return entity;
}

export const createCustomers = (data: any[]) => {
    let entities: ICustomer[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push({
            id: data[i]["id"],
            code: data[i]["code"],
            name: data[i]["name"],
            email: data[i]["email"] ? data[i]["email"] : null,
            address: data[i]["address"] ? data[i]["address"] : null,
            phoneNumber: data[i]["phone_number"] ? data[i]["phone_number"] : null,
            joinDate: data[i]["join_date"] ? data[i]["join_date"] : null,
            birthDate: data[i]["birth_date"] ? data[i]["birth_date"] : null,
            gender: data[i]["gender"] ? data[i]["gender"] : null
        });
    }

    return entities;
}