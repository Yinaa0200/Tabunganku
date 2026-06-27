import { z } from "zod";

export const dashboardQuerySchema = z.object({}).strict();

export const monthlySummaryQuerySchema = z.object({
    month: z
        .string()
        .trim()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan harus YYYY-MM"),
    savings_id: z
        .string()
        .uuid("savings_id harus berupa UUID")
        .optional(),
}).strict();
