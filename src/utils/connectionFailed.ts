import { Response  } from "express"

export function connectionFailed(res: Response) {
  return res.status(500).send({message:"Não foi possível conectar ao servidor."})
};