sudo chown :mailserver /etc/letsencrypt/live/mail.hamrodev.com/privkey.pem
sudo chown :mailserver /etc/letsencrypt/live/mail.hamrodev.com/cert.pem
sudo chown :mailserver /etc/letsencrypt/live/mail.hamrodev.com/fullchain.pem
sudo chmod 640 /etc/letsencrypt/live/mail.hamrodev.com/privkey.pem
sudo chmod 640 /etc/letsencrypt/live/mail.hamrodev.com/cert.pem
sudo chmod 640 /etc/letsencrypt/live/mail.hamrodev.com/fullchain.pem
sudo systemctl restart dovecot
sudo systemctl restart postfix