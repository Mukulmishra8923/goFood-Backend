import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import connectDb from './db/Connectdb.js';
import route from './routes/Route.js';
import { join } from 'path';
import cors from 'cors'

const app = express();
const port = process.env.PORT ;
const DATABASE_URL = process.env.DATABASE_URL ;

// CORS POLICY UNBLOCK
app.use(cors())

//JSON
app.use(express.json())

// DATABASE CONNECTION
connectDb(DATABASE_URL);

//POST REQ MIDDLEWARE
app.use(express.urlencoded({extended:true}))

// LOAD ROUTERS
app.use('/',route)

// STATIC FILES
app.use(express.static(join(process.cwd(), "public")))


app.listen(port, ()=>{
    console.log(` server url is http://localhost:${port}`)
})