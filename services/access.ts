import { JsonController, Get, UseBefore, Post, Body, Req, Param, QueryParams, Delete } from "routing-controllers";
import { authenticateUser } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IAccess, createAccess, createAccesses } from "../models/access";

@JsonController("/accesses")
export class AccessService {
    
    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: number, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const sql = `SELECT accesses.id, accesses.role_id, roles.id as role_id, roles.name as role_name 
                         FROM accesses, roles WHERE id=? AND org_code=? AND accesses.role_id = roles.id`;
            const result = await db.query(sql, [id, req["orgCode"]]);

            if (result.length === 0) {
                return {};
            }

            return createAccess(result[0]);
        }
        catch(error) {
            throw new Error(error.messagge);
        }
    }

    @Get("/getAll")
    @UseBefore(authenticateUser)
    async getAll(@QueryParams() query: any, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const queryParams = JSON.parse(query.query);

            let sql = `SELECT accesses.id, accesses.role_id, roles.id as role_id, roles.name as role_name 
                       FROM accesses, roles WHERE org_code=? AND accesses.role_id = roles.id`;

            let sqlCount = `SELECT COUNT(accesses.id) FROM accesses, roles WHERE org_code=? AND accesses.role_id = roles.id`;
            let clauses = [];
            let params = [req["orgCode"]];

            if (queryParams["roleId"]) {
                clauses.push("role_id = ?");
                params.push(queryParams["roleId"]);
            }

            if (clauses.length > 0) {
                sql +=  clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
                sqlCount += clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
            }

            sql += " ORDER BY accesses.id DESC ";

            if (queryParams["limit"] && queryParams["offset"]) {
                sql += " LIMIT ? OFFSET ?";

                params.push(queryParams["limit"]);
                params.push(queryParams["offset"]);
            }
            
            const result = await db.query(sql, params);
            const count = await db.query(sqlCount, params); 
            const entities: IAccess[] = createAccesses(result);

            return {count: count[0]["COUNT(accesses.id)"], rows: entities};
        }
        catch(error) {
            throw new Error(error.message);
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
                sql = `INSERT INTO accesses(role_id, menu, org_code) VALUES(?, ?)`;
                params = [data["roleId"], data["menu"], req["orgCode"]];
            }
            else {
                sql = `UPDATE accesses SET role_id=?, menu=? WHERE id=? AND org_code=?`;
                params = [data["roleId"], data["menu"], data["id"], req["orgCode"]];
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
    async delete(@Param("id") id: number, @Req() req: any) {
        try {
            const db = await createConnection(true);

            await db.query(`DELETE FROM accesses WHERE id=? AND org_code=?`, [id, req["orgCode"]]);

            return {"success": true};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
}