module.exports = {
    apps: [{
        name: 'petnest-backend',
        script: 'server.ts',
        interpreter: 'node',
        interpreter_args: '--require dotenv/config --import tsx',
        instances: 4, // 4 instances (adjust based on CPU cores - use 'max' for all cores)
        exec_mode: 'cluster', // Enable clustering for load distribution
        watch: false,
        max_memory_restart: '500M', // Restart if memory exceeds 500MB
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',

        // Performance monitoring
        instance_var: 'INSTANCE_ID',

        // Graceful shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 3000,
    }]
};
