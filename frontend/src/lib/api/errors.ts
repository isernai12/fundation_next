/**
 * Standardized API Error Handling for Next.js Frontend
 */

export class ApiError extends Error {
  public status: number;
  public data?: any;
  public code?: string;

  constructor(message: string, status: number, data?: any, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Returns a user-friendly localized message based on HTTP status code
   */
  getUserMessage(locale: "bn" | "en" = "bn"): string {
    if (this.status === 401) {
      return locale === "bn"
        ? "আপনার সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।"
        : "Your session has expired. Please sign in again.";
    }
    if (this.status === 403) {
      return locale === "bn"
        ? "আপনার এই কাজটি করার প্রয়োজনীয় অনুমতি নেই।"
        : "You do not have permission to perform this action.";
    }
    if (this.status === 404) {
      return locale === "bn"
        ? "অনুরোধকৃত তথ্যটি পাওয়া যায়নি।"
        : "The requested resource was not found.";
    }
    if (this.status === 422 || this.status === 400) {
      return this.message || (locale === "bn" ? "প্রদত্ত তথ্যে ত্রুটি রয়েছে।" : "Invalid form data.");
    }
    if (this.status === 429) {
      return locale === "bn"
        ? "অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।"
        : "Too many requests. Please wait a moment and try again.";
    }
    return locale === "bn"
      ? "সার্ভারে একটি সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।"
      : "A server error occurred. Please try again later.";
  }
}
