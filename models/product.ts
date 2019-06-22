import { ISupplier } from "./supplier";

export interface IProduct { 
    id: number;
    code: string;
    name: string;
    description?: string;
    supplierId?: number;
    supplier?: ISupplier;
    price?: number;
    picture1Path?: string;
    picture2Path?: string;
    picture3Path?: string;
    picture4Path?: string;
    userCreated?: string;
    createdDate?: Date;
    userUpdated?: string;
    updatedDate?: Date;   
}

export const createProduct = (data: any) => {
    const entity: IProduct = {
        id: data["id"],
        code: data["code"],
        name: data["name"],
        description: data["description"],
        price: data["price"] ? parseFloat(data["price"]) : 0.0,
        supplierId: data["supplier_id"],
        supplier: {
            id: data["supplier_id"],
            code: data["supplier_code"],
            name: data["supplier_name"]
        },
        picture1Path: data["picture_1_path"],
        picture2Path: data["picture_2_path"],
        picture3Path: data["picture_3_path"],
        picture4Path: data["picture_4_path"],
        userCreated: data["user_created"],
        createdDate: data["created_date"],
        userUpdated: data["user_updated"],
        updatedDate: data["updated_date"]
    }

    return entity;
}

export const createProducts = (data: any[]) => {
    let entities: IProduct[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createProduct(data[i]));
    }

    return entities;
}