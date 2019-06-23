import { JsonController, Get, UseBefore, Post, Body, Req, Param, QueryParams, Delete } from "routing-controllers";
import { authenticateUser } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IRole, createRole, createRoles } from "../models/role";

@JsonController("/roles")
export class RoleService {
    
    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: number, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const sql = `SELECT * FROM roles WHERE id=? AND org_code=?`;
            const result = await db.query(sql, [id, req["orgCode"]]);

            if (result.length === 0) {
                return {};
            }

            return createRole(result[0]);
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

            let sql = `SELECT * FROM roles WHERE org_code=?`;
            let sqlCount = `SELECT COUNT(id) FROM roles WHERE org_code=?`;
            let clauses = [];
            let params = [req["orgCode"]];

            if (queryParams["name"]) {
                clauses.push("name LIKE ?");
                params.push('%' + queryParams["name"] + '%');
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
            const entities: IRole[] = createRoles(result);

            return {count: count[0]["COUNT(id)"], rows: entities};
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
                sql = `INSERT INTO roles(name, org_code) VALUES(?, ?)`;
                params = [data["name"], req["orgCode"]];
            }
            else {
                sql = `UPDATE roles SET name=? WHERE id=? AND org_code=?`;
                params = [data["name"], data["id"], req["orgCode"]];
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

            await db.query(`DELETE FROM roles WHERE id=? AND org_code=?`, [id, req["orgCode"]]);

            return {"success": true};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
}