# Docker Migration Guide

This guide will transition your SMS Gateway architecture from a Hybrid native setup (Bare-Metal + PM2) into a fully containerized Docker architecture.

## Step 1: Stop Native Services

Because Docker needs to bind to ports `8990`, `2775`, `1401`, and `3000`, you must first shut down anything currently running on the bare-metal server using those ports.

SSH into your Hostinger server (`root@76.13.211.177`) and run:

```bash
# 1. Stop the native Next.js PM2 process
pm2 stop sms-dashboard
pm2 delete sms-dashboard
pm2 save

# 2. Stop the native Jasmin core services
sudo systemctl stop jasmin
sudo systemctl disable jasmin

# 3. Stop native Redis and RabbitMQ if they are running natively
sudo systemctl stop redis redis-server
sudo systemctl stop rabbitmq-server
```

## Step 2: Clear Failed Docker Containers

You mentioned previously that there were Docker containers stuck in a "Restarting" loop in the Hostinger panel. Let's prune them to ensure a clean slate and avoid port conflicts.

```bash
docker rm -f $(docker ps -aq)
docker network prune -f
docker volume prune -f
```

_(Warning: `docker volume prune` will delete unused docker volumes. Since you were not using the docker version successfully yet, this is safe to wipe the corrupted state.)_

## Step 3: Launch the New Unified Stack

Navigate to your Next.js application directory on the Ubuntu server where the new `docker-compose.yml` resides.

```bash
cd /var/www/smsgateway-ui/webui
git pull origin main

# Build the Web UI image and start all containers in detached mode
docker compose up -d --build
```

You should see output indicating that Redis, RabbitMQ, Jasmin, and Web UI have been created simultaneously.

## Step 4: Verify Your New System

1. Run `docker ps` to ensure all 4 containers (`jasmin_core`, `jasmin_redis`, `jasmin_rabbitmq`, `smsgateway_webui`) show a status of `Up` and are not crashing.
2. Visit `http://76.13.211.177` in your browser.
3. Log in with `admin` / `admin_password_123`.
4. Go to the Settings page and test the Interactive JCLI Console (e.g., type `user -l`).

If it replies instantly, you successfully completed the Docker networking bridge between your UI container and your Jasmin container!
