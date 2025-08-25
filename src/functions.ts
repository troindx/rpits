import axios from 'axios';
import { config } from 'dotenv';
import { promises as dnsPromises, LookupAddress } from 'dns';
config();


// Define the URL for the httpbin.org IP endpoint
const ipApiUrl = 'http://httpbin.org/ip';

// Define the domain you want the IP to look for
const hamrodevDomain = 'hamrodev.com';
export const ionosApiKey = `${process.env.PUBLIC_PREFIX}.${process.env.SECRET}`.trim() || "";

/**
 * Updates HamroDev DNS Using curlCommand
 * @param zone in .env file
 * @param recordId in .env file
 * @param ip  from public IP
 * @throws curl command errors.
 */
async function updateDNSRecord(zone:string, recordId:string, ip: string){
  const ionosApiEndpoint = `https://api.hosting.ionos.com/dns/v1/zones/${zone}/records/${recordId}`;

  const headers = {
    'accept': 'application/json',
    'X-API-Key': ionosApiKey,
    'Content-Type': 'application/json',
  };

  const data = {
    'disabled': false,
    'content': ip,
    'ttl': 3600,
    'prio': 0,
  };

  try {
    const response = await axios.put(ionosApiEndpoint, data, { headers });
    return response.data;
  } catch (error) {
    console.error('HTTP Error:', error);
    throw error;
  }
}

/**
 * Function that gets the public internet IP Address of the server running the code
 * @returns the IP in string format.
 */
export async function getHamroPublicIp(): Promise<string>{
    try {
        // Make the GET request to httpbin.org to get the public IP
        const response = await axios.get(ipApiUrl);
        // Extract the public IP from the response data
        return response.data.origin as string;
    } catch (error) {
        console.error('Error while obtaining Hamro Public IP:', error);
        throw error
    }
 
}
/**
 * Gets the DNS address for the url stored in hamrodevDomain 
 * @returns 
 */
export async function getHamroDNS (): Promise<LookupAddress>{
  const dnsResponse = await dnsPromises.lookup(hamrodevDomain);
  return dnsResponse;
} 

/**
 * Gets the record values for a recordId in IONOS. Not used for now, but useful for future possible upgrades.
 * @param recordId 
 * @returns 
 */
export async function getRecordValue(recordId:string) {
  const zone = process.env.ZONE;
  const ionosApiEndpoint = `https://api.hosting.ionos.com/dns/v1/zones/${zone}/records/${recordId}`;
  
  const headers = {
    'accept': 'application/json',
    'X-API-Key': ionosApiKey,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(ionosApiEndpoint, { headers });
    return response.data;
  } catch (error) {
    console.error('HTTP Error:', error);
    throw error;
  }
}

/**
 * Main Run Function. this
 */
export async function run(){
 const resp = await checkDNSRecords();
 if (!resp) { console.error("Failed to check and update DNSRecords."); return;}
 const notified = notifyIPtoTelegram(resp);
 if (!notified) console.error("Could not send notification to Telegram Bot");
}

type DNSRecordIPResponse = {
  records : {
  stdout: string;
  stderr: string;
  }[],
  publicIP: string;
  dnsIP : string;
}

/**
 * Checks the main DNS records from public IP. obtains the DNS address
 * @returns and object containing all the info that happened or null if an error happened.
 * 
 */
export async function checkDNSRecords():Promise<DNSRecordIPResponse | null>{
  let publicIP : string;
  let dnsIP : string;
  const records : {
    stdout: string;
    stderr: string;
  }[] = []
  try {
    // Extract the public IP from the response data
    publicIP = await getHamroPublicIp();
    // Get the IP address from the dns response
    dnsIP = (await getHamroDNS()).address;
    if (!dnsIP) throw Error("DNS IP not found");
    if (!publicIP) throw Error("Public IP not found");

    // Compare the public IP with the IP of hamrodev.com
    if (publicIP === dnsIP) {
      console.log('Public IP and hamrodev.com IP match!: ', publicIP);
    } else {
      records.push(await updateDNSRecord(process.env.ZONE as string, process.env.HAMRODEV_ID as string, publicIP));
      records.push(await updateDNSRecord(process.env.ZONE as string, process.env.WWW_HAMRODEV_ID as string, publicIP));
    }
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    return null;
  }
  
  return {records , publicIP, dnsIP};
}

/**
 * Notifies the DNS Records via telegram to the CHAT ID provided in the .env file.
 * @param records information with the records
 * @returns true if notification went through or false if not.
 */
export async function notifyIPtoTelegram(dns:DNSRecordIPResponse): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  let message = `Public IP: ${dns.publicIP}, DNS IP: ${dns.dnsIP}.`
  dns.records.forEach( (record, index) =>{
    message+= `${index}) ${record.stdout}.`;
    if (record.stderr) message+=` Errors: ${record.stderr}.`;
  })

  if (!botToken || !chatId) {
    throw new Error(
      "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en variables de entorno"
    );
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await axios.post(endpoint, {
      chat_id: chatId,
      text: message,        // texto plano para evitar problemas de escape
      disable_web_page_preview: true
    });
    return true
  } catch (error) {
    console.error("Error enviando notificación a Telegram:", error);
    return false
  }
}