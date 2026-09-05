import prisma from "../config/prisma.js";

export const getProfitAndLoss = async (startDate, endDate) => {
  const whereClause = {
    journal_entries: {
      status: "POSTED",
    },
  };

  if (startDate || endDate) {
    whereClause.journal_entries.entry_date = {};
    if (startDate) whereClause.journal_entries.entry_date.gte = new Date(startDate);
    if (endDate) whereClause.journal_entries.entry_date.lte = new Date(endDate);
  }

  const lines = await prisma.journal_entry_lines.findMany({
    where: whereClause,
    include: {
      accounts: true,
    },
  });

  const incomeAccountsMap = {};
  const expenseAccountsMap = {};

  for (const line of lines) {
    const acc = line.accounts;
    const type = acc.type.toUpperCase();
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);

    if (type === "INCOME") {
      if (!incomeAccountsMap[acc.id]) {
        incomeAccountsMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      incomeAccountsMap[acc.id].amount += credit - debit;
    } else if (type === "EXPENSE") {
      if (!expenseAccountsMap[acc.id]) {
        expenseAccountsMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      expenseAccountsMap[acc.id].amount += debit - credit;
    }
  }

  const incomeBreakdown = Object.values(incomeAccountsMap);
  const expenseBreakdown = Object.values(expenseAccountsMap);

  const totalIncome = incomeBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalExpense = expenseBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const netProfit = totalIncome - totalExpense;

  return {
    period: {
      start_date: startDate || "All Time",
      end_date: endDate || "All Time",
    },
    income_breakdown: incomeBreakdown,
    total_income: totalIncome,
    expense_breakdown: expenseBreakdown,
    total_expense: totalExpense,
    net_profit: netProfit,
  };
};

export const getBalanceSheet = async (asOfDate) => {
  const whereClause = {
    journal_entries: {
      status: "POSTED",
    },
  };

  if (asOfDate) {
    whereClause.journal_entries.entry_date = {
      lte: new Date(asOfDate),
    };
  }

  const lines = await prisma.journal_entry_lines.findMany({
    where: whereClause,
    include: {
      accounts: true,
    },
  });

  const assetMap = {};
  const liabilityMap = {};
  const capitalMap = {};

  let totalIncomeInception = 0;
  let totalExpenseInception = 0;

  for (const line of lines) {
    const acc = line.accounts;
    const type = acc.type.toUpperCase();
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);

    if (type === "ASSET") {
      if (!assetMap[acc.id]) {
        assetMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      assetMap[acc.id].amount += debit - credit;
    } else if (type === "LIABILITY") {
      if (!liabilityMap[acc.id]) {
        liabilityMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      liabilityMap[acc.id].amount += credit - debit;
    } else if (type === "CAPITAL" || type === "EQUITY") {
      if (!capitalMap[acc.id]) {
        capitalMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      capitalMap[acc.id].amount += credit - debit;
    } else if (type === "INCOME") {
      totalIncomeInception += credit - debit;
    } else if (type === "EXPENSE") {
      totalExpenseInception += debit - credit;
    }
  }

  const assetsBreakdown = Object.values(assetMap);
  const liabilitiesBreakdown = Object.values(liabilityMap);
  const capitalBreakdown = Object.values(capitalMap);

  const totalAssets = assetsBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalLiabilities = liabilitiesBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalCapital = capitalBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const netProfitInception = totalIncomeInception - totalExpenseInception;
  const totalEquity = totalCapital + netProfitInception;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return {
    as_of_date: asOfDate || new Date().toISOString().split("T")[0],
    assets: {
      breakdown: assetsBreakdown,
      total_assets: totalAssets,
    },
    liabilities: {
      breakdown: liabilitiesBreakdown,
      total_liabilities: totalLiabilities,
    },
    equity: {
      capital_breakdown: capitalBreakdown,
      total_capital: totalCapital,
      retained_earnings_net_profit: netProfitInception,
      total_equity: totalEquity,
    },
    total_liabilities_and_equity: totalLiabilitiesAndEquity,
    is_balanced: isBalanced,
  };
};

export const getBudgetPerformanceReport = async () => {
  const budgets = await prisma.budgets.findMany({
    include: {
      analytic_accounts: true,
      users: true,
    },
    orderBy: {
      start_date: "desc",
    },
  });

  const report = [];
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
    const variance = planned - actualAmount;
    const utilizationPercentage =
      planned > 0 ? Number(((actualAmount / planned) * 100).toFixed(2)) : 0;

    report.push({
      budget_id: budget.id,
      budget_name: budget.name,
      analytic_account: budget.analytic_accounts.name,
      analytic_type: budget.analytic_accounts.type,
      responsible_user: budget.users ? budget.users.name : null,
      period: {
        start_date: budget.start_date,
        end_date: budget.end_date,
      },
      planned_amount: planned,
      actual_amount: actualAmount,
      variance,
      utilization_percentage: utilizationPercentage,
      status: actualAmount > planned ? "OVER_BUDGET" : "WITHIN_BUDGET",
    });
  }

  return report;
};
