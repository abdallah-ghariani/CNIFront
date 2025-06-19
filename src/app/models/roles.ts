export enum Role {
    admin = "admin",
    user = "user"    // Combined role replacing both consumer and provider
}

export const Roles = ["admin", "user"]

// Legacy role mapping for backward compatibility
export const mapLegacyRole = (role: string): Role => {
    if (role === 'admin') return Role.admin;
    // Map both 'consumer' and 'provider' to the new 'user' role
    if (role === 'consumer' || role === 'provider') return Role.user;
    return Role.user; // Default fallback
};
