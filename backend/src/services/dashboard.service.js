import { supabase } from "../config/supabase.js";
import AppError from "../utils/AppError.js";

const SAVINGS_TABLE = "savings_goals";
const TRANSACTION_TABLE = "transactions";
const DEFAULT_RECENT_LIMIT = 5;

export const getDashboard = async (userId) => {
    const [savingsResult, transactionResult] = await Promise.all([
        supabase
            .from(SAVINGS_TABLE)
            .select("current_amount, target_amount")
            .eq("user_id", userId),
        supabase
            .from(TRANSACTION_TABLE)
            .select("type, amount")
            .eq("user_id", userId)
    ]);

    const { data: savingsGoals, error: savingsError } = savingsResult;
    const { data: transactions, error: txError } = transactionResult;

    if (savingsError) {
        throw new AppError(savingsError.message, 500);
    }

    if (txError) {
        throw new AppError(txError.message, 500);
    }

    const totalSavings = savingsGoals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
    const totalTarget = savingsGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
    const completionRate = totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0;
    const remainingTarget = Math.max(totalTarget - totalSavings, 0);

    const totalTransactions = transactions.length;
    const totalDeposit = transactions
        .filter((tx) => tx.type === "deposit")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalWithdrawal = transactions
        .filter((tx) => tx.type === "withdrawal")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
        total_savings: totalSavings,
        total_target: totalTarget,
        progress: completionRate,
        completion_rate: completionRate,
        remaining_target: remainingTarget,
        total_transactions: totalTransactions,
        total_deposit: totalDeposit,
        total_withdrawal: totalWithdrawal,
        num_savings_goals: savingsGoals.length,
    };
};

export const getStatistics = async (userId) => {
    const { data: transactions, error } = await supabase
        .from(TRANSACTION_TABLE)
        .select("created_at, type, amount")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new AppError(error.message, 500);
    }

    const monthlyStats = {};

    transactions.forEach((tx) => {
        const date = new Date(tx.created_at);
        const yearMonth = date.toISOString().slice(0, 7);

        if (!monthlyStats[yearMonth]) {
            monthlyStats[yearMonth] = {
                month: yearMonth,
                deposit: 0,
                withdrawal: 0,
            };
        }

        if (tx.type === "deposit") {
            monthlyStats[yearMonth].deposit += Number(tx.amount);
        } else if (tx.type === "withdrawal") {
            monthlyStats[yearMonth].withdrawal += Number(tx.amount);
        }
    });

    return {
        per_month: Object.values(monthlyStats),
    };
};

export const getRecentTransactions = async (userId, limit = DEFAULT_RECENT_LIMIT) => {
    const normalizedLimit = Math.max(Number(limit) || DEFAULT_RECENT_LIMIT, 1);

    const { data, error } = await supabase
        .from(TRANSACTION_TABLE)
        .select("id, type, amount, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(normalizedLimit);

    if (error) {
        throw new AppError(error.message, 500);
    }

    return {
        recent_transactions: data,
    };
};
