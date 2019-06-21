import { JsonController, Get, UseBefore, Post, Body, Req, Param, UploadedFile, QueryParam, Delete } from "routing-controllers";
import { authenticateUser, authenticateForLogin } from "../middlewares/authentication";
import { createConnection } from "../db";
import { IProduct } from "../models/product";
import { storage } from "../middlewares/uploader";

const multer = require('multer');
const upload = multer({ storage: storage });

@JsonController("/products")
export class ProductService {

    @Get("/get/:id")
    @UseBefore(authenticateUser)
    async get(@Param("id") id: any, @Req() req: any) {}

    @Get("/getAll")
    @UseBefore(authenticateUser)
    async getAll(@QueryParam("query") query: any) {}

    @Post("/upload/:id")
    @UseBefore(authenticateUser)
    async upload(@Param("id") id: number, @UploadedFile("fileName",  { options: upload }) file: any, @Req() req: any) {}

    @Post("/save")
    @UseBefore(authenticateUser)
    async save(@Body() data: any, @Req() req: any) {}

    @Delete("/delete/:id")
    @UseBefore(authenticateUser)
    async delete(@Param("id") id: number, @Req() req: any) {}
}