import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { wasm } = req.query

    const filePath = path.resolve('.', `wasm/${wasm}.wasm`)
    const wasmBuffer = fs.readFileSync(filePath)

    res.setHeader('Content-Type', 'application/wasm')
    res.send(wasmBuffer)
}