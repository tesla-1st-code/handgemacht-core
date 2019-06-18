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

export const authenticateBackend = async (req, res, next) => {
    bearerToken(req, async(err, token) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (!token) {
            return res.status(500).send("No auth token found");
        }

        const segmentedToken = token.split("$");

        if (segmentedToken.length > 0 && segmentedToken.length < 2) {
           return res.status(500).send("No auth token found");
        }

        const conn = await createConnection(true);
        
        const bearerToken = segmentedToken[0];
        const orgCode = segmentedToken[1];
        const organization = await conn.query("SELECT * FROM organizations WHERE code =? LIMIT 1;", [orgCode]);

        if (organization.length === 0) {
            return res.status(401).send("You are not our member :)");
        }

        const auth = await conn.query("SELECT * FROM auths WHERE token=?", [bearerToken]);

        if (auth.length === 0) {
            return res.status(401).send("You are not logged in.");
        }

        const now = moment(new Date());
        const expiredDate = moment(organization[0]["expired_date"]);
        const diff = expiredDate.diff(now, 'days');

        if (diff <=0 ) {
            return res.status(500).send("Your app key is expired.");
        }

        const userId = auth[0]["user_id"];
        const user = await conn.query("SELECT * FROM users WHERE id=?", [userId]);

        if (user.length === 0) {
            return res.status(500).send("User is invalid");
        }

        req["token"] = bearerToken;
        req["orgCode"] = orgCode;

        next();
    });
}
