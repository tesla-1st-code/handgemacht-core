import { ILocale } from "./locale";

export interface IOrganization { 
    locale: ILocale
    name: string;
    address1?: string;
    address2?: string;
    officialEmail?: string;
    phoneNumber?: string;
    contactPerson?: string;
    joinDate: Date;
    logo_path?: string;
}

export const createOrganization = (data: any) => {
    const entity: IOrganization = {
        locale: data["locale"],
        name: data["name"],
        address1: data["address_1"] ? data["address_1"] : null,
        address2: data["address_2"] ? data["address_2"] : null,
        officialEmail: data["official_email"] ? data["official_email"] : null,
        phoneNumber: data["phone_number"] ? data["phone_number"] : null,
        joinDate: data["join_date"],
        logo_path: data["logo_path"] ? data["logo_path"] : null
    }

    return entity;
}