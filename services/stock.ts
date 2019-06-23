import { JsonController, Get, UseBefore, Post, Body, Req, Param, QueryParams, Delete } from "routing-controllers";
import { authenticateUser } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IStock, createStock, createStocks } from "../models/stock";

@JsonController("/stocks")
export class StockService {

    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: number, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const sql = `SELECT stocks.id, stocks.qty, stocks.product_id, products.code as product_code, products.name as product_name,
                         created_users.name as user_created, stocks.created_date, updated_users.name as user_updated, stocks.updated_date
                         FROM stocks, products, users as created_users, users as updated_users WHERE stocks.id=? AND stocks.org_code=? 
                         AND stocks.product_id = products.id AND created_users.id = stocks.created_by AND updated_users.id = stocks.updated_by`;
            
            const result = await db.query(sql, [id, req["orgCode"]]);

            if (result.length === 0) {
                return {};
            }
            
            return createStock(result[0]);
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    @Get("/getAll")
    @UseBefore(authenticateUser)
    async getAll(@QueryParams() query: any, @Req() req: any){
        try {
            const db = await createConnection(true);
            const queryParams = JSON.parse(query.query);

            let sql = `SELECT stocks.id, stocks.qty, stocks.product_id, products.code as product_code, products.name as product_name,
                       created_users.name as user_created, stocks.created_date, updated_users.name as user_updated, stocks.updated_date
                       FROM stocks, products, users as created_users, users as updated_users WHERE stocks.org_code=? 
                       AND stocks.product_id = products.id AND created_users.id = stocks.created_by AND updated_users.id = stocks.updated_by`;

            let sqlCount = `SELECT COUNT(stocks.id) FROM stocks, products, users as created_users, users as updated_users WHERE stocks.org_code=? 
                            AND stocks.product_id = products.id AND created_users.id = stocks.created_by AND updated_users.id = stocks.updated_by`;
           
            let clauses = [];
            let params = [req["orgCode"]];

            if (queryParams["productId"]) {
                clauses.push("product_id = ?");
                params.push(queryParams["productId"]);
            }
            
            if (clauses.length > 0) {
                sql +=  clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
                sqlCount += clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
            }

            sql += " ORDER BY stocks.id DESC ";

            if (queryParams["limit"] && queryParams["offset"]) {
                sql += " LIMIT ? OFFSET ?";

                params.push(queryParams["limit"]);
                params.push(queryParams["offset"]);
            }
            
            const result = await db.query(sql, params);
            const count = await db.query(sqlCount, params); 
            const entities: IStock[] = createStocks(result);

            return {count: count[0]["COUNT(stocks.id)"], rows: entities};
        }
        catch(error) {
            throw new Error(error.message)
        }
    }

    @Post("/save")
    @UseBefore(authenticateUser)
    async save(@Body() data: any, @Req() req: any){
        try {
            const db = await createConnection(true);

            let isNew = true;
            let sql = null;
            let params = [];

            if (data["id"]) {
                isNew = false;
            }

            if (isNew) {
                sql = `INSERT INTO stocks(product_id, qty, org_code, created_by, created_date) VALUES(?, ?, ?, ?, now())`;
                params = [data["productId"], data["qty"], req["orgCode"], data["userId"]];
            }
            else {
                sql = `UPDATE stocks SET qty=?, updated_by=?, updated_date=now() WHERE id=? AND org_code=?`;
                params = [data["qty"], data["userId"], data["id"], req["orgCode"]];
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
    async delete(@Param("id") id: number, @Req() req: any){
        throw new Error("Stock can't be deleted from here :)");
    }
}