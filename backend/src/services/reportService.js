import prisma from "../config/prisma.js";

export const getProfitAndLoss = async (startDate, endDate, periodPreset = "all") => {
  let computedStartDate = startDate ? new Date(startDate) : null;
  let computedEndDate = endDate ? new Date(endDate) : null;

  const now = new Date();
  if (periodPreset === "1m") {
    computedStartDate = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);
    computedEndDate = now;
  } else if (periodPreset === "6m") {
    computedStartDate = new Date(now.valueOf() - 180 * 24 * 60 * 60 * 1000);
    computedEndDate = now;
  } else if (periodPreset === "1y") {
    computedStartDate = new Date(now.valueOf() - 365 * 24 * 60 * 60 * 1000);
    computedEndDate = now;
  }

  const whereClause = {
    journal_entries: {
      status: "POSTED",
    },
  };

  if (computedStartDate || computedEndDate) {
    whereClause.journal_entries.entry_date = {};
    if (computedStartDate) whereClause.journal_entries.entry_date.gte = computedStartDate;
    if (computedEndDate) whereClause.journal_entries.entry_date.lte = computedEndDate;
  }

  const lines = await prisma.journal_entry_lines.findMany({
    where: whereClause,
    include: {
      accounts: true,
      journal_entries: true,
    },
    orderBy: {
      journal_entries: {
        entry_date: "desc",
      },
    },
  });

  const incomeAccountsMap = {};
  const expenseAccountsMap = {};
  const transactionLogs = [];
  let cogsAmount = 0;

  for (const line of lines) {
    const acc = line.accounts;
    const type = acc.type.toUpperCase();
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);
    const je = line.journal_entries;

    if (type === "INCOME") {
      if (!incomeAccountsMap[acc.id]) {
        incomeAccountsMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      const net = credit - debit;
      incomeAccountsMap[acc.id].amount += net;

      transactionLogs.push({
        id: line.id,
        entry_date: je.entry_date,
        entry_number: je.entry_number,
        reference: je.reference || "N/A",
        source_type: je.source_type,
        account_code: acc.code,
        account_name: acc.name,
        account_type: "INCOME",
        debit,
        credit,
        net_amount: net,
        description: line.description || `Revenue transaction (${je.reference || je.entry_number})`,
      });
    } else if (type === "EXPENSE") {
      if (!expenseAccountsMap[acc.id]) {
        expenseAccountsMap[acc.id] = {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          amount: 0,
        };
      }
      const net = debit - credit;
      expenseAccountsMap[acc.id].amount += net;
      if (acc.code === "5000" || acc.name.toLowerCase().includes("purchase") || acc.name.toLowerCase().includes("cost")) {
        cogsAmount += net;
      }

      transactionLogs.push({
        id: line.id,
        entry_date: je.entry_date,
        entry_number: je.entry_number,
        reference: je.reference || "N/A",
        source_type: je.source_type,
        account_code: acc.code,
        account_name: acc.name,
        account_type: "EXPENSE",
        debit,
        credit,
        net_amount: net,
        description: line.description || `Expense transaction (${je.reference || je.entry_number})`,
      });
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
  const grossProfit = totalIncome - cogsAmount;

  const netProfitMarginPercent =
    totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(2)) : 0;
  const grossProfitMarginPercent =
    totalIncome > 0 ? Number(((grossProfit / totalIncome) * 100).toFixed(2)) : 0;

  const periodLabelMap = {
    "1m": "Last 1 Month (30 Days)",
    "6m": "Last 6 Months (180 Days)",
    "1y": "Last 1 Year (365 Days)",
    "all": "All Time Historical",
  };

  return {
    period: {
      preset: periodPreset,
      label: periodLabelMap[periodPreset] || "Custom Period",
      start_date: computedStartDate ? computedStartDate.toISOString().split("T")[0] : "All Time",
      end_date: computedEndDate ? computedEndDate.toISOString().split("T")[0] : "All Time",
    },
    metrics: {
      total_income: totalIncome,
      total_expense: totalExpense,
      cogs_amount: cogsAmount,
      gross_profit: grossProfit,
      net_profit: netProfit,
      gross_profit_margin_percent: grossProfitMarginPercent,
      net_profit_margin_percent: netProfitMarginPercent,
    },
    income_breakdown: incomeBreakdown,
    total_income: totalIncome,
    expense_breakdown: expenseBreakdown,
    total_expense: totalExpense,
    net_profit: netProfit,
    transaction_logs: transactionLogs,
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
