import createConnection from './db';

const bcrypt = require('bcrypt');
const saltRounds = 16;
const orgCode = "6e8e0aea-955e-4c21-a9cd-3cb57b555676";

const createDB = async() => {
    const conn = await createConnection();

    await conn.query(`
        DROP DATABASE IF EXISTS ${process.env.DB_NAME};
    `);

    await conn.query(`
        CREATE DATABASE ${process.env.DB_NAME};
    `);

    await conn.query(`USE ${process.env.DB_NAME}`);
    console.log("DB has been migrated");
}

const createTables = async() => {
    const conn = await createConnection(true);

    await conn.query(`
        CREATE TABLE locales(
            id INT NOT NULL AUTO_INCREMENT,
            code VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            currency_name VARCHAR(255) NOT NULL,
            currency_symbol VARCHAR(255) NOT NULL,
            int_call_prefix VARCHAR(10) NOT NULL,
            PRIMARY KEY (id),
            INDEX idx_locales(id)
        );
    `);

    await conn.query(`
        CREATE TABLE organizations(
            id INT NOT NULL AUTO_INCREMENT,
            locale_id INT NOT NULL,
            code VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            contact_person VARCHAR(255) NOT NULL,
            address_1 TEXT,
            address_2 TEXT,
            official_email VARCHAR(255),
            phone_number VARCHAR(20),
            logo_path TEXT,
            app_key VARCHAR(255) NOT NULL,
            join_date DATE NOT NULL,
            expired_date DATE NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (locale_id) REFERENCES locales(id),
            INDEX idx_organizations(id)
        );
    `);

    await conn.query(`
        CREATE TABLE settings(
            id INT NOT NULL AUTO_INCREMENT,
            customer_code_prefix VARCHAR(255) NOT NULL,
            product_code_prefix VARCHAR(255) NOT NULL,
            office_code_prefix VARCHAR(255) NOT NULL,
            cart_code_prefix VARCHAR(255) NOT NULL,
            payment_code_prefix VARCHAR(255) NOT NULL,
            order_code_prefix VARCHAR(255) NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            INDEX idx_settings(id, org_code)
        );
    `);

    await conn.query(`
        CREATE TABLE roles(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            INDEX idx_roles(id, org_code)
        );
    `);

    await conn.query(`
        CREATE TABLE banks(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            INDEX idx_banks(id, org_code)
        );
    `);

    await conn.query(`
        CREATE TABLE accesses(
            id INT NOT NULL AUTO_INCREMENT,
            role_id INT NOT NULL,
            menu VARCHAR(255) NOT NULL,
            org_code VARCHAR(255) NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (role_id) REFERENCES roles(id),
            INDEX idx_accesses (id, role_id, org_code)
        );
    `);

    await conn.query(`
        CREATE TABLE users(
            id INT NOT NULL AUTO_INCREMENT,
            code VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            user_name VARCHAR(255) NOT NULL,
            hash VARCHAR(255) NOT NULL,
            salt VARCHAR(255) NOT NULL,
            role_id INT NOT NULL,
            org_code VARCHAR(255) NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (role_id) REFERENCES roles(id),
            INDEX idx_users(id, org_code)
        );
    `);
}

const run = async() => {
    await createDB();
    await createTables();
}

run();