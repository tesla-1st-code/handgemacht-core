const mysql = require('promise-mysql');

require('dotenv').config();

export default async (useDefaultDB: boolean = false) => {
    try {
        let pool;
        let connection;

        if (pool) {
            connection = pool.getConnection();
        }
        else {
            pool = await mysql.createPool({
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                host: process.env.DB_HOST,
                database: useDefaultDB ? process.env.DB_NAME : null,
                connectionLimit: 10
            });
            connection = pool.getConnection();
        }
        return connection;
    } 
    catch (error) {
        throw error;
    }
}