import { PrismaClient } from "@prisma/client";
import { Response } from "express";
const prisma = new PrismaClient();

export async function findProductById(id: number, res: Response) {
    const product = await prisma.product.findUnique({
        where: { id }
    });
    if(!product){
        res.status(404).send({message:"Produto não encontrado."});
        return
    }
    return product;
}