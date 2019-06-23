import { createConnection } from './db';

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
            country_name VARCHAR(255) NOT NULL,
            country_code VARCHAR(255) NOT NULL,
            currency_name VARCHAR(255) NOT NULL,
            currency_symbol VARCHAR(255) NOT NULL,
            int_call_prefix VARCHAR(10) NOT NULL,
            PRIMARY KEY (id),
            INDEX idx_locales(id)
        );
    `);

    console.log("table locales has been created");

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

    console.log("table organizations has been created");

    await conn.query(`
        CREATE TABLE settings(
            id INT NOT NULL AUTO_INCREMENT,
            customer_code_prefix VARCHAR(255) NOT NULL,
            product_code_prefix VARCHAR(255) NOT NULL,
            officer_code_prefix VARCHAR(255) NOT NULL,
            cart_code_prefix VARCHAR(255) NOT NULL,
            payment_code_prefix VARCHAR(255) NOT NULL,
            order_code_prefix VARCHAR(255) NOT NULL,
            supplier_code_prefix VARCHAR(255) NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            INDEX idx_settings(id, org_code)
        );
    `);

    console.log("table settings has been created");

    await conn.query(`
        CREATE TABLE roles(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            INDEX idx_roles(id, org_code)
        );
    `);

    console.log("table roles has been created");

    await conn.query(`
        CREATE TABLE payment_methods(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            PRIMARY KEY (id),
            INDEX idx_payment_methods(id)
        );
    `);

    console.log("table payment methods has been created");

    await conn.query(`
        CREATE TABLE banks(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            INDEX idx_banks(id, org_code)
        );
    `);

    console.log("table banks has been created");

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

    console.log("table accesses has been created");

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

    console.log("table users has been created");

    await conn.query(`
        CREATE TABLE user_auths(
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            ip_address VARCHAR(255) NOT NULL,
            login_date DATETIME NOT NULL,
            org_code VARCHAR(255),
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_auths(id, token, org_code)
        );
    `);

    console.log("table user_auths has been created");

    await conn.query(`
        CREATE TABLE suppliers(
            id INT NOT NULL AUTO_INCREMENT,
            code VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            address TEXT,
            phone_number VARCHAR(255),
            join_date DATE,
            org_code VARCHAR(255) NOT NULL,
            created_date DATETIME,
            created_by INT,
            updated_date DATETIME,
            updated_by INT,
            PRIMARY KEY (id),
            INDEX idx_suppliers(id, org_code)
        );
    `);

    console.log("table customers has been created");

    await conn.query(`
        CREATE TABLE products(
            id INT NOT NULL AUTO_INCREMENT,
            code VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            supplier_id INT,
            price DECIMAL(10,2) DEFAULT 0,
            picture_1_path TEXT,
            picture_2_path TEXT,
            picture_3_path TEXT,
            picture_4_path TEXT,
            org_code VARCHAR(255) NOT NULL,
            created_date DATETIME,
            created_by INT,
            updated_date DATETIME,
            updated_by INT,
            PRIMARY KEY (id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            INDEX idx_products(id, org_code)
        );
    `);

    console.log("table products has been created");

    await conn.query(`
        CREATE TABLE stocks(
            id INT NOT NULL AUTO_INCREMENT,
            product_id INT NOT NULL,
            qty INT DEFAULT 0,
            org_code VARCHAR(255) NOT NULL,
            created_date DATETIME,
            created_by INT,
            updated_date DATETIME,
            updated_by INT,
            PRIMARY KEY (id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            INDEX idx_stocks(id, org_code)
        );
    `);

    console.log("table stocks has been created");

    await conn.query(`
        CREATE TABLE customers(
            id INT NOT NULL AUTO_INCREMENT,
            code VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            address TEXT,
            phone_number VARCHAR(255),
            birth_date DATE,
            gender VARCHAR(5),
            join_date DATE,
            org_code VARCHAR(255) NOT NULL,
            created_date DATETIME,
            created_by INT,
            updated_date DATETIME,
            updated_by INT,
            PRIMARY KEY (id),
            INDEX idx_customers(id, org_code)
        );
    `);

    console.log("table customers has been created");

    await conn.query(`
       CREATE TABLE promotions(
           id INT NOT NULL AUTO_INCREMENT,
           product_id INT NOT NULL,
           voucher_code VARCHAR(255),
           price DECIMAL(10, 2) DEFAULT 0,
           description TEXT,
           is_active BOOLEAN DEFAULT 0,
           org_code VARCHAR(255) NOT NULL,
           created_by INT,
           created_date DATETIME,
           updated_by INT,
           updated_date DATETIME,
           PRIMARY KEY (id),
           FOREIGN KEY (product_id) REFERENCES products(id),
           INDEX idx_promotions(id, org_code)
       );
    `);

    console.log("table promotion has been created");

    await conn.query(`
       CREATE TABLE carts(
           id INT NOT NULL AUTO_INCREMENT,
           code VARCHAR(255) NOT NULL,
           customer_id INT,
           ip_address VARCHAR(255),
           total_items INT DEFAULT 0,
           grand_total DECIMAL(10, 2) DEFAULT 0,
           org_code VARCHAR(255) NOT NULL,
           cart_date DATETIME,
           checkout_date DATETIME,
           PRIMARY KEY (id),
           FOREIGN KEY (customer_id) REFERENCES customers(id),
           INDEX idx_carts(id, org_code)
       );
    `);

    console.log("table cart has been created");

    await conn.query(`
       CREATE TABLE cart_details(
           id INT NOT NULL AUTO_INCREMENT,
           cart_id INT NOT NULL,
           product_id INT NOT NULL,
           qty INT DEFAULT 0,
           sub_total DECIMAL(10, 2) DEFAULT 0,
           additional DECIMAL(10, 2) DEFAULT 0,
           discount DECIMAL(10, 2) DEFAULT 0,
           tax_percentage FLOAT DEFAULT 0,
           is_using_promo BOOLEAN DEFAULT 0,
           org_code VARCHAR(255) NOT NULL,
           created_date DATETIME,
           PRIMARY KEY (id),
           FOREIGN KEY (product_id) REFERENCES products(id),
           INDEX idx_cart_details(id, cart_id, org_code)
       );
    `);

    console.log("table cart detail has been created");

    await conn.query(`
       CREATE TABLE orders(
           id INT NOT NULL AUTO_INCREMENT,
           code VARCHAR(255) NOT NULL,
           cart_id INT NOT NULL
           org_code VARCHAR(255) NOT NULL,
           processed_date DATETIME,
           processed_by INT,
           PRIMARY KEY (id),
           FOREIGN KEY (cart_id) REFERENCES carts(id),
           INDEX idx_orders(id, org_code)
       );
    `);

    console.log("table order has been created");
}

const createData = async() => {
    const db = await createConnection(true);

    const saltKey = await bcrypt.genSalt(saltRounds);
    const hashKey = await bcrypt.hash(orgCode, saltKey);

    const locale = await db.query(`INSERT INTO locales(country_code, country_name, currency_name, currency_symbol, int_call_prefix) 
                                   VALUES (?, ?, ?, ?, ?)`, ["ID", "INDONESIA", "Rupiah", "Rp", "+62"]);

    console.log("locale data has been created");

    await db.query(`INSERT INTO organizations(locale_id, code, name, address_1, address_2, contact_person, official_email, phone_number, 
                    logo_path, app_key, join_date, expired_date) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), '2019-12-12')`, 
                    [locale["insertId"], orgCode, "PT Demo", "Jl Abc Def, Jakarta Pusat", "", "Vai", "vai13@gmail.com", "+6285993495949", "", hashKey]);
    
    console.log("organization data has been created");

    await db.query(`INSERT INTO settings(customer_code_prefix, officer_code_prefix, product_code_prefix, cart_code_prefix, order_code_prefix, 
                    payment_code_prefix, supplier_code_prefix, org_code) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, 
                    ["CST-", "OFC-", "PRD-", "CRT/DEMO/", "ORD/DEMO/", "PYM/DEMO/", "SUP/DEMO/", orgCode]);
    
    console.log("setting data has been created");

    await db.query(`INSERT INTO banks(name, org_code) VALUES(?, ?)`, ['MANDIRI', orgCode]);
    await db.query(`INSERT INTO banks(name, org_code) VALUES(?, ?)`, ['BCA', orgCode]);
    await db.query(`INSERT INTO banks(name, org_code) VALUES(?, ?)`, ['BRI', orgCode]);

    console.log("bank data has been created");

    await db.query(`INSERT INTO roles(name, org_code) VALUES(?, ?)`, ['ADMINISTRATOR', orgCode]);

    const userSalt = await bcrypt.genSalt(saltRounds);
    const userPass = process.env.DEFAULT_ADMIN_PASS;
    const userHash = await bcrypt.hash(userPass, userSalt);

    await db.query(`INSERT INTO users(code, name, user_name, hash, salt, role_id, org_code) VALUES(?, ?, ?, ?, ?, ?, ?)`, 
                   ["OFC-1", "administrator", "admin", userHash, userSalt, 1, orgCode]);
    
   console.log("user data has been created");

   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "dashboard", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "customer", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "account", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "product", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "promotion", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "stock", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "cart", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "order", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "payment", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "analytic", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "report", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "user", orgCode]);
   await db.query("INSERT INTO accesses(role_id, menu, org_code)VALUES(?, ?, ?)", [1, "setting", orgCode]);

   console.log("access data has been created");

   for (let i=0; i<300; i++) {
        const name = "PRODUCT " + (i + 1).toString();
        const code = "PRD-" + (i + 1).toString();
        const description = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Phasellus blandit metus rutrum tellus consectetur dapibus. 
            Vivamus ut justo eget lectus auctor congue.
            Maecenas vel dictum sem. Donec fringilla blandit sapien, vel feugiat eros accumsan quis. 
            Aenean consectetur vulputate aliquam. Nulla quis risus lacinia, dapibus lectus ac, imperdiet massa. 
            Morbi a nisl arcu. Ut ornare diam sed tempus volutpat. Duis fringilla tortor ac gravida aliquet. 
            Nullam faucibus nec purus a viverra.
            Mauris ut nisl aliquet, pharetra ex sed, hendrerit quam. Morbi urna felis, dignissim id tincidunt non, hendrerit cursus tellus.
            Fusce at vehicula mauris. Nunc lobortis feugiat dui sit amet pharetra. 
            Praesent lacinia nisi eget purus vehicula, et lacinia libero scelerisque.`;

        const inserted = await db.query(`INSERT INTO products(code, name, description, price, created_by, created_date, org_code) 
                                        VALUES (?, ?, ?, ?, 1, now(), '6e8e0aea-955e-4c21-a9cd-3cb57b555676');`, 
                                        [code, name, description, Math.floor(Math.random() * Math.floor(500))]);

        await db.query(`INSERT INTO stocks(product_id, qty, created_by, created_date, org_code) 
                        VALUES(?, ?, 1, now(), '6e8e0aea-955e-4c21-a9cd-3cb57b555676')`, 
                        [inserted["insertId"], Math.floor(Math.random() * Math.floor(300))]);

        console.log("Product " + (i + 1).toString() + " has been inserted");
    }

    const genders = ["m", "f"];

    for (let i=0; i<300; i++) {
        const name = "CUSTOMER " + (i + 1).toString();
        const code = "CST-" + (i + 1).toString();
        const gender = genders[Math.floor(Math.random() * Math.floor(1))];
        const email = "cust" + (i + 1).toString() + "@customer.com";

        await db.query(`INSERT INTO customers(code, name, email, gender, join_date, org_code) VALUES(?, ?, ?, ?, now(), ?)`, 
                          [code, name, email, gender, orgCode]);

        console.log("Customer " + (i + 1).toString() + " has been inserted");
    }

    for (let i=0; i<300; i++) {
        const name = "SUPPLIER " + (i + 1).toString();
        const code = "SUP-" + (i + 1).toString();
        const gender = genders[Math.floor(Math.random() * Math.floor(1))];
        const email = "supplier" + (i + 1).toString() + "@supplier.com";

        await db.query(`INSERT INTO customers(code, name, email, gender, join_date, org_code) VALUES(?, ?, ?, ?, now(), ?)`, 
                          [code, name, email, gender, orgCode]);

        console.log("Customer " + (i + 1).toString() + " has been inserted");
    }

    await db.query(`INSERT INTO payment_methods(name) VALUES(?)`, ['CASH', orgCode]);
    await db.query(`INSERT INTO payment_methods(name) VALUES(?)`, ['TRANSFER', orgCode]);
    await db.query(`INSERT INTO payment_methods(name) VALUES(?)`, ['CARD', orgCode]);
    await db.query(`INSERT INTO payment_methods(name) VALUES(?)`, ['COD', orgCode]);
}

const run = async() => {
    await createDB();
    await createTables();
    await createData();
}

run();