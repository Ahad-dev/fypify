import { httpGet } from "../api/https";
import { ApiResponse, User } from "../types/api.types";

export const userService = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return httpGet<ApiResponse<User>>("/users/me");
  },
};
