import { IProduct } from "./product";

export interface IStock {
    id: number;
    productId: number;
    product?: IProduct;
    qty: number;
    userCreated?: string;
    createdDate?: Date;
    userUpdated?: string;
    updatedDate?: Date;
}

export const createStock = (data: any) => {
    const entity: IStock = {
        id: data["id"],
        productId: data["product_id"],
        product: {
            id: data["product_id"],
            code: data["product_code"],
            name: data["product_name"]
        },
        qty: data["qty"],
        userCreated: data["user_created"],
        createdDate: data["created_date"],
        userUpdated: data["user_updated"],
        updatedDate: data["updated_date"]
    }

    return entity;
}

export const createStocks = (data: any[]) => {
    let entities: IStock[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createStock(data[i]));
    }

    return entities;
}