const successResponse = (res, data = null, statusCode = 200, message = "Success") => {
  let code = statusCode;
  let msg = message;

  if (typeof statusCode === "string") {
    msg = statusCode;
    code = 200;
  }

  return res.status(code).json({
    success: true,
    message: msg,
    data,
  });
};

export default successResponse;