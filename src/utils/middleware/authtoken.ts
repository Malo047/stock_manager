import jwt from "jsonwebtoken"
import { Request, Response } from "express";
export function authenticateToken(req: Request, res: Response, next: Function) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, "segredo_super_secreto", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}