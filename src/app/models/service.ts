export interface Service {
  id: string;
  name: string;
  parentId?: string; // Optional parent service ID, null for top-level services
  children?: Service[]; // Optional array of child services
  isSubService?: boolean; // Flag to indicate if this is a sub-service
}
