import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {Pool}=pg;   //manages a collection of database collections
const pool=new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
})

export default pool;