import type {
    LoginInput,
    RegisterInput,
    User,
  } from "../types/api";
  import { apiRequest } from "./client";
  
  export function register(
    input: RegisterInput,
  ): Promise<User> {
    return apiRequest<User>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  }
  
  export function login(
    input: LoginInput,
  ): Promise<User> {
    return apiRequest<User>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  }
  
  export function logout(): Promise<void> {
    return apiRequest<void>(
      "/auth/logout",
      {
        method: "POST",
      },
    );
  }
  
  export function getCurrentUser(): Promise<User> {
    return apiRequest<User>("/auth/me");
  }