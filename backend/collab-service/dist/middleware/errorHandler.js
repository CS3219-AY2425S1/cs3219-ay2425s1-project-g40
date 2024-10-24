"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const unexpectedRequest = (_req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND);
    res.json({
        message: "Not found!"
    });
};
const serverErr = (error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
};
exports.default = () => [unexpectedRequest, serverErr];
