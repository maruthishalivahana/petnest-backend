const express = require('express')
const app = express()

const port = 5000
const server = (): void => {
    app.listen(port, () => {
        console.log(`server runing on port${port}`)
    })
}
server();
