import { httpGet } from "@/shared/api/https";
import { ApiResponse, User } from "@/shared/types/api.types";

export const userService = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return httpGet<ApiResponse<User>>("/users/me");
  },
};
