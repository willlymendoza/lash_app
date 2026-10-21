import { z } from "zod";

export const updateLashistProfileSchema = z
  .object({
    defaultCommissionType: z.enum(["percent", "fixed"], {
      message: "The commission type is required.",
    }),
    defaultCommissionValue: z
      .string({
        message: "The commission value is required.",
      })
      .refine((val) => val.trim() !== "", "The commission value is required.")
      .refine(
        (val) => !isNaN(Number(val)),
        "The commission value must be a valid number.",
      )
      .refine((val) => {
        const decimals = val.includes(".") ? val.split(".")[1].length : 0;
        return decimals <= 2;
      }, "The commission value cannot have more than 2 decimal places.")
      .transform((val) => Number(val))
      .refine((val) => val >= 0, "The commission value cannot be negative."),
    color: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^#[0-9A-Fa-f]{6}$/.test(val),
        "The color must be a valid hexadecimal code (e.g. #FF0000).",
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.defaultCommissionType === "percent" &&
      data.defaultCommissionValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The commission percentage cannot exceed 100%.",
        path: ["defaultCommissionValue"],
      });
    }
  });

export type UpdateLashistProfileInput = z.infer<
  typeof updateLashistProfileSchema
>;
