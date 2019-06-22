export const buildCode = async(db, orgCode, fieldName, tableName, separator = '-', index = 1) => {
    try {
        const latestData = await db.query(`SELECT * FROM ${tableName} WHERE org_code=? ORDER BY id DESC`, [orgCode]);
        let counter = 1;
        let latestCode = null;

        if (latestData.length === 0) {
            const setting = await db.query(`SELECT * FROM settings WHERE org_code=?`, [orgCode]);

            if (setting.length === 0) {
                throw new Error("Org code is not registered");
            }

            latestCode = setting[0][fieldName] + counter.toString();
        }
        else {
            counter += 1;
            latestCode = latestData[0]["code"].split(separator)[index] + counter.toString();
        }

        return latestCode;
    }
    catch(error) {
        throw new Error(error.message);
    }
}