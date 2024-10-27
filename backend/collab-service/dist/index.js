"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = __importDefault(require("console"));
const dotenv_1 = __importDefault(require("dotenv"));
require("module-alias/register");
const ws_1 = __importDefault(require("./ws"));
dotenv_1.default.config();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8000;
ws_1.default.listen(PORT, () => {
    console_1.default.log(`✅ Collab-service running on port ${PORT}`);
});
const onCloseSignal = () => {
    console_1.default.log("💀 sigint received, shutting down");
    ws_1.default.close(() => {
        console_1.default.log("💀 server closed");
        process.exit();
    });
    setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};
process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
