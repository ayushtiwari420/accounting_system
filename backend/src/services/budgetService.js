import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createAnalyticAccount = async (data) => {
  return await prisma.analytic_accounts.create({
    data: {
      name: data.name,
      type: data.type,
    },
  });
};

export const getAnalyticAccounts = async () => {
  return await prisma.analytic_accounts.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const createBudget = async (data, userId) => {
  const analyticAccount = await prisma.analytic_accounts.findUnique({
    where: { id: data.analytic_account_id },
  });

  if (!analyticAccount) {
    throw new ApiError(404, "Analytic account not found");
  }

  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);

  if (endDate < startDate) {
    throw new ApiError(400, "End date must be on or after start date");
  }

  return await prisma.budgets.create({
    data: {
      name: data.name,
      analytic_account_id: data.analytic_account_id,
      responsible_user_id: data.responsible_user_id || userId || null,
      start_date: startDate,
      end_date: endDate,
      planned_amount: data.planned_amount,
    },
    include: {
      analytic_accounts: true,
      users: true,
    },
  });
};

export const getBudgets = async () => {
  const budgets = await prisma.budgets.findMany({
    include: {
      analytic_accounts: true,
      users: true,
    },
    orderBy: {
      start_date: "desc",
    },
  });

  // Calculate actual amount for each budget
  const results = [];
  for (const budget of budgets) {
    const lines = await prisma.journal_entry_lines.findMany({
      where: {
        analytic_account_id: budget.analytic_account_id,
        journal_entries: {
          status: "POSTED",
          entry_date: {
            gte: budget.start_date,
            lte: budget.end_date,
          },
        },
      },
    });

    let actualAmount = 0;
    for (const line of lines) {
      if (budget.analytic_accounts.type === "EXPENSE") {
        actualAmount += Number(line.debit) - Number(line.credit);
      } else {
        actualAmount += Number(line.credit) - Number(line.debit);
      }
    }

    const planned = Number(budget.planned_amount);
    const remaining = planned - actualAmount;
    const achievementRate =
      planned > 0 ? Number(((actualAmount / planned) * 100).toFixed(2)) : 0;

    results.push({
      ...budget,
      planned_amount: planned,
      actual_amount: actualAmount,
      remaining_amount: remaining,
      achievement_rate: achievementRate,
    });
  }

  return results;
};

export const getBudgetById = async (id) => {
  const budget = await prisma.budgets.findUnique({
    where: { id },
    include: {
      analytic_accounts: true,
      users: true,
    },
  });

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  const lines = await prisma.journal_entry_lines.findMany({
    where: {
      analytic_account_id: budget.analytic_account_id,
      journal_entries: {
        status: "POSTED",
        entry_date: {
          gte: budget.start_date,
          lte: budget.end_date,
        },
      },
    },
    include: {
      journal_entries: true,
      accounts: true,
    },
  });

  let actualAmount = 0;
  for (const line of lines) {
    if (budget.analytic_accounts.type === "EXPENSE") {
      actualAmount += Number(line.debit) - Number(line.credit);
    } else {
      actualAmount += Number(line.credit) - Number(line.debit);
    }
  }

  const planned = Number(budget.planned_amount);

  return {
    ...budget,
    planned_amount: planned,
    actual_amount: actualAmount,
    remaining_amount: planned - actualAmount,
    achievement_rate:
      planned > 0 ? Number(((actualAmount / planned) * 100).toFixed(2)) : 0,
    journal_entry_lines: lines,
  };
};
