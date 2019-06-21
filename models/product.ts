export interface IProduct { 
    id: number;
    code: string;
    name: string;
    description?: string;
    supplierId?: number;
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
        description: data["description"] ? data["description"] : null,
        price: data["price"] ? parseFloat(data["price"]) : 0.0,
        picture1Path: data["picture_1_path"] ? data["picture_1_path"] : null,
        picture2Path: data["picture_2_path"] ? data["picture_2_path"] : null,
        picture3Path: data["picture_3_path"] ? data["picture_3_path"] : null,
        picture4Path: data["picture_4_path"] ? data["picture_4_path"] : null,
        userCreated: data["user_created"] ? data["user_created"] : null,
        createdDate: data["created_date"] ? data["created_date"] : null,
        userUpdated: data["user_updated"] ? data["user_updated"] : null,
        updatedDate: data["updated_date"] ? data["updated_date"] : null
    }

    return entity;
}