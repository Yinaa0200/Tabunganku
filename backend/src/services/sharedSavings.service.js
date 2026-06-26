import crypto from "crypto";

import { supabase } from "../config/supabase.js";
import AppError from "../utils/AppError.js";

const SHARED_SAVINGS_TABLE = "shared_savings";
const SHARED_MEMBERS_TABLE = "shared_members";
const SHARED_TRANSACTIONS_TABLE = "shared_transactions";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const ALLOWED_SORT = Object.freeze(["asc", "desc"]);

const findSharedSavingsOrFail = async (sharedSavingsId) => {
    const { data, error } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .select("*")
        .eq("id", sharedSavingsId)
        .maybeSingle();

    if (error) {
        throw new AppError(error.message, 500);
    }

    if (!data) {
        throw new AppError("Tabungan bersama tidak ditemukan.", 404);
    }

    return data;
};

const findMemberOrFail = async (userId, sharedSavingsId) => {
    const { data, error } = await supabase
        .from(SHARED_MEMBERS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("shared_savings_id", sharedSavingsId)
        .maybeSingle();

    if (error) {
        throw new AppError(error.message, 500);
    }

    if (!data) {
        throw new AppError("Anda bukan anggota tabungan bersama ini.", 403);
    }

    return data;
};

const findTransactionOrFail = async (transactionId) => {
    const { data, error } = await supabase
        .from(SHARED_TRANSACTIONS_TABLE)
        .select("*")
        .eq("id", transactionId)
        .maybeSingle();

    if (error) {
        throw new AppError(error.message, 500);
    }

    if (!data) {
        throw new AppError("Transaksi tabungan bersama tidak ditemukan.", 404);
    }

    return data;
};

const generateInviteCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

const generateUniqueInviteCode = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const inviteCode = generateInviteCode();
        const { data, error } = await supabase
            .from(SHARED_SAVINGS_TABLE)
            .select("id")
            .eq("invite_code", inviteCode)
            .maybeSingle();

        if (error) {
            throw new AppError(error.message, 500);
        }

        if (!data) {
            return inviteCode;
        }
    }

    throw new AppError("Gagal menghasilkan kode undangan yang unik.", 500);
};

const applySharedTransaction = (currentAmount, type, amount) => {
    if (type === "deposit") {
        return currentAmount + amount;
    }

    return currentAmount - amount;
};

const rollbackSharedTransaction = (currentAmount, type, amount) => {
    if (type === "deposit") {
        return currentAmount - amount;
    }

    return currentAmount + amount;
};

const getMemberDisplayName = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", userId)
            .maybeSingle();

        if (!error && data?.name) {
            return data.name;
        }
    } catch {
        // Fallback to user id if profile lookup is unavailable.
    }

    return userId;
};

export const createSharedSavings = async (userId, payload) => {
    let sharedSavings = null;

    try {
        const inviteCode = await generateUniqueInviteCode();

        const { data, error: createError } = await supabase
            .from(SHARED_SAVINGS_TABLE)
            .insert([
                {
                    owner_id: userId,
                    name: payload.name,
                    description: payload.description ?? "",
                    target_amount: payload.target_amount,
                    current_amount: 0,
                    invite_code: inviteCode,
                    status: "active"
                }
            ])
            .select()
            .single();

        if (createError) {
            throw new AppError(createError.message, 400);
        }

        sharedSavings = data;

        const { data: member, error: memberError } = await supabase
            .from(SHARED_MEMBERS_TABLE)
            .insert([
                {
                    shared_savings_id: sharedSavings.id,
                    user_id: userId,
                    role: "owner"
                }
            ])
            .select()
            .single();

        if (memberError) {
            await supabase
                .from(SHARED_SAVINGS_TABLE)
                .delete()
                .eq("id", sharedSavings.id);

            throw new AppError(memberError.message, 400);
        }

        return {
            shared_savings: sharedSavings,
            member
        };
    } catch (error) {
        if (sharedSavings?.id) {
            await supabase
                .from(SHARED_SAVINGS_TABLE)
                .delete()
                .eq("id", sharedSavings.id);
        }

        throw error;
    }
};

export const getSharedSavings = async (userId, queryParams) => {
    const page = queryParams.page || 1;
    const limit = Math.min(Math.max(queryParams.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const sort = ALLOWED_SORT.includes(queryParams.sort) ? queryParams.sort : "desc";
    const search = queryParams.search?.trim();

    const { data: memberships, error: membershipError } = await supabase
        .from(SHARED_MEMBERS_TABLE)
        .select("shared_savings_id")
        .eq("user_id", userId);

    if (membershipError) {
        throw new AppError(membershipError.message, 500);
    }

    if (!memberships?.length) {
        return {
            shared_savings: [],
            pagination: {
                total: 0,
                page,
                limit,
                totalPages: 1
            }
        };
    }

    const savingsIds = memberships.map((item) => item.shared_savings_id);
    let query = supabase
        .from(SHARED_SAVINGS_TABLE)
        .select("*", { count: "exact" })
        .in("id", savingsIds);

    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query
        .order("created_at", { ascending: sort === "asc" })
        .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
        throw new AppError(error.message, 500);
    }

    return {
        shared_savings: data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.max(Math.ceil(count / limit), 1)
        }
    };
};

export const getSharedSavingsById = async (userId, sharedSavingsId) => {
    const sharedSavings = await findSharedSavingsOrFail(sharedSavingsId);
    await findMemberOrFail(userId, sharedSavings.id);

    return sharedSavings;
};

export const updateSharedSavings = async (userId, sharedSavingsId, payload) => {
    const sharedSavings = await findSharedSavingsOrFail(sharedSavingsId);
    const member = await findMemberOrFail(userId, sharedSavings.id);

    if (member.role !== "owner") {
        throw new AppError("Hanya owner yang dapat mengubah tabungan bersama.", 403);
    }

    const updatePayload = {};

    if (payload.name !== undefined) {
        updatePayload.name = payload.name;
    }

    if (payload.description !== undefined) {
        updatePayload.description = payload.description;
    }

    if (payload.target_amount !== undefined) {
        updatePayload.target_amount = payload.target_amount;
    }

    const { data, error } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .update(updatePayload)
        .eq("id", sharedSavings.id)
        .select()
        .single();

    if (error) {
        throw new AppError(error.message, 400);
    }

    return data;
};

export const deleteSharedSavings = async (userId, sharedSavingsId) => {
    const sharedSavings = await findSharedSavingsOrFail(sharedSavingsId);
    const member = await findMemberOrFail(userId, sharedSavings.id);

    if (member.role !== "owner") {
        throw new AppError("Hanya owner yang dapat menghapus tabungan bersama.", 403);
    }

    const { error: transactionDeleteError } = await supabase
        .from(SHARED_TRANSACTIONS_TABLE)
        .delete()
        .eq("shared_savings_id", sharedSavings.id);

    if (transactionDeleteError) {
        throw new AppError(transactionDeleteError.message, 500);
    }

    const { error: memberDeleteError } = await supabase
        .from(SHARED_MEMBERS_TABLE)
        .delete()
        .eq("shared_savings_id", sharedSavings.id);

    if (memberDeleteError) {
        throw new AppError(memberDeleteError.message, 500);
    }

    const { error: savingsDeleteError } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .delete()
        .eq("id", sharedSavings.id);

    if (savingsDeleteError) {
        throw new AppError(savingsDeleteError.message, 500);
    }

    return {
        deleted: true
    };
};

export const joinSharedSavings = async (userId, payload) => {
    const { data: sharedSavings, error: sharedSavingsError } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .select("*")
        .eq("invite_code", payload.invite_code)
        .maybeSingle();

    if (sharedSavingsError) {
        throw new AppError(sharedSavingsError.message, 500);
    }

    if (!sharedSavings) {
        throw new AppError("Kode undangan tidak valid.", 404);
    }

    const existingMember = await supabase
        .from(SHARED_MEMBERS_TABLE)
        .select("id")
        .eq("user_id", userId)
        .eq("shared_savings_id", sharedSavings.id)
        .maybeSingle();

    if (existingMember.error) {
        throw new AppError(existingMember.error.message, 500);
    }

    if (existingMember.data) {
        throw new AppError("Anda sudah bergabung ke tabungan bersama ini.", 400);
    }

    const { data: member, error: memberError } = await supabase
        .from(SHARED_MEMBERS_TABLE)
        .insert([
            {
                shared_savings_id: sharedSavings.id,
                user_id: userId,
                role: "member"
            }
        ])
        .select()
        .single();

    if (memberError) {
        throw new AppError(memberError.message, 400);
    }

    return {
        shared_savings: sharedSavings,
        member
    };
};

export const getSharedSavingsMembers = async (userId, sharedSavingsId) => {
    const sharedSavings = await findSharedSavingsOrFail(sharedSavingsId);
    await findMemberOrFail(userId, sharedSavings.id);

    const { data, error } = await supabase
        .from(SHARED_MEMBERS_TABLE)
        .select("id, user_id, role, joined_at")
        .eq("shared_savings_id", sharedSavings.id)
        .order("joined_at", { ascending: true });

    if (error) {
        throw new AppError(error.message, 500);
    }

    const members = await Promise.all(
        (data || []).map(async (member) => ({
            id: member.id,
            user_id: member.user_id,
            name: await getMemberDisplayName(member.user_id),
            role: member.role,
            joined_at: member.joined_at
        }))
    );

    return {
        members
    };
};

export const createSharedTransaction = async (userId, payload) => {
    const sharedSavings = await findSharedSavingsOrFail(payload.shared_savings_id);
    await findMemberOrFail(userId, sharedSavings.id);

    let currentAmount = sharedSavings.current_amount;

    if (payload.type === "withdrawal" && currentAmount < payload.amount) {
        throw new AppError("Saldo tabungan bersama tidak mencukupi.", 400);
    }

    currentAmount = applySharedTransaction(currentAmount, payload.type, payload.amount);

    const { error: updateError } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .update({ current_amount: currentAmount })
        .eq("id", sharedSavings.id);

    if (updateError) {
        throw new AppError(updateError.message, 400);
    }

    const { data, error } = await supabase
        .from(SHARED_TRANSACTIONS_TABLE)
        .insert([
            {
                shared_savings_id: sharedSavings.id,
                user_id: userId,
                type: payload.type,
                amount: payload.amount,
                description: payload.description ?? ""
            }
        ])
        .select()
        .single();

    if (error) {
        throw new AppError(error.message, 400);
    }

    return {
        shared_transaction: data,
        saldo_sekarang: currentAmount
    };
};

export const updateSharedTransaction = async (userId, transactionId, payload) => {
    const oldTransaction = await findTransactionOrFail(transactionId);
    const sharedSavings = await findSharedSavingsOrFail(oldTransaction.shared_savings_id);
    await findMemberOrFail(userId, sharedSavings.id);

    let currentAmount = sharedSavings.current_amount;

    currentAmount = rollbackSharedTransaction(currentAmount, oldTransaction.type, oldTransaction.amount);

    const newTransaction = {
        type: payload.type ?? oldTransaction.type,
        amount: payload.amount ?? oldTransaction.amount,
        description: payload.description ?? oldTransaction.description
    };

    if (newTransaction.type === "withdrawal" && currentAmount < newTransaction.amount) {
        throw new AppError("Saldo tabungan bersama tidak mencukupi.", 400);
    }

    currentAmount = applySharedTransaction(currentAmount, newTransaction.type, newTransaction.amount);

    const { error: updateSavingsError } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .update({ current_amount: currentAmount })
        .eq("id", sharedSavings.id);

    if (updateSavingsError) {
        throw new AppError(updateSavingsError.message, 400);
    }

    const { data, error } = await supabase
        .from(SHARED_TRANSACTIONS_TABLE)
        .update({
            type: newTransaction.type,
            amount: newTransaction.amount,
            description: newTransaction.description
        })
        .eq("id", transactionId)
        .select()
        .single();

    if (error) {
        throw new AppError(error.message, 400);
    }

    return {
        shared_transaction: data,
        saldo_sekarang: currentAmount
    };
};

export const deleteSharedTransaction = async (userId, transactionId) => {
    const transaction = await findTransactionOrFail(transactionId);
    const sharedSavings = await findSharedSavingsOrFail(transaction.shared_savings_id);
    await findMemberOrFail(userId, sharedSavings.id);

    let currentAmount = sharedSavings.current_amount;

    currentAmount = rollbackSharedTransaction(currentAmount, transaction.type, transaction.amount);

    const { error: updateSavingsError } = await supabase
        .from(SHARED_SAVINGS_TABLE)
        .update({ current_amount: currentAmount })
        .eq("id", sharedSavings.id);

    if (updateSavingsError) {
        throw new AppError(updateSavingsError.message, 400);
    }

    const { error } = await supabase
        .from(SHARED_TRANSACTIONS_TABLE)
        .delete()
        .eq("id", transaction.id);

    if (error) {
        throw new AppError(error.message, 400);
    }

    return {
        saldo_sekarang: currentAmount
    };
};

export const getSharedSavingsStatistics = async (userId, sharedSavingsId) => {
    const sharedSavings = await findSharedSavingsOrFail(sharedSavingsId);
    await findMemberOrFail(userId, sharedSavings.id);

    const [membersResult, transactionsResult] = await Promise.all([
        supabase
            .from(SHARED_MEMBERS_TABLE)
            .select("user_id, role")
            .eq("shared_savings_id", sharedSavings.id),
        supabase
            .from(SHARED_TRANSACTIONS_TABLE)
            .select("user_id, type, amount")
            .eq("shared_savings_id", sharedSavings.id)
    ]);

    const { data: members, error: membersError } = membersResult;
    const { data: transactions, error: transactionsError } = transactionsResult;

    if (membersError) {
        throw new AppError(membersError.message, 500);
    }

    if (transactionsError) {
        throw new AppError(transactionsError.message, 500);
    }

    const memberStats = await Promise.all(
        members.map(async (member) => ({
            user_id: member.user_id,
            name: await getMemberDisplayName(member.user_id),
            role: member.role,
            total_deposit: 0,
            total_withdrawal: 0
        }))
    );

    transactions.forEach((transaction) => {
        const member = memberStats.find((item) => item.user_id === transaction.user_id);

        if (!member) {
            return;
        }

        if (transaction.type === "deposit") {
            member.total_deposit += transaction.amount;
        } else if (transaction.type === "withdrawal") {
            member.total_withdrawal += transaction.amount;
        }
    });

    const progress = sharedSavings.target_amount > 0
        ? Math.round((sharedSavings.current_amount / sharedSavings.target_amount) * 100)
        : 0;

    return {
        target: sharedSavings.target_amount,
        current: sharedSavings.current_amount,
        progress,
        remaining: Math.max(sharedSavings.target_amount - sharedSavings.current_amount, 0),
        members: memberStats
    };
};
