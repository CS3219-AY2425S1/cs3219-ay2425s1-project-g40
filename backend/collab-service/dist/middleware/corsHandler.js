"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsHandler = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    // Browsers usually send this before PUT or POST Requests
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
        res.status(200).json({});
        return;
    }
    // Continue Route Processing
    next();
};
exports.default = corsHandler;
