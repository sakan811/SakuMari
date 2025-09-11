/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { vi, describe, it, expect } from "vitest";
import { NextResponse } from "next/server";

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      statusText: "OK",
      headers: new Headers(),
      url: "",
      redirected: false,
      type: "basic",
      body: null,
      bodyUsed: false,
      text: () => Promise.resolve(JSON.stringify(data)),
      clone: () => ({ ...data }),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })),
  },
}));

// Import the modules to test after mocking
import { ApiError, withErrorHandler, ApiErrors, TipsApiErrors } from "@/lib/api-errors";

describe("ApiError", () => {
  describe("constructor", () => {
    it("should properly set message, status, code, and name properties", () => {
      const message = "Test error message";
      const status = 400;
      const code = "TEST_ERROR";
      
      const error = new ApiError(message, status, code);
      
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
      expect(error.code).toBe(code);
      expect(error.name).toBe("ApiError");
    });

    it("should work without the optional code parameter", () => {
      const message = "Test error message";
      const status = 404;
      
      const error = new ApiError(message, status);
      
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe("ApiError");
    });
  });
});

describe("withErrorHandler", () => {
  it("should successfully wrap and execute a handler", async () => {
    const mockData = { success: true };
    const handler = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockData),
      status: 200,
    } as NextResponse);

    const wrappedHandler = withErrorHandler(handler);
    const result = await wrappedHandler();

    expect(handler).toHaveBeenCalled();
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(mockData);
  });

  it("should handle ApiError instances", async () => {
    const apiError = new ApiError("API error occurred", 400, "API_ERROR");
    const handler = vi.fn().mockRejectedValue(apiError);

    const wrappedHandler = withErrorHandler(handler);
    const result = await wrappedHandler();

    expect(result.status).toBe(400);
    const responseData = await result.json();
    expect(responseData.error).toBe("API error occurred");
    expect(responseData.code).toBe("API_ERROR");
  });

  it("should handle generic Error instances with 'Invalid JSON' message", async () => {
    const genericError = new Error("Invalid JSON in request body");
    const handler = vi.fn().mockRejectedValue(genericError);

    const wrappedHandler = withErrorHandler(handler);
    const result = await wrappedHandler();

    expect(result.status).toBe(400);
    const responseData = await result.json();
    expect(responseData.error).toBe("Invalid request format");
    expect(responseData.code).toBe("INVALID_JSON");
  });

  it("should handle generic Error instances with 'GEMINI_API_KEY' message", async () => {
    const genericError = new Error("Missing GEMINI_API_KEY environment variable");
    const handler = vi.fn().mockRejectedValue(genericError);

    const wrappedHandler = withErrorHandler(handler);
    const result = await wrappedHandler();

    expect(result.status).toBe(503);
    const responseData = await result.json();
    expect(responseData.error).toBe("AI service not configured. Please contact support.");
    expect(responseData.code).toBe("AI_SERVICE_UNAVAILABLE");
  });

  it("should handle fallback error for unhandled errors", async () => {
    const unknownError = "This is not an Error object";
    const handler = vi.fn().mockRejectedValue(unknownError);

    const wrappedHandler = withErrorHandler(handler);
    const result = await wrappedHandler();

    expect(result.status).toBe(500);
    const responseData = await result.json();
    expect(responseData.error).toBe("Internal server error");
    expect(responseData.code).toBe("INTERNAL_ERROR");
  });
});

describe("ApiErrors", () => {
  describe("unauthorized", () => {
    it("should return an unauthorized error response", () => {
      const response = ApiErrors.unauthorized();
      
      expect(response.status).toBe(401);
      expect(response.json()).resolves.toEqual({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("notFound", () => {
    it("should return a not found error response with a resource", () => {
      const resource = "User";
      const response = ApiErrors.notFound(resource);
      
      expect(response.status).toBe(404);
      expect(response.json()).resolves.toEqual({
        error: "User not found",
        code: "NOT_FOUND",
      });
    });

    it("should return a not found error response without a resource", () => {
      const response = ApiErrors.notFound();
      
      expect(response.status).toBe(404);
      expect(response.json()).resolves.toEqual({
        error: "Resource not found",
        code: "NOT_FOUND",
      });
    });
  });

  describe("serviceUnavailable", () => {
    it("should return a service unavailable error response with a custom message", () => {
      const customMessage = "Database maintenance in progress";
      const response = ApiErrors.serviceUnavailable(customMessage);
      
      expect(response.status).toBe(503);
      expect(response.json()).resolves.toEqual({
        error: "Database maintenance in progress",
        code: "SERVICE_UNAVAILABLE",
      });
    });

    it("should return a service unavailable error response with default message", () => {
      const response = ApiErrors.serviceUnavailable();
      
      expect(response.status).toBe(503);
      expect(response.json()).resolves.toEqual({
        error: "Service temporarily unavailable",
        code: "SERVICE_UNAVAILABLE",
      });
    });
  
    describe("badRequest", () => {
      it("should return a bad request error response with a custom message", () => {
        const message = "Invalid input data";
        const response = ApiErrors.badRequest(message);
        
        expect(response.status).toBe(400);
        expect(response.json()).resolves.toEqual({
          error: "Invalid input data",
          code: "BAD_REQUEST",
        });
      });
    });
  
    describe("internalError", () => {
      it("should return an internal error response with a custom message", () => {
        const message = "Database connection failed";
        const response = ApiErrors.internalError(message);
        
        expect(response.status).toBe(500);
        expect(response.json()).resolves.toEqual({
          error: "Database connection failed",
          code: "INTERNAL_ERROR",
        });
      });
  
      it("should return an internal error response with default message", () => {
        const response = ApiErrors.internalError();
        
        expect(response.status).toBe(500);
        expect(response.json()).resolves.toEqual({
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        });
      });
    });
  });
  
  describe("badRequest", () => {
    it("should return a bad request error response with a custom message", () => {
      const message = "Invalid input data";
      const response = ApiErrors.badRequest(message);
      
      expect(response.status).toBe(400);
      expect(response.json()).resolves.toEqual({
        error: "Invalid input data",
        code: "BAD_REQUEST",
      });
    });
  });

  describe("internalError", () => {
    it("should return an internal error response with a custom message", () => {
      const message = "Database connection failed";
      const response = ApiErrors.internalError(message);
      
      expect(response.status).toBe(500);
      expect(response.json()).resolves.toEqual({
        error: "Database connection failed",
        code: "INTERNAL_ERROR",
      });
    });

    it("should return an internal error response with default message", () => {
      const response = ApiErrors.internalError();
      
      expect(response.status).toBe(500);
      expect(response.json()).resolves.toEqual({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    });
  });
});

describe("TipsApiErrors", () => {
  describe("missingUserQuery", () => {
    it("should return a missing user query error response", () => {
      const response = TipsApiErrors.missingUserQuery();
      
      expect(response.status).toBe(400);
      expect(response.json()).resolves.toEqual({
        error: "Please provide a question about Japanese kana learning",
        code: "MISSING_USER_QUERY",
      });
    });
  });

  describe("queryTooLong", () => {
    it("should return a query too long error response", () => {
      const maxLength = 100;
      const response = TipsApiErrors.queryTooLong(maxLength);
      
      expect(response.status).toBe(400);
      expect(response.json()).resolves.toEqual({
        error: "Question too long. Please keep it under 100 characters.",
        code: "QUERY_TOO_LONG",
      });
    });
  });

  describe("generationFailed", () => {
    it("should return a generation failed error response", () => {
      const response = TipsApiErrors.generationFailed();
      
      expect(response.status).toBe(500);
      expect(response.json()).resolves.toEqual({
        error: "Unable to generate learning tips at this time. Please try again.",
        code: "GENERATION_FAILED",
      });
    });
  });

  describe("aiServiceNotConfigured", () => {
    it("should return an AI service not configured error response", () => {
      const response = TipsApiErrors.aiServiceNotConfigured();
      
      expect(response.status).toBe(503);
      expect(response.json()).resolves.toEqual({
        error: "AI service not configured. Please contact support.",
        code: "AI_SERVICE_NOT_CONFIGURED",
      });
    });
  });

  describe("generationError", () => {
    it("should return a generation error response", () => {
      const response = TipsApiErrors.generationError();
      
      expect(response.status).toBe(500);
      expect(response.json()).resolves.toEqual({
        error: "Unable to generate learning tips. Please try again later.",
        code: "GENERATION_ERROR",
      });
    });
  });
  // Tests from api-errors-uncovered.test.ts
  describe("GEMINI_API_KEY error handling", () => {
    it("handles generic Error instances with 'GEMINI_API_KEY' message", async () => {
      const genericError = new Error("Missing GEMINI_API_KEY environment variable");
      const handler = vi.fn().mockRejectedValue(genericError);

      const wrappedHandler = withErrorHandler(handler);
      const result = await wrappedHandler();

      expect(result.status).toBe(503);
      const responseData = await result.json();
      expect(responseData.error).toBe("AI service not configured. Please contact support.");
      expect(responseData.code).toBe("AI_SERVICE_UNAVAILABLE");
    });

    it("handles generic Error instances with 'GEMINI_API_KEY' in the middle of message", async () => {
      const genericError = new Error("Error: GEMINI_API_KEY is not set in environment");
      const handler = vi.fn().mockRejectedValue(genericError);

      const wrappedHandler = withErrorHandler(handler);
      const result = await wrappedHandler();

      expect(result.status).toBe(503);
      const responseData = await result.json();
      expect(responseData.error).toBe("AI service not configured. Please contact support.");
      expect(responseData.code).toBe("AI_SERVICE_UNAVAILABLE");
    });

    it("does not handle other error messages with 'gemini_api_key' (case sensitive)", async () => {
      const genericError = new Error("Missing gemini_api_key environment variable");
      const handler = vi.fn().mockRejectedValue(genericError);

      const wrappedHandler = withErrorHandler(handler);
      const result = await wrappedHandler();

      expect(result.status).toBe(500);
      const responseData = await result.json();
      expect(responseData.error).toBe("Internal server error");
      expect(responseData.code).toBe("INTERNAL_ERROR");
    });

    it("handles other errors normally when GEMINI_API_KEY is not in message", async () => {
      const genericError = new Error("Some other error");
      const handler = vi.fn().mockRejectedValue(genericError);

      const wrappedHandler = withErrorHandler(handler);
      const result = await wrappedHandler();

      expect(result.status).toBe(500);
      const responseData = await result.json();
      expect(responseData.error).toBe("Internal server error");
      expect(responseData.code).toBe("INTERNAL_ERROR");
    });
  });
});