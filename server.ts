const express = require('express')
import type { Request, Response } from "express";
const app = express()
app.use(express.json());

const port = 5000

app.get("/user", (req: Request, res: Response) => {
    res.send("hello im the user")
})

interface Userbody {
    email: string,
    password: string,
    name: string,
}
app.post('/user', async (req: Request<{}, {}, Userbody>, res: Response) => {
    const { email, password, name } = req.body
    if (typeof password === 'number') {
        return res.status(400).send("password must be String")
    }

    const newuser = {
        email,
        password,
        name
    }
    console.log(newuser)
    return res.status(201).json({
        message: "user Created",
        newuser
    })


})

const server = () => {
    app.listen(port, () => {
        console.log(`server runing on port: ${port}`)
    })
}
server();
