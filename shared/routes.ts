import { z } from 'zod';
import { insertUserSchema, users, scanHistory } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    }
  },
  scans: {
    analyze: {
      method: 'POST' as const,
      path: '/api/scans/analyze' as const,
      input: z.object({
        extractedText: z.string(),
        allergies: z.array(z.string()),
        language: z.string().default('en'),
        userId: z.number().optional()
      }),
      responses: {
        200: z.object({
          status: z.enum(["SAFE", "CAUTION", "NOT SAFE"]),
          matchedAllergen: z.string().nullable(),
          message: z.string()
        }),
        400: errorSchemas.validation,
      }
    },
    history: {
      method: 'GET' as const,
      path: '/api/users/:userId/scans' as const,
      responses: {
        200: z.array(z.custom<typeof scanHistory.$inferSelect>()),
      }
    }
  },
  chat: {
    message: {
      method: 'POST' as const,
      path: '/api/chat' as const,
      input: z.object({
        message: z.string()
      }),
      responses: {
        200: z.object({
          reply: z.string()
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      }
    }
  },
  upload: {
    document: {
      method: 'POST' as const,
      path: '/api/upload' as const,
      input: z.any(),
      responses: {
        200: z.object({
          url: z.string()
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
