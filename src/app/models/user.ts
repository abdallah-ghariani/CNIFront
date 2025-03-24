import { Role } from "./roles";

export interface User {
  id: string;
  role: Role;
  username: string;
}
