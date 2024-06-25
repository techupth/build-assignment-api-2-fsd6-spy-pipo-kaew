import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
  };
  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
    return res
      .status(400)
      .json({ message: "Server could not create a requested assignment" });
  }
  try {
    await connectionPool.query(
      "insert into assignments (title, content, category, length, user_id, status, published_at) values ($1, $2, $3, $4, $5, $6, $7)",
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.user_id,
        newAssignment.status,
        newAssignment.published_at,
      ]
    );
    return res.status(201).json({ message: "Created assignment sucessfully" });
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.get("/assignments", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query("select * from assignments");
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({ data: results.rows });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      "select * from assignments where assignment_id = $1",
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  if (!result.rows[0]) {
    return res
      .status(404)
      .json({ message: "Server could not find a requested assignment" });
  }
  return res.status(200).json({ data: result.rows[0] });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updateAssignment = { ...req.body, updated_at: new Date() };
  try {
    const result = await connectionPool.query(
      "select * from assignments where assignment_id = $1",
      [assignmentIdFromClient]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }

    await connectionPool.query(
      "update assignments set title = $2, content = $3, category = $4, length = $5, user_id = $6, status = $7,updated_at = $8, published_at = $9 where assignment_id = $1",
      [
        assignmentIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
        updateAssignment.length,
        updateAssignment.user_id,
        updateAssignment.status,
        updateAssignment.updated_at,
        updateAssignment.published_at,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }

  return res.status(200).json({ message: "Updated assignment sucessfully" });
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    const result = await connectionPool.query(
      "select * from assignments where assignment_id = $1",
      [assignmentIdFromClient]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
    await connectionPool.query(
      "delete from assignments where assignment_id = $1",
      [assignmentIdFromClient]
    );
    return res.status(200).json({ message: "Deleted assignment sucessfully" });
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
