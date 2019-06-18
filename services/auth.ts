import { JsonController, Get, UseBefore, Post, Body, Req, Param } from "routing-controllers";
import { authenticateForLogin } from "../middlewares/authentication";
import createConnection from "../db";

const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

@JsonController("/auths")
export class AuthService {}