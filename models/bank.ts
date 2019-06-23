export interface IBank {
    id: number;
    name: string;
}

export const createBank = (data: any) => {
    const entity: IBank = {
        id: data["id"],
        name: data["name"]
    }

    return entity;
}

export const createBanks = (data: any[]) => {
    let entities: IBank[] = [];

    for (let i=0; i<data.length; i++) {
        entities.push(createBank(data[i]));
    }

    return entities;
}