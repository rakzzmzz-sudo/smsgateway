# Deploying SMS Gateway Dashboard to Ubuntu (Hostinger)

This guide provides the exact steps to securely transfer and run the Next.js Web UI on your Hostinger Ubuntu server alongside your active Jasmin SMS Gateway.

We will use **Node.js** to run the app, **PM2** to keep it alive 24/7 (even if the server restarts), and **NGINX** as a reverse proxy to expose it securely to the web.

---

### Phase 1: Prepare the Server Environment

SSH into your Hostinger machine:

```bash
ssh root@76.13.211.177
```

**1. Install Node.js (v20) and NPM**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2. Install PM2 (Process Manager)**

```bash
sudo npm install -g pm2
```

**3. Install NGINX (Web Server)**

```bash
sudo apt update
sudo apt install nginx -y
```

---

### Phase 2: Deploy the Code

**1. Create a Directory for the App**
On your Ubuntu server, create an applications folder:

```bash
mkdir -p /var/www/smsgateway-ui
cd /var/www/smsgateway-ui
```

**2. Clone your GitHub Repository**
Since all my recent Telnet integration changes were pushed to your `main` branch, we can simply clone the live repo directly onto the server!

```bash
git clone https://github.com/rakzzmzz-sudo/smsgateway.git .
cd webui
```

**3. Set Up Production Environment Variables**
Create your production `.env` file on the server. Since the Next.js app and Jasmin are now running on the exact same Ubuntu machine, we will use the highly secure local loopback address (`127.0.0.1`) instead of the public IP.

```bash
cat << 'EOF' > .env
JCLI_HOST=127.0.0.1
JCLI_PORT=8990
JCLI_USERNAME=jcliadmin
JCLI_PASSWORD=jclipwd
EOF
```

**4. Install Dependencies and Build**

```bash
npm ci
npm run build
```

---

### Phase 3: Start the Application with PM2

We will use PM2 to start the Next.js built production server on Port `3000`.

```bash
pm2 start npm --name "sms-dashboard" -- start
pm2 save
pm2 startup
```

_(Run the command that PM2 generates after typing `pm2 startup` to ensure the dashboard boots automatically if the server reboots)._

---

### Phase 4: Configure NGINX Reverse Proxy

Right now, the app is running on `http://127.0.0.1:3000` internally on your Hostinger box. We need NGINX to accept traffic on Port `80` (Standard HTTP) and forward it to your Dashboard.

**1. Create an NGINX Configuration**

```bash
sudo nano /etc/nginx/sites-available/smsgateway
```

**2. Paste this Configuration:**

```nginx
server {
    listen 80;
    server_name 76.13.211.177; # Change to your domain name later if you get one (e.g., dashboard.mysms.com)

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**3. Enable the Site and Restart NGINX**

```bash
sudo ln -s /etc/nginx/sites-available/smsgateway /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

### 🎉 You're Done!

Open your browser and navigate directly to your server IP:
**http://76.13.211.177**

You will instantly hit the live Next.js Web UI. It is now permanently hosted out of Hostinger, and because it sits right next to Jasmin, the Telnet API interactions will be lightning fast and 100% secure since the TCP sockets never leave the internal machine layer!
