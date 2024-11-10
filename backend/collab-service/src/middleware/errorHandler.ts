import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND);
  res.json({
    message: "Not found!"
  })
};

const serverErr: ErrorRequestHandler = (error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    }
  })
}

export default () => [unexpectedRequest, serverErr];