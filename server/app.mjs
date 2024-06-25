import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;
app.use(express.json());
app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query(`SELECT * FROM assignments`);
    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentsId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentsId;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM assignments where assignment_id =$1`,
      [assignmentsIdFromClient]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }
    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentsId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentsId;
  const updateAssignment = { ...req.body };
  console.log(updateAssignment);
  try {
    const result = await connectionPool.query(
      `update assignments set title = $2,content = $3,category = $4 where assignment_id =$1`,
      [
        assignmentsIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
      ]
    );
    console.log(result);
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    return res.status(200).json({ message: "Updated assignment sucessfully" });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentsId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentsId;
  try {
    const result = await connectionPool.query(
      `delete from assignments where assignment_id =$1`,
      [assignmentsIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    return res.status(200).json({ message: "Deleted assignment sucessfully" });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
