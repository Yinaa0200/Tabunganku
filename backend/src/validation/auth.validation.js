import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nama minimal 2 karakter."),

    username: z
        .string()
        .trim()
        .min(3, "Username minimal 3 karakter.")
        .max(30, "Username maksimal 30 karakter.")
        .optional(),

    avatar: z
        .string()
        .trim()
        .min(1, "Avatar tidak boleh kosong.")
        .optional(),

    email: z
        .string()
        .trim()
        .email("Format email tidak valid."),

    password: z
        .string()
        .min(8, "Password minimal 8 karakter.")
});

export const loginSchema = z.object({

    email: z
        .string()
        .trim()
        .email("Format email tidak valid."),

    password: z
        .string()
        .min(1, "Password wajib diisi.")

});

export const refreshSchema = z.object({
    refresh_token: z
        .string()
        .min(1, "refresh_token wajib diisi.")
});