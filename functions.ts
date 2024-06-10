import axios from 'axios';
import { config } from 'dotenv';
import { promises as dnsPromises } from 'dns';
config();


// Define the URL for the httpbin.org IP endpoint
const ipApiUrl = 'http://httpbin.org/ip';

// Define the domain for hamrodev.com
const hamrodevDomain = 'hamrodev.com';
const ionosApiKey = `${process.env.PUBLIC_PREFIX}.${process.env.SECRET}` || "";

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
export async function getHamroDNS (){
  const dnsResponse = await dnsPromises.lookup(hamrodevDomain);
  return dnsResponse;
} 

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

export async function challenge(new_value:string){
  const zone = process.env.ZONE;
  const recordId= process.env.ACME_CHALLENGE_ID
  const ionosApiEndpoint = `https://api.hosting.ionos.com/dns/v1/zones/${zone}/records/${recordId}`;
  
  const headers = {
    'accept': 'application/json',
    'X-API-Key': ionosApiKey,
    'Content-Type': 'application/json',
  };

  const data = {
    'disabled': false,
    'content': new_value,
    'ttl': 3600,
    'prio': 0,
  };
  try {
    const response = await axios.put(ionosApiEndpoint, JSON.stringify(data), { headers });
    return response.data;
  } catch (error:any) {
    console.error('Error:', error.message, "\nCode:", error.code, "\nHeaders:", error.config.headers, "\nUrl", error.config.url, "\nData", error.config.data);
    throw error;
  }
}

export async function updateDNSRecords() :Promise< {
    stdout: string;
    stderr: string;
  }[]>{
  const records : {
    stdout: string;
    stderr: string;
  }[] = []
  try {
    const publicIP = await getHamroPublicIp();
    records.push(await updateDNSRecord(process.env.ZONE as string, process.env.HAMRODEV_ID as string, publicIP));
    records.push(await updateDNSRecord(process.env.ZONE as string, process.env.WWW_HAMRODEV_ID as string, publicIP));
  } catch (error) {
    console.error('Error:', error);
  }
  return records;
}

// Define an async function to fetch the public IP and compare/update DNS record
export async function checkDNSRecords():Promise<{
  stdout: string;
  stderr: string;
}[]>{
  const records : {
    stdout: string;
    stderr: string;
  }[] = []
  try {
    // Extract the public IP from the response data
    const publicIP = await getHamroPublicIp();
    // Get the IP address from the dns response
    const dnsIP = (await getHamroDNS()).address;

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
  }
  
  return records;
}
