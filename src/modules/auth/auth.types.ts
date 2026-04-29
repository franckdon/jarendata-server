export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "COMPANY";
  isActive: boolean;
};