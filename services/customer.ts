import { JsonController, Get, UseBefore, Post, Body, Req, Param, UploadedFile, QueryParams, Delete } from "routing-controllers";
import { authenticateUser } from "../middlewares/authentication";
import { createConnection } from "../db";
import { ICustomer, createCustomer, createCustomers } from "../models/customer";
import { buildCode } from "../utils/codeBuilder";

@JsonController("/customers")
export class CustomerService {

    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: number, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const sql = `SELECT * FROM customers WHERE id=? AND org_code=?`;
            const result = await db.query(sql, [id, req["orgCode"]]);

            if (result.length === 0) {
                return {};
            }

            return createCustomer(result[0]);
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

            let sql = `SELECT * FROM customers WHERE org_code=?`;
            let sqlCount = `SELECT COUNT(id) FROM customers WHERE org_code=?`;
            let params = [req["orgCode"]];
            let clauses = [];

            if (queryParams["code"]) {
                clauses.push("code LIKE ?");
                params.push("%" + queryParams["code"] + "%");
            }

            if (queryParams["name"]) {
                clauses.push("name LIKE ?");
                params.push("%" + queryParams["name"] + "%");
            }

            if (clauses.length > 0) {
                sql +=  clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
                sqlCount += clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
            }

            sql += " ORDER BY id DESC ";

            if (queryParams["limit"] && queryParams["offset"]) {
                sql += " LIMIT ? OFFSET ?";

                params.push(queryParams["limit"]);
                params.push(queryParams["offset"]);
            }
            
            const result = await db.query(sql, params);
            const count = await db.query(sqlCount, params); 
            const entities: ICustomer[] = createCustomers(result);

            return {count: count[0]["COUNT(id)"], rows: entities};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    @Post("/save")
    @UseBefore(authenticateUser)
    async save(@Body() data: any, @Req() req: any) {
        try {
            const db = await createConnection(true);

            let isNew = true;
            let sql = null;
            let params = [];

            if (data["id"]) {
                isNew = false;
            }

            const code = await buildCode(db, req["orgCode"], "customer_code", "customers");

            if (isNew) {
                sql = `INSERT INTO customers(code, name, email, address, phone_number, gender, birth_date, join_date, org_code, created_by, 
                       created_date) VALUES(?, ?, ?, ?, ?, ?, ? now(), ?, ?, now())`;

                params = [code, data["name"], data["email"], data["address"], data["phoneNumber"], data["gender"], data["birthDate"], req["orgCode"], 
                          data["userId"]];
            }
            else {
                sql = `UPDATE suppliers SET name=?, email=?, address=?, phone_number=?, gender=?, birty_date=? updated_by=?, updated_date=now() 
                       WHERE id=? AND org_code=?`;
                       
                params = [data["name"], data["email"], data["address"], data["phoneNumber"], data["gender"], data["birthDate"], data["userId"], 
                          data["id"], req["orgCode"]];
            }
            
            await db.query(sql, params);

            return {"success": true};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    @Delete("/delete/:id")
    @UseBefore(authenticateUser)
    async delete(@Param("id") id: any, @Req() req: any) {
        try {
            const db = await createConnection(true);

            await db.query(`DELETE FROM customers WHERE id=? AND org_code=?`, [id, req["orgCode"]]);

            return {"success": true};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
}