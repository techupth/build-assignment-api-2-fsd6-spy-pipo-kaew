import pg from "pg";
const { Pool } = pg;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:25432521@localhost:5432/API",
});

export default connectionPool;
