import { challenge, getHamroDNS, getHamroPublicIp, getRecordValue, updateDNSRecords } from "./functions";

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
    expect((await resp).length).toBe(3);
    
},50000);

test('challenge -> updates the record', async () => {
    const pre = (await getRecordValue(process.env.ACME_CHALLENGE_ID || ""))
    console.log(pre)
    expect(typeof pre.content).toBe('string');
    const result = (await challenge('ns.someValue.com'));
    console.log(result);
    expect(result.content).toBe( "\"ns.someValue.com\"");
    const leave_as_it_was = (await challenge(pre.content));
    console.log(leave_as_it_was);
    expect(leave_as_it_was.content).toBe(pre.content);
},50000);