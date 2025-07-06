import {
  Args,
  bytesToStr,
  strToBytes,
  SmartContract,
  JsonRpcProvider,
  Account,
} from '@massalabs/massa-web3';
import 'dotenv/config';

// Replace with your deployed contract address
const CONTRACT_ADDR = 'AS12EzGDAjakRnnymvspvn5fyqJ17hmNLwejWU2BTfyRjDrq6w82h';
const provider = JsonRpcProvider.buildnet();
const contract = new SmartContract(provider, CONTRACT_ADDR);

// If you need to sign transactions (for write calls)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
let account: Account | undefined;

// Initialize account asynchronously
async function initializeAccount() {
  try {
    if (PRIVATE_KEY) {
      account = await Account.fromPrivateKey(PRIVATE_KEY);
    }
  } catch (error) {
    console.warn('Failed to create account from private key:', error);
    account = undefined;
  }
}

// Helper: encode args for contract calls
function encodeArgs(args: (string | number | bigint)[]): Uint8Array {
  let a = new Args();
  for (const arg of args) {
    if (typeof arg === 'string') a.addString(arg);
    else if (typeof arg === 'number') a.addU32(BigInt(arg));
    else if (typeof arg === 'bigint') a.addU64(arg);
  }
  return a.serialize();
}

// Helper: decode string from contract return
function decodeString(bin: Uint8Array): string {
  return bytesToStr(bin);
}

// Helper: decode u32 from contract return
function decodeU32(bin: Uint8Array): number {
  return Number(new Args(bin).nextU32());
}

// Helper: decode bool from contract return
function decodeBool(bin: Uint8Array): boolean {
  return decodeString(bin) === 'true';
}

// Helper: deserialize encoded args for debugging
function deserializeArgs(encoded: Uint8Array): any[] {
  try {
    const args = new Args(encoded);
    const decoded: any[] = [];
    
    // Decode all arguments that were originally encoded
    // For createTask: [tokenGate, rewardToken, rewardAmount, details]
    // For submitToTask: [taskId, submissionLink]  
    // For pickWinner: [taskId, winner]
    
    // Try to decode all arguments in sequence
    while (true) {
      try {
        // Try string first
        const str = args.nextString();
        decoded.push(str);
      } catch {
        try {
          // Try u32
          const num = args.nextU32();
          decoded.push(Number(num));
        } catch {
          try {
            // Try u64
            const bigNum = args.nextU64();
            decoded.push(bigNum);
          } catch {
            // No more arguments to decode
            break;
          }
        }
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Error deserializing args:', error);
    return [];
  }
}

// Helper: deserialize task data
function deserializeTask(encoded: Uint8Array): any {
  if (encoded.length === 0) return null;
  
  try {
    const args = new Args(encoded);
    const task = {
      creator: args.nextString(),
      tokenGate: args.nextString(),
      rewardToken: args.nextString(),
      rewardAmount: args.nextU64(),
      details: args.nextString(),
      submissions: [] as any[],
      isClosed: false,
      winner: ''
    };
    
    const subCount = args.nextU32();
    for (let i = 0; i < subCount; i++) {
      task.submissions.push({
        user: args.nextString(),
        submissionLink: args.nextString()
      });
    }
    
    task.isClosed = Number(args.nextU32()) === 1;
    task.winner = args.nextString();
    
    return task;
  } catch (error) {
    console.error('Error deserializing task:', error);
    return null;
  }
}

// Helper: deserialize submissions
function deserializeSubmissions(encoded: Uint8Array): any[] {
  if (encoded.length === 0) return [];
  
  try {
    const args = new Args(encoded);
    const submissions: any[] = [];
    const count = args.nextU32();
    
    for (let i = 0; i < count; i++) {
      submissions.push({
        user: args.nextString(),
        submissionLink: args.nextString()
      });
    }
    
    return submissions;
  } catch (error) {
    console.error('Error deserializing submissions:', error);
    return [];
  }
}

// Helper: deserialize createTask args specifically
function deserializeCreateTaskArgs(encoded: Uint8Array): any {
  try {
    const args = new Args(encoded);
    return {
      tokenGate: args.nextString(),
      rewardToken: args.nextString(),
      rewardAmount: args.nextU64(),
      details: args.nextString()
    };
  } catch (error) {
    console.error('Error deserializing createTask args:', error);
    return null;
  }
}

// Helper: deserialize submitToTask args specifically
function deserializeSubmitTaskArgs(encoded: Uint8Array): any {
  try {
    const args = new Args(encoded);
    return {
      taskId: Number(args.nextU32()),
      submissionLink: args.nextString()
    };
  } catch (error) {
    console.error('Error deserializing submitToTask args:', error);
    return null;
  }
}

// Helper: deserialize pickWinner args specifically
function deserializePickWinnerArgs(encoded: Uint8Array): any {
  try {
    const args = new Args(encoded);
    return {
      taskId: Number(args.nextU32()),
      winner: args.nextString()
    };
  } catch (error) {
    console.error('Error deserializing pickWinner args:', error);
    return null;
  }
}

// 1. Create a new task (write)
export async function createTask(
  tokenGate: string,
  rewardToken: string,
  rewardAmount: bigint,
  details: string
) {
  if (!account) throw new Error('No account for signing - set PRIVATE_KEY in .env');
  const args = encodeArgs([tokenGate, rewardToken, rewardAmount, details]);
  console.log('createTask - args encoded:', args);
  console.log('createTask - args decoded:', deserializeCreateTaskArgs(args));
  console.log('Note: Write operations require a different provider setup');
  // const tx = await contract.call('createTask', args);
  // console.log('createTask tx:', tx);
}

// 2. Get a task (read)
export async function getTask(taskId: number) {
  const args = encodeArgs([taskId]);
  const result = await contract.read('getTask', args);
  console.log('getTask raw:', result.value);
  const decodedTask = deserializeTask(result.value);
  console.log('getTask decoded:', decodedTask);
  return result.value;
}

// 3. Submit to a task (write)
export async function submitToTask(taskId: number, submissionLink: string) {
  if (!account) throw new Error('No account for signing - set PRIVATE_KEY in .env');
  const args = encodeArgs([taskId, submissionLink]);
  console.log('submitToTask - args encoded:', args);
  console.log('submitToTask - args decoded:', deserializeSubmitTaskArgs(args));
  console.log('Note: Write operations require a different provider setup');
  // const tx = await contract.call('submitToTask', args);
  // console.log('submitToTask tx:', tx);
}

// 4. Pick a winner (write)
export async function pickWinner(taskId: number, winner: string) {
  if (!account) throw new Error('No account for signing - set PRIVATE_KEY in .env');
  const args = encodeArgs([taskId, winner]);
  console.log('pickWinner - args encoded:', args);
  console.log('pickWinner - args decoded:', deserializePickWinnerArgs(args));
  console.log('Note: Write operations require a different provider setup');
  // const tx = await contract.call('pickWinner', args);
  // console.log('pickWinner tx:', tx);
}

// 5. Check if user has submitted (read)
export async function hasSubmitted(taskId: number, user: string) {
  const args = encodeArgs([taskId, user]);
  const result = await contract.read('hasSubmitted', args);
  return decodeBool(result.value);
}

// 6. Get total number of tasks (read)
export async function getTaskCounter() {
  const result = await contract.read('taskCounter', new Uint8Array());
  return decodeString(result.value);
}

// 7. Get all submissions for a task (read)
export async function getSubmissions(taskId: number) {
  const args = encodeArgs([taskId]);
  const result = await contract.read('getSubmissions', args);
  console.log('getSubmissions raw:', result.value);
  const decodedSubmissions = deserializeSubmissions(result.value);
  console.log('getSubmissions decoded:', decodedSubmissions);
  return result.value;
}

// Example usage:
async function main() {
  try {
    // Initialize account first
    await initializeAccount();
    
    // Check if account is available for write operations
    if (!account) {
      console.log('No private key found. Only read operations will work.');
      console.log('Set PRIVATE_KEY in your .env file for write operations.');
    }

    // 6. Get task counter (read - works without account)
    const counter = await getTaskCounter();
    console.log('Task counter:', counter);

    // 2. Get a task (read - works without account)
    const task = await getTask(0);
    console.log('Task:', task);

    // 5. Check if user has submitted (read - works without account)
    const submitted = await hasSubmitted(0, 'userAddress');
    console.log('Has submitted:', submitted);

    // 7. Get submissions (read - works without account)
    const submissions = await getSubmissions(0);
    console.log('Submissions:', submissions);

    // Write operations (require account)
    if (account) {
      // 1. Create a task (requires account)
      await createTask('tokenGateAddress', 'rewardTokenAddress', 1000n, 'ipfs://details');

      // 3. Submit to a task (requires account)
      await submitToTask(0, 'https://submission.link');
      const task2 = await getTask(0);
      console.log('Task:', task2);

      // 4. Pick a winner (requires account)
      await pickWinner(0, 'userAddress');
    } else {
      console.log('Skipping write operations - no account available');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
