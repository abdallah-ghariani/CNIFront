import { Role } from "./roles";

export interface User {
  id: string;
  role: Role;
  username: string;
  structure?: string;
  secteur?: string;
}

export interface JwtToken {
  sub: string,
  role: Role,
  structure?: string,  // Structure property to support filtering by user's structure
  secteur?: string,    // Sector property in French naming convention
  sector?: string,     // Alternative English naming for sector
  username?: string,   // Username for display purposes
  email?: string,       // Email as fallback identifier
  structureName?: string, // Name of the user's structure
  secteurName?: string,  // Name of the user's sector
  jti?: string,          // JWT Token ID
  iat?: number,          // Issued At timestamp
  exp?: number           // Expiration timestamp
}
