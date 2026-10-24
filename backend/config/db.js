import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {Pool}=pg;   //manages a collection of database collections

// TIMESTAMP columns have no timezone and Neon stores them in UTC.
// By default pg reads them as local server time, which shifts them (e.g. by 5:30 in IST),
// so tell pg they are UTC.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => new Date(value.replace(' ', 'T') + 'Z'));
const pool=new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
})

export default pool;