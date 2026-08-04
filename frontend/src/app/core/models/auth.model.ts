export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  REGISTRO = 'REGISTRO',
  DIRECTOR = 'DIRECTOR',
  DOCENTE = 'DOCENTE',
  ORIENTADOR = 'ORIENTADOR',
}

export interface AuthUser {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role: Role;
  centroId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
