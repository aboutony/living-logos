/**
 * PM2 Ecosystem Configuration — The Living Logos
 * Atomic Command 12.2: Direct Audio Pipe
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
            restart_delay: 1000,      // 1-second restart on crash
            max_restarts: 50,         // Generous restart budget
            min_uptime: 5000,         // Must stay up 5s to count as "started"
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            error_file: "/var/www/living-logos/logs/error.log",
            out_file: "/var/www/living-logos/logs/output.log",
            merge_logs: true,
        },
    ],
};

