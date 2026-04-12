"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = parseInt(process.env.PORT || '5000');
async function bootstrap() {
    try {
        await database_1.default.$connect();
        console.log('Database connected');
        const server = app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        });
        const shutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await database_1.default.$disconnect();
                console.log('Server closed');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map