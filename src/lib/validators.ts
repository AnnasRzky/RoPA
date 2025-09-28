import { z } from "zod";

export const createChatSessionSchema = z.object({
  title: z.string().optional(),
});

export const uploadFileSchema = z.object({
  sessionId: z.string().uuid(),
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileType: z.string(),
});

export const recordSchema = z.object({
  chatSessionId: z.string().uuid(),
  sourceFileId: z.string().uuid(),
  fileName: z.string(),
  resultFileUrl: z.string().url().optional(),
  data: z.any(),
});
