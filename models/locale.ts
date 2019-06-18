export interface ILocale { 
    countryName: string;
    countryCode: string;
    currencyName: string;
    currencyCode: string;
    intCallPrefix: string;
}

export const createLocale = (data: any) => {
    const entity: ILocale = {
        countryName: data["country_name"],
        countryCode: data["country_code"],
        currencyName: data["currency_name"],
        currencyCode: data["currency_code"],
        intCallPrefix: data["int_call_prefix"]
    }

    return entity;
}