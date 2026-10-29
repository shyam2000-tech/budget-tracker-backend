export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  currency?: string;
  timezone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    currency: string;
    timezone: string;
  };
  token: string;
}

