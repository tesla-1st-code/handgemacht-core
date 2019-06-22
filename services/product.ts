import { JsonController, Get, UseBefore, Post, Body, Req, Param, UploadedFile, QueryParams, Delete } from "routing-controllers";
import { authenticateUser } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IProduct, createProduct, createProducts } from "../models/product";
import { storage } from "../middlewares/uploader";
import { buildCode } from "../utils/codeBuilder";

const multer = require('multer');
const upload = multer({ storage: storage });

@JsonController("/products")
export class ProductService {

    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: any, @Req() req: any) {
        try {
            const db = await createConnection(true);
            
            const sql = `SELECT products.id, products.code, products.name, products.description, products.price,  
                         products.picture_1_path, products.picture_2_path, products.picture_3_path, products.picture_4_path,
                         products.created_date, products.updated_date, suppliers.id as supplier_id, suppliers.code as supplier_code, 
                         suppliers.name as supplier_name FROM products LEFT JOIN suppliers ON products.supplier_id = suppliers.id,
                         created_user.name as user_created, products.created_date, updated_user.name as user_updated, products.updated_date
                         LEFT JOIN users as created_user ON products.created_by = created_user.id
                         LEFT JOIN users as updated_user ON products.updated_by = updated_user.id
                         WHERE products.id=? AND org_code=? LIMIT 1;`;

            const result = await db.query(sql, [id, req["orgCode"]]);

            if (result.length === 0) {
                return {};
            }
            
            return createProduct(result[0]);
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    @Get("/getAll")
    @UseBefore(authenticateUser)
    async getAll(@QueryParams() query: any, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const queryParams = JSON.parse(query.query);

            let sql =  `SELECT products.id, products.code, products.name, products.description, products.price,  
                        products.picture_1_path, products.picture_2_path, products.picture_3_path, products.picture_4_path,
                        products.created_date, products.updated_date, suppliers.id as supplier_id, suppliers.code as supplier_code, 
                        suppliers.name as supplier_name FROM products LEFT JOIN suppliers ON products.supplier_id = suppliers.id,
                        created_user.name as user_created, products.created_date, updated_user.name as user_updated, products.updated_date
                        LEFT JOIN users as created_user ON products.created_by = created_user.id
                        LEFT JOIN users as updated_user ON products.updated_by = updated_user.id
                        WHERE org_code=?;`

            let sqlCount = `SELECT COUNT(products.id) FROM products LEFT JOIN suppliers ON products.supplier_id = suppliers.id 
                            LEFT JOIN users as created_user ON products.created_by = created_user.id
                            LEFT JOIN users as updated_user ON products.updated_by = updated_user.id WHERE org_code=?`;

            let clauses = [];
            let params = [req["orgCode"]];

            if (queryParams["code"]) {
                clauses.push("code LIKE ?");
                params.push("%" + queryParams["code"] + "%");
            }

            if (queryParams["name"]) {
                clauses.push("name LIKE ?");
                params.push("%" + queryParams["name"] + "%");
            }

            if (queryParams["supplierId"]) {
                clauses.push("supplier_id = ?");
                params.push(queryParams["supplierId"]);
            }

            if (clauses.length > 0) {
                sql +=  clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
                sqlCount += clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
            }

            sql += " ORDER BY products.id DESC ";

            if (queryParams["limit"] && queryParams["offset"]) {
                sql += " LIMIT ? OFFSET ?";

                params.push(queryParams["limit"]);
                params.push(queryParams["offset"]);
            }
            
            const result = await db.query(sql, params);
            const count = await db.query(sqlCount, params); 
            const entities: IProduct[] = createProducts(result);

            return {count: count[0]["COUNT(products.id)"], rows: entities};

        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    @Post("/upload/:id")
    @UseBefore(authenticateUser)
    async upload(@Param("id") id: number, @UploadedFile("fileName",  { options: upload }) file: any, @Req() req: any) {}

    @Post("/save")
    @UseBefore(authenticateUser)
    async save(@Body() data: any, @Req() req: any) {
        const db = await createConnection(true);

        try {
            await db.query("SET autocommit = OFF;");
            await db.query("START TRANSACTION;");
            
            let isNew = true;
            let sql = null;
            let params = [];

            if (data["id"]) {
                isNew = false;
            }

            const code = await buildCode(db, req["orgCode"], "product_code", "products");
            
            if (isNew) {
                sql = `INSERT INTO products(code, name, description, price, supplier_id, org_code, created_by, created_date) 
                      VALUES(?, ?, ?, ?, ?, ?, now())`;

                params = [code, data["name"], data["description"], data["price"], data["supplierId"], req["orgCode"], data["userId"]];
            }
            else {
                sql = `UPDATE products SET name=?, description=?, price=?, supplier_id=?, updated_by=?, updated_date=now() 
                       WHERE id=? AND org_code=?`;
                       
                params = [data["name"], data["description"], data["price"], data["supplierId"], data["userId"], data["id"], req["orgCode"]];
            }
            
            const insertedProduct = await db.query(sql, params);

            if (isNew) {
                await db.query(`INSERT INTO stocks(product_id, qty, org_code, created_by, created_date) VALUES(?, ?, ?, ?, now())`, 
                              [insertedProduct["insertId"], data["initialQty"], req["orgCode"], data["userId"]]);
            }

            await db.query("COMMIT;");

            return {"success": true};
        }
        catch(error) {
            await db.query("ROLLBACK;");
            throw new Error(error.message);
        }
    }

    @Delete("/delete/:id")
    @UseBefore(authenticateUser)
    async delete(@Param("id") id: number, @Req() req: any) {
        const db = await createConnection(true);

        try {
            await db.query("SET autocommit = OFF;");
            await db.query("START TRANSACTION;");

            await db.query(`DELETE FROM stocks WHERE product_id=? AND org_code=?`, [id, req["orgCode"]]);
            await db.query(`DELETE FROM products WHERE id=? AND org_code=?`, [id, req["orgCode"]]);

            await db.query("COMMIT;");
            return {"success": true};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
}