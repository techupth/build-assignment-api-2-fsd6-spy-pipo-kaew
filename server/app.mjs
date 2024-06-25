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
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not read assignments because of database connection error",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  try {
    const result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `Server could not find a requested assignment (assignment id: ${assignmentIdFromClient})`,
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not read assignment because of database connection error",
    });
  }
});

app.post("/assignments", async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }

  const newAssignment = {
    title,
    content,
    category,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  try {
    await connectionPool.query(
      `INSERT INTO assignments (title, content, category, created_at, updated_at, published_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not create assignment because of database connection error",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      message:
        "Server could not update assignment because there are missing data from client",
    });
  }

  try {
    const result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }

    await connectionPool.query(
      `UPDATE assignments SET title = $1, content = $2, category = $3, updated_at = $4 WHERE assignment_id = $5`,
      [title, content, category, new Date(), assignmentId]
    );

    return res.status(200).json({
      message: "Updated assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not update assignment because of database connection error",
    });
  }
});

//------------------------------ลบทุกอย่าง-------------------------------//
app.delete("/assignments/delete", async (req, res) => {
  try {
    await connectionPool.query(`DELETE FROM assignments`);

    return res.status(200).json({
      message: "Deleted all assignments successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not delete assignments because of database connection error",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;

  try {
    const result = await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id = $1`,
      [assignmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    return res.status(200).json({
      message: "Deleted assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Server could not delete assignment because of database connection error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
