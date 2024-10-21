import http from "http";
import { parse } from "url";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./handlers";

const server = http.createServer((req, res) => {
  const url = parse(req.url!, true);
  const method = req.method;
  const path = url.pathname;

  if (path === "/api/users" && method === "GET") {
    getUsers(req, res);
  } else if (path?.startsWith("/api/users/") && method === "GET") {
    const userId = path.split("/")[3];
    getUserById(req, res, userId);
  } else if (path === "/api/users" && method === "POST") {
    createUser(req, res);
  } else if (path?.startsWith("/api/users/") && method === "PUT") {
    const userId = path.split("/")[3];
    updateUser(req, res, userId);
  } else if (path?.startsWith("/api/users/") && method === "DELETE") {
    const userId = path.split("/")[3];
    deleteUser(req, res, userId);
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
