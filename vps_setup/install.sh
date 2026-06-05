#!/bin/bash
set -e

echo "Starting VPS installation for Customer Search API..."

# 1. Install dependencies
apt-get update
apt-get install -y python3 python3-venv python3-pip postgresql postgresql-contrib redis-server nginx build-essential libpq-dev

# 2. Set up PostgreSQL
sudo -u postgres psql -c "CREATE USER admin WITH PASSWORD 'password123';"
sudo -u postgres psql -c "CREATE DATABASE customer_db OWNER admin;"
sudo -u postgres psql -c "ALTER USER admin CREATEDB;"

# 3. Set up Project Directory
mkdir -p /opt/customer_search_api
mkdir -p /uploads
chmod 777 /uploads

# Ensure we are in the directory containing backend, frontend and vps_setup
# Assuming you run this script from the parent folder (e.g. /home/user/customer_search_api)
cp -r ../backend /opt/customer_search_api/
cp -r ../frontend /opt/customer_search_api/
cp -r ../vps_setup /opt/customer_search_api/

# 4. Set up Python Virtual Environment
cd /opt/customer_search_api
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Create .env from template if missing
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
fi

# 5. Set up Systemd Services
cp vps_setup/fastapi.service /etc/systemd/system/
cp vps_setup/celery.service /etc/systemd/system/

systemctl daemon-reload
systemctl enable fastapi
systemctl start fastapi

systemctl enable celery
systemctl start celery

# 6. Set up Nginx
cp vps_setup/nginx.conf /etc/nginx/sites-available/customer_search
ln -sf /etc/nginx/sites-available/customer_search /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

systemctl restart nginx

echo "Installation complete. The API and Dashboard should now be accessible."
echo "Please place your CSV/XLSX files in the /uploads directory to import them via the dashboard."
