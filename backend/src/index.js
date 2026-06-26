// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import savingsRoutes from "./routes/savings.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { sharedSavingsRouter, sharedTransactionRouter } from "./routes/sharedSavings.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
    "/api/savings",
    savingsRoutes
);

app.use(
    "/api/transactions",
    transactionRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/shared-savings",
    sharedSavingsRouter
);

app.use(
    "/api/shared-transactions",
    sharedTransactionRouter
);

import errorHandler from "./middlewares/errorHandler.js";
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
