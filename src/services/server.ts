import express from "express";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { connectionFailed } from "../utils/connectionFailed";
import { findProductById } from "../utils/findProductById";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

app.get("/products", async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                name: "asc"
            },
            include: {
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
app.post("/products", async (req: Request, res: Response) => {
    const { name, quantity, price, typeId } = req.body
    try {
        await prisma.product.create({
            data: {
                name,
                quantity,
                price,
                type_products: typeId
            }
        });
        res.status(201).send({ message: "Criado com sucesso" })
        return
    } catch {
        connectionFailed(res);
    }
});
app.delete("/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
        const product = await findProductById(id, res);
        if (!product) return;

        await prisma.product.delete({
            where: { id }
        });

        res.status(200).send({ message: "Produto deletado com sucesso." });
    } catch (error) {
        console.log(error);
        connectionFailed(res);
    }
});
app.put("/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, price, quantity, typeId } = req.body
    try {
        const product = await findProductById(id, res);
        if (!product) return

        await prisma.product.update({
            where: {
                id
            },
            data: {
                name,
                price,
                quantity,
                type_products: typeId
            }
        });
        res.status(200).send({ message: "Produto atualizado com sucesso." });
        return
    } catch (error) {
        console.log(error);
        connectionFailed(res);
    }
});
app.get("/users/:username", async (req: Request, res: Response) => {
    const username = req.params.username;
    try {
        const data = await prisma.user.findFirst({
            where:{
                 name: username
                }
        });
        res.status(200).json(data);
        return
    } catch (error) {
        connectionFailed(res);
        return
    }
});
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
