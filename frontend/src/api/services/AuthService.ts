/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LoginRequest } from "../models/LoginRequest";
import type { RegisterRequest } from "../models/RegisterRequest"; // <-- Add this import
import type { LoginResponse } from "../models/LoginResponse";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class AuthService {
  // ...existing login method...

  /**
   * @param requestBody
   * @returns any Registration successful
   * @throws ApiError
   */
  public static register(
    requestBody: RegisterRequest // <-- Use RegisterRequest here
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/register",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        400: `Bad request`,
      },
    });
  }
    
  static async login(form: { email: string; password: string; role: string }) {
    // Replace with your actual API call logic
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      throw new Error("Login failed");
    }
    return response.json();
  }

}