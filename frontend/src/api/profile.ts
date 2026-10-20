import type {
    User,
  } from "../types/api";
  import {
    apiRequest,
  } from "./client";
  
  interface UpdateProfileInput {
    display_name: string;
  }
  
  export function updateProfile(
    input: UpdateProfileInput,
  ): Promise<User> {
    return apiRequest<User>(
      "/profile",
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
  }
  
  export function uploadAvatar(
    file: File,
  ): Promise<User> {
    const formData = new FormData();
  
    formData.append(
      "file",
      file,
    );
  
    return apiRequest<User>(
      "/profile/avatar",
      {
        method: "POST",
        body: formData,
      },
    );
  }
  
  export function deleteAvatar():
    Promise<void> {
    return apiRequest<void>(
      "/profile/avatar",
      {
        method: "DELETE",
      },
    );
  }