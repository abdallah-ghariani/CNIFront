import { Role } from "./roles";

export interface User {
  id: string;
  role: Role;
  username: string;
}

export interface JwtToken {
  sub: string,
  role: Role
}
