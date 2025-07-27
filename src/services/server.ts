import express from "express";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { connectionFailed } from "../utils/connectionFailed";
import { findProductById } from "../utils/findProductById";
import cors from "cors";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { authenticateToken } from "../utils/middleware/authtoken";
import { MyJwtPayload } from "../types/express/index.custom";

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
app.post("/register", async (req: Request, res: Response) => {
    const { username, password, email, userLevel } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: {
            name: username,
            password: hash,
            email,
            user_level: userLevel
        }
    });
    res.status(200).send({ message: "Usuário criado com sucesso." });
    return
});
app.post("/login", async (req: Request, res: Response) => {
    let isAdmin = false;
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
        where: {
            name: username
        }
    });
    if (!user) {
        res.status(404).send({ message: "Usuário não encontrado." })
    } else {
        const match = await bcrypt.compare(password.trim(), user.password);
        if (match) {
            if (user.user_level === 1) {
                isAdmin = true
            };
            const token = jwt.sign(
                { id: user.id, username: user.name, isAdmin },
                "segredo super secreto",
                { expiresIn: "1h" }
            );
            res.status(200).send({
                message: "Usuário autorizado.",
                user: {
                    id: user.id,
                    username: user.name,
                    isAdmin
                },
                token
            });
            return
        } else {
            res.status(401).send({ message: "Senha incorreta" });
            console.log("User encontrado:", user);
            return
        }
    }

});
app.get("/admin-dashboard", authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401);
    }
    const user = req.user as MyJwtPayload;

    if (!user.isAdmin) return res.status(403).send("Acesso negado.");
    res.send("Bem-vindo ao painel admin!");
});
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
