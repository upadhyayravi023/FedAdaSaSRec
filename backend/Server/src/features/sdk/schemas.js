import { z } from 'zod';

export const UploadGradientsSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
    clickCount: z.number().int().nonnegative('Click count must be a non-negative integer'),
  }),
});

export const TelemetrySchema = z.object({
  body: z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
    recommendationsServed: z.number().int().nonnegative('Must be a non-negative integer'),
  }),
});

