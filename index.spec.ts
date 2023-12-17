import { getHamroDNS, getHamroPublicIp, updateDNSRecords } from "./functions";

test('getHamroPublicIp -> Gets an IP', async () => {
    const ip = await getHamroPublicIp();
    expect(typeof ip).toBe('string');
  });

test('getHamroDNSIp -> Gets an DNS Lookup IP', async () => {
    const ip = (await getHamroDNS()).address;
    expect(typeof ip).toBe('string');
});

test('Updates DNS', async () => {
    const resp = updateDNSRecords();
    expect((await resp).length).toBe(2);
    
},50000);