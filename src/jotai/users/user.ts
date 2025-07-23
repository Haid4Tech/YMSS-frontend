/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import {
  UserManagement,
  UserResponse,
  CreateUserProps,
  UpdateUserProps,
  UserFilters,
} from "./user-types";
import { extractErrorMessage } from "@/utils/helpers";
import { Role } from "@/common/enum";

/*
  |--------------------------------------------------------------------------
  | USER MANAGEMENT - JOTAI STORE
  |--------------------------------------------------------------------------
  | Managing user data with full CRUD operations
  |
*/

// Core state atoms
export const userListAtom = atom<UserManagement[]>([]);
export const userErrorAtom = atom<string | null>(null);
export const selectedUserAtom = atom<UserManagement | null>(null);

// Operation loading states
export const userLoadingAtom = atom<boolean>(false);
export const userCreateLoadingAtom = atom<boolean>(false);
export const userUpdateLoadingAtom = atom<boolean>(false);
export const userDeleteLoadingAtom = atom<boolean>(false);

// Form atoms
export const createUserFormAtom = atom<CreateUserProps>({
  email: "",
  password: "",
  name: "",
  role: Role.STUDENT,
});
export const updateUserFormAtom = atom<UpdateUserProps>({});
export const userFiltersAtom = atom<UserFilters>({});

/*
  |--------------------------------------------------------------------------
  | USER MANAGEMENT API
  |--------------------------------------------------------------------------
*/

export const usersAPI = {
  // Get all users (Admin only)
  getAll: atom(null, async (_get, set, filters?: UserFilters) => {
    set(userLoadingAtom, true);
    set(userErrorAtom, null);

    try {
      let url = "/users";
      const params = new URLSearchParams();

      if (filters?.role) params.append("role", filters.role);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      if (params.toString()) url += `?${params.toString()}`;

      const response = await axiosInstance.get<UserManagement[]>(url);
      set(userListAtom, response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set(userErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(userLoadingAtom, false);
    }
  }),

  // Get user by ID
  getById: atom(null, async (_get, set, id: number) => {
    set(userLoadingAtom, true);
    set(userErrorAtom, null);

    try {
      const response = await axiosInstance.get<UserResponse>(`/users/${id}`);
      const userData = response.data.user || response.data;
      set(selectedUserAtom, userData as UserManagement);
      return userData;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set(userErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(userLoadingAtom, false);
    }
  }),

  // Create user (Admin only)
  create: atom(null, async (get, set, userData?: CreateUserProps) => {
    set(userCreateLoadingAtom, true);
    set(userErrorAtom, null);

    try {
      const formData = userData || get(createUserFormAtom);
      const response = await axiosInstance.post<UserResponse>(
        "/users",
        formData
      );

      // Add new user to the list
      const currentUsers = get(userListAtom);
      const newUser = response.data.user || response.data;
      set(userListAtom, [...currentUsers, newUser as UserManagement]);

      // Reset form
      set(createUserFormAtom, {
        email: "",
        password: "",
        name: "",
        role: "STUDENT" as Role,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set(userErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(userCreateLoadingAtom, false);
    }
  }),

  // Update user (Admin only)
  update: atom(
    null,
    async (get, set, id: number, userData?: UpdateUserProps) => {
      set(userUpdateLoadingAtom, true);
      set(userErrorAtom, null);

      try {
        const updateData = userData || get(updateUserFormAtom);
        const response = await axiosInstance.put<UserResponse>(
          `/users/${id}`,
          updateData
        );

        // Update user in the list
        const currentUsers = get(userListAtom);
        const updatedUser = response.data.user || response.data;
        const updatedUsers = currentUsers.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user
        );
        set(userListAtom, updatedUsers);

        // Update selected user if it's the one being updated
        const selectedUser = get(selectedUserAtom);
        if (selectedUser?.id === id) {
          set(selectedUserAtom, {
            ...selectedUser,
            ...updatedUser,
          } as UserManagement);
        }

        return response.data;
      } catch (error: any) {
        const errorMessage = extractErrorMessage(error);
        set(userErrorAtom, errorMessage);
        throw new Error(errorMessage);
      } finally {
        set(userUpdateLoadingAtom, false);
      }
    }
  ),

  // Delete user
  delete: atom(null, async (get, set, id: number) => {
    set(userDeleteLoadingAtom, true);
    set(userErrorAtom, null);

    try {
      await axiosInstance.delete(`/users/${id}`);

      // Remove user from the list
      const currentUsers = get(userListAtom);
      const filteredUsers = currentUsers.filter((user) => user.id !== id);
      set(userListAtom, filteredUsers);

      // Clear selected user if it's the one being deleted
      const selectedUser = get(selectedUserAtom);
      if (selectedUser?.id === id) {
        set(selectedUserAtom, null);
      }

      return { message: "User deleted successfully" };
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set(userErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(userDeleteLoadingAtom, false);
    }
  }),
};

/*
  |--------------------------------------------------------------------------
  | ENHANCED USER API - For direct usage without atoms
  |--------------------------------------------------------------------------
*/

export const enhancedUsersAPI = {
  async getAll(filters?: UserFilters): Promise<UserManagement[]> {
    let url = "/users";
    const params = new URLSearchParams();

    if (filters?.role) params.append("role", filters.role);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    if (params.toString()) url += `?${params.toString()}`;

    const response = await axiosInstance.get<UserManagement[]>(url);
    return response.data;
  },

  async getById(id: number): Promise<UserManagement> {
    const response = await axiosInstance.get<UserResponse>(`/users/${id}`);
    return (response.data.user || response.data) as UserManagement;
  },

  async create(userData: CreateUserProps): Promise<UserResponse> {
    const response = await axiosInstance.post<UserResponse>("/users", userData);
    return response.data;
  },

  async update(id: number, userData: UpdateUserProps): Promise<UserResponse> {
    const response = await axiosInstance.put<UserResponse>(
      `/users/${id}`,
      userData
    );
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },
};

/*
  |--------------------------------------------------------------------------
  | UTILITY ATOMS
  |--------------------------------------------------------------------------
*/

// Filter users by role
export const usersByRoleAtom = atom((get) => {
  const users = get(userListAtom);
  const filters = get(userFiltersAtom);

  if (!filters.role) return users;

  return users.filter((user) => user.role === filters.role);
});

// Search users
export const filteredUsersAtom = atom((get) => {
  const users = get(userListAtom);
  const filters = get(userFiltersAtom);

  let filteredUsers = users;

  if (filters.role) {
    filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.isActive !== undefined) {
    filteredUsers = filteredUsers.filter(
      (user) => user.isActive === filters.isActive
    );
  }

  return filteredUsers;
});

// User count by role
export const userCountByRoleAtom = atom((get) => {
  const users = get(userListAtom);

  return users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
});
