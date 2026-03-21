/**
 * PM2 Ecosystem Configuration — The Living Logos
 * Atomic Command 09: Sovereign Infrastructure
 *
 * Usage: pm2 start ecosystem.config.cjs
 */
module.exports = {
    apps: [
        {
            name: "living-logos",
            script: "npm",
            args: "start",
            cwd: "/var/www/living-logos",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            error_file: "/var/www/living-logos/logs/error.log",
            out_file: "/var/www/living-logos/logs/output.log",
            merge_logs: true,
        },
    ],
};
