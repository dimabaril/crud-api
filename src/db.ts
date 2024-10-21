import { v4 as uuidv4 } from "uuid";

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

const users: User[] = [];

export const dbGetAllUsers = (): User[] => users;

export const dbGetUser = (id: string): User | undefined =>
  users.find((user) => user.id === id);

export const dbAddUser = (
  username: string,
  age: number,
  hobbies: string[],
): User => {
  const newUser: User = { id: uuidv4(), username, age, hobbies };
  users.push(newUser);
  return newUser;
};

export const dbUpdateUser = (
  id: string,
  username: string,
  age: number,
  hobbies: string[],
): User | undefined => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    users[userIndex] = { id, username, age, hobbies };
    return users[userIndex];
  }
  return undefined;
};

export const dbDeleteUser = (id: string): boolean => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    return true;
  }
  return false;
};
