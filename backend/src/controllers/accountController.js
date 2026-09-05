import {
  createAccountService,
  getAccountsService,
  getAccountByIdService,
  updateAccountService,
  deleteAccountService,
} from "../services/accountService.js";

export const createAccount = async (req, res, next) => {
  try {
    const account = await createAccountService(req.body);

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await getAccountsService();

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountById = async (req, res, next) => {
  try {
    const account = await getAccountByIdService(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const account = await updateAccountService(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const account = await deleteAccountService(req.params.id);

    res.json({
      success: true,
      message: "Account deactivated successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};