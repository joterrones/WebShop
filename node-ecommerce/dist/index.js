"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const app = (0, app_1.createApp)();
async function main() {
    await prisma_1.prisma.$connect();
    app.listen(env_1.env.PORT, () => {
        console.log(`Server running on http://localhost:${env_1.env.PORT}`);
        console.log(`API: http://localhost:${env_1.env.PORT}/api`);
    });
}
main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map