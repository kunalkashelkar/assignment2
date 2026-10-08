import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().length(3).default("USD"),
  description: z.string().max(255).optional(),
  organizationId: z.string().uuid("Valid organization ID required").optional(), // Optional if user has default organization
});

export const UpdateTransactionSchema = z.object({
  description: z.string().max(255).optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
