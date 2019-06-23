import { JsonController, Get, UseBefore, Post, Body, Req, Param } from "routing-controllers";
import { authenticateUser, authenticateForLogin } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IUserAuth } from "../models/userAuth";

const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

@JsonController("/userAuths")
export class UserAuthService {

    @Post("/login")
    @UseBefore(authenticateForLogin)
    async login(@Body() data: any, @Req() req: any) {
        const db = await createConnection(true);

        try {
            await db.query("SET autocommit = OFF;");
            await db.query("START TRANSACTION;");
            
            const user = await db.query(`SELECT * FROM users WHERE user_name=? AND org_code=?`, [data["userName"], req["orgCode"]]);

            if (user.length === 0) {
                throw new Error("User is not found");
            }

            const matched = await bcrypt.compare(data["password"], user[0]["hash"]);

            if (!matched) {
                throw new Error("Password is not found");
            }

            let token = uuidv4();

            const insertAuthSql = `INSERT INTO user_auths(user_id, token, login_date, ip_address, org_code) VALUES(?, ?, now(), ?, ?)`;
            const params = [user[0]["id"], token, data["ipAddress"], req["orgCode"]];
            const existingAuth = await db.query(`SELECT * FROM user_auths WHERE user_id=?`, [user[0]["id"]]);

            if (existingAuth.length === 0) {
                await db.query(insertAuthSql, params);
            }

            else {
                token = existingAuth[0]["token"];
                await db.query(`UPDATE user_auths SET login_date=? WHERE token=?`, [token]);
            }

            const role = await db.query(`SELECT * FROM roles WHERE id=?`, [user[0]["role_id"]]);
            const accesses = await db.query(`SELECT menu FROM accesses WHERE role_id=? AND org_code=?`, [role[0]["id"], req["orgCode"]]);
            const organization = await db.query(`SELECT * FROM organizations WHERE code=?`, req["orgCode"]);
            const locale = await db.query(`SELECT * FROM locale WHERE id=?`, [organization[0]["code"]]);
            
            const auth: IUserAuth = {
                token: token,
                user: {
                    id: user[0]["id"],
                    code: user[0]["code"],
                    name: user[0]["name"],
                    email: user[0]["email"],
                    roleId: null,
                    userName: null
                },
                role: {
                    id: role[0]["id"],
                    name: role[0]["name"]
                },
                accesses: accesses,
                loginDate: new Date(),
                organization: {
                    locale: {
                        countryCode: locale[0]["country_code"],
                        countryName: locale[0]["country_name"],
                        currencyName: locale[0]["currency_name"],
                        currencyCode: locale[0]["currency_code"],
                        intCallPrefix: locale[0]["int_call_prefix"]
                    },
                    name: organization[0]["name"],
                    address1: organization[0]["address_1"],
                    address2: organization[0]["address_2"],
                    contactPerson: organization[0]["contact_person"],
                    joinDate: organization[0]["join_date"],
                    officialEmail: organization[0]["official_email"],
                    logo_path: organization[0]["logo_path"],
                    phoneNumber: organization[0]["phone_number"]
                }
            }

            return auth;
        }
        catch(error) {
            throw new Error(error.message);
        }
    }

    @Get("/checkAuth")
    @UseBefore(authenticateUser)
    async checkAuth(@Req() req: any) {
        return { authenticate: true };
    }

    @Get("/logout")
    @UseBefore(authenticateUser)
    async logout(@Req() req: any) {
        try {
            const db = await createConnection(true);

            await db.query(`DELETE FROM auths WHERE token=? AND org_code=?`, [req["token"], req["orgCode"]]);

            return { success: true };
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
}