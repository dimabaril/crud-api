import { IncomingMessage, ServerResponse } from "http";
import {
  dbGetAllUsers,
  dbGetUser,
  dbAddUser,
  dbUpdateUser,
  dbDeleteUser,
} from "./db";
import { v4 as isUuid, V4Options } from "uuid";

export const getUsers = (req: IncomingMessage, res: ServerResponse) => {
  const users = dbGetAllUsers();
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(users));
};

export const getUserById = (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId as V4Options)) {
    res.statusCode = 400;
    res.end("Invalid UUID");
    return;
  }

  const user = dbGetUser(userId);
  if (user) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(user));
  } else {
    res.statusCode = 404;
    res.end("User not found");
  }
};

export const createUser = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const { username, age, hobbies } = JSON.parse(body);
    if (!username || !age || !hobbies) {
      res.statusCode = 400;
      res.end("Missing required fields");
      return;
    }

    const newUser = dbAddUser(username, age, hobbies);
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(newUser));
  });
};

export const updateUser = (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId as V4Options)) {
    res.statusCode = 400;
    res.end("Invalid UUID");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const { username, age, hobbies } = JSON.parse(body);
    if (!username || !age || !hobbies) {
      res.statusCode = 400;
      res.end("Missing required fields");
      return;
    }

    const updatedUser = dbUpdateUser(userId, username, age, hobbies);
    if (updatedUser) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updatedUser));
    } else {
      res.statusCode = 404;
      res.end("User not found");
    }
  });
};

export const deleteUser = (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId as V4Options)) {
    res.statusCode = 400;
    res.end("Invalid UUID");
    return;
  }

  const success = dbDeleteUser(userId);
  if (success) {
    res.statusCode = 204;
    res.end();
  } else {
    res.statusCode = 404;
    res.end("User not found");
  }
};
