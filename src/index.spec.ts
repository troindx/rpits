import {
  getHamroDNS,
  getHamroPublicIp,
  ionosApiKey,
  notifyIPtoTelegram,
  checkDNSRecords,
} from './functions';
let ip: string;

/**
 * Integration tests for microservice. These Tests use the original APIs and are not meant to be used in a unitary fashion.
 * They are useful to test where the program is failing, for troubleshooting.
 * If you run the tests then you are also running the program.
 */
test('ionos API key is set', () => {
  expect(typeof ionosApiKey).toBe('string');
  expect(ionosApiKey.length).toBe(119);
}, 50000);
test('getHamroPublicIp -> Gets an IP', async () => {
  const ip = await getHamroPublicIp();
  expect(typeof ip).toBe('string');
}, 50000);

test('getHamroDNSIp -> Gets an DNS Lookup IP', async () => {
  ip = (await getHamroDNS()).address;
  expect(typeof ip).toBe('string');
}, 50000);

test('Checks DNS records', async () => {
  const resp = await checkDNSRecords();
  if (!resp) throw Error('No response from checkDNSRecords');
  expect(resp).toBeTruthy();
  expect(typeof resp.dnsIP).toBe('string');
  expect(typeof resp.publicIP).toBe('string');
  const notified = await notifyIPtoTelegram(resp);
  expect(notified).toBe(true);
}, 50000);
