import express from "express";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { connectionFailed } from "../utils/connectionFailed";

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.get("/products", async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                name: "asc"
            },
            include:{
                type: true
            }
        });
        res.status(200).json(products);
        return
    } catch (error) {
        console.error(error);
        connectionFailed(res);
        return
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
