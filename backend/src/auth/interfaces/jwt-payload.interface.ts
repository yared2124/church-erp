export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
}
