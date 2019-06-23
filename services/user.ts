import { JsonController, Get, UseBefore, Post, Body, Req, Param, QueryParams, Delete } from "routing-controllers";
import { authenticateUser } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IUser, createUser, createUsers } from "../models/user";
import { buildCode } from "../utils/codeBuilder";

const bcrypt = require('bcrypt');
const saltRounds = 16;

@JsonController("/users")
export class UserService {

    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: number, @Req() req: any) {
        try {
            const db = await createConnection(true);
            const sql = `SELECT users.id, users.name, users.user_name, users.email, roles.id as role_id, roles.name as role_name 
                         FROM users, roles WHERE id=? AND org_code=? AND users.role_id = roles.id`;

            const result = await db.query(sql, [id, req["orgCode"]]);

            if (result.length === 0) {
                return {};
            }

            return createUser(result[0]);
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

            let sql = `SELECT users.id, users.name, users.user_name, users.email, roles.id as role_id, roles.name as role_name 
                       FROM users, roles WHERE org_code=? AND users.role_id = roles.id`;

            let sqlCount = `SELECT COUNT(users.id) FROM users, roles WHERE org_code=? AND users.role_id = roles.id`;
            let params = [req["orgCode"]];
            let clauses = [];

            if (queryParams["name"]) {
                clauses.push("name LIKE ?");
                params.push("%" + queryParams["name"] + "%");
            }

            if (queryParams["email"]) {
                clauses.push("email LIKE ?");
                params.push("%" + queryParams["email"] + "%");
            }

            if (queryParams["userName"]) {
                clauses.push("user_name LIKE ?");
                params.push("%" + queryParams["userName"] + "%");
            }

            if (queryParams["roleId"]) {
                clauses.push("role_id = ?");
                params.push(queryParams["roleId"]);
            }

            if (clauses.length > 0) {
                sql +=  clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
                sqlCount += clauses.length > 1 ? clauses.join(" AND ") : (" AND " + clauses[0]);
            }

            sql += " ORDER BY users.id DESC ";

            if (queryParams["limit"] && queryParams["offset"]) {
                sql += " LIMIT ? OFFSET ?";

                params.push(queryParams["limit"]);
                params.push(queryParams["offset"]);
            }
            
            const result = await db.query(sql, params);
            const count = await db.query(sqlCount, params); 
            const entities: IUser[] = createUsers(result);

            return {count: count[0]["COUNT(users.id)"], rows: entities};
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
            let hash = null;
            let salt = null;
            let sql = null;
            let params = [];

            if (data["id"]) {
                isNew = false;
            }

            if (data["password"]) {
                salt = await bcrypt.genSalt(saltRounds);
                hash = await bcrypt.hash(data["password"], salt);
            }

            const code = await buildCode(db, req["orgCode"], "officer_code_prefix", "users");

            if (isNew) {
                if (!hash || !salt) {
                    throw new Error("Password is not set yet");
                }

                sql = `INSERT INTO users(code, name, email, role_id, user_name, hash, salt, org_code) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
                params = [code, data["name"], data["email"], data["roleId"], data["userName"], hash, salt, req["orgCode"]]
            }
            else {
                if (!hash || !salt) {
                    sql = `UPDATE users SET name=?, email=?, role_id=?, user_name=? WHERE id=? AND org_code=?`;
                    params = [data["name"], data["email"], data["roleId"], data["userName"], data["id"], req["orgCode"]];
                }
                else {
                    sql = `UPDATE users SET name=?, email=?, hash=?, salt=?, role_id=?, user_name=? WHERE id=? AND org_code=?`;
                    params = [data["name"], data["email"], hash, salt, data["roleId"], data["userName"], data["id"], req["orgCode"]];
                }   
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

            await db.query(`DELETE FROM users WHERE id=? AND org_code=?`, [id, req["orgCode"]]);

            return {"success": true};
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
}