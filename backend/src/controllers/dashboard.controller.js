import { success } from "../utils/response.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
    const dashboard = await dashboardService.getDashboard(req.user.id);

    return success(
        res,
        "Dashboard berhasil diambil.",
        { dashboard }
    );
};

export const getStatistics = async (req, res) => {
    const statistics = await dashboardService.getStatistics(req.user.id);

    return success(
        res,
        "Statistik berhasil diambil.",
        statistics
    );
};

export const getRecentTransactions = async (req, res) => {
    const recentTransactions = await dashboardService.getRecentTransactions(
        req.user.id,
        req.query?.limit
    );

    return success(
        res,
        "Riwayat transaksi terbaru berhasil diambil.",
        recentTransactions
    );
};
