# Hamro Dev DNS Lookup for IONOS
This is a small script that I use to update my DNS records stored in IONOS.
If you set up the variables correctly. when launching this script. it will check the public IP address and match it
against the ip address stored in the DNS Domains. if the Address is not the right address, it will modify the DNS records
to match the public IP. This allows for DNS domain server auto renewal.

A sort of home made do it yourself Dynamic DNS.

# HOW TO
 you must build the application in the machine to use this with pm2. the process will look for /dist/index.js
 If not . with ts-node you can execute this on a script.

# Telegram integration
You can configure a telegram bot so this app sends the public address of the hosted server.