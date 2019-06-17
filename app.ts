import 'reflect-metadata';
import * as express from 'express';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as routingControllers from 'routing-controllers';
import * as cors from './middlewares/cors';

require('dotenv').config();
const rateLimiter = require('express-rate-limit');
const cookieSession = require('cookie-session');

const limiter = rateLimiter({windowMs: 900000000, max: 1000});
const session = cookieSession({ name: 'ngen_session', keys: [process.env.COOKIE_SECRET] });
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors.default);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(limiter);
app.use(session);

routingControllers.useExpressServer(app, {
    routePrefix: process.env.API,
    classTransformer: false,
    controllers: [__dirname + "/services/*.js"]
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
});