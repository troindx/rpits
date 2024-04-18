#!/bin/bash
# Obtain the domain and validation value from environment variables
DOMAIN="$CERTBOT_DOMAIN"
VALIDATION="$CERTBOT_VALIDATION"

# Add the TXT record to the DNS zone
echo "Adding TXT record for domain $DOMAIN with value $VALIDATION"
ts-node "$(dirname "$0")/challenge.ts" $VALIDATION