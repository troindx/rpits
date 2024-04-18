import { challenge } from "./functions";

const args: string[] = process.argv;
const scriptArgs: string[] = args.slice(2);
const newValue = scriptArgs[0]
console.log('Updating txt record content to: ', newValue);
challenge(newValue)