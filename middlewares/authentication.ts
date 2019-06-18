import createConnection from '../db';

const bearerToken = require('bearer-token');
const moment = require('moment');

export const authenticateForLogin = async (req, res, next) => {
    bearerToken(req, async(err, token) => {
        const segmentedToken = token.split("$");

        if (segmentedToken.length === 0 ) {
           return res.status(500).send("No org code token found");
        }

        const conn = await createConnection(true);
        const orgCode = segmentedToken[1];
        const config = await conn.query("SELECT * FROM organization_settings WHERE org_code = ? LIMIT 1;", [orgCode]);

        if (config.length === 0) {
            return res.status(401).send("You are not our member :)");
        }

        req["orgCode"] = orgCode;

        next();
    });
}
