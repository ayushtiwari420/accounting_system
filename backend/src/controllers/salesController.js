import * as salesService from "../services/salesService.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse  from "../utils/response.js";


export const createSalesOrder = asyncHandler(
  async (req, res) => {

    const salesOrder =
      await salesService.createSalesOrder(
        req.body,
        req.user.id
      );

    return successResponse(
      res,
      salesOrder,
      201
    );
  }
);


export const getSalesOrders = asyncHandler(
  async (req, res) => {

    const salesOrders =
      await salesService.getSalesOrders();

    return successResponse(
      res,
      salesOrders
    );
  }
);


export const getSalesOrderById = asyncHandler(
  async (req, res) => {

    const salesOrder =
      await salesService.getSalesOrderById(
        req.params.id
      );

    return successResponse(
      res,
      salesOrder
    );
  }
);