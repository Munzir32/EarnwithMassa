# Earn With Massa - Decentralized Task Marketplace

A decentralized task marketplace built on Massa blockchain where users can create tasks, submit work, and earn rewards through ERC-20 tokens with token-gated access.

## 🚀 Features

- **Task Creation**: Admins can create tasks with token-gated access and ERC-20 rewards
- **Token Gating**: Only users holding specific tokens can submit to tasks
- **Submission System**: Users can submit work with links to their contributions
- **Winner Selection**: Task creators can pick winners from submissions
- **IPFS Integration**: Task details stored off-chain via IPFS
- **Reputation System**: Track creator reputation and success rates
- **Autonomous Smart Contract**: Built with Massa AssemblyScript (ASC)

## 📋 Smart Contract Functions

### Write Operations (Require Account)
- `createTask(tokenGate, rewardToken, rewardAmount, details)` - Create a new task
- `submitToTask(taskId, submissionLink)` - Submit work to a task
- `pickWinner(taskId, winner)` - Select a winner for a task

### Read Operations (No Account Required)
- `getTask(taskId)` - Get task details
- `hasSubmitted(taskId, user)` - Check if user has submitted
- `taskCounter()` - Get total number of tasks
- `getSubmissions(taskId)` - Get all submissions for a task

## 🏗️ Project Structure

```
earnwithmassa/
├── assembly/
│   └── contracts/
│       └── main.ts          # Smart contract implementation
├── src/
│   └── hello.ts            # Contract interaction script
├── build/                  # Compiled contract
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- Yarn or npm
- Massa wallet with testnet tokens

### Install Dependencies
```bash
yarn install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_massa_private_key_here
```

### Build Contract
```bash
yarn build
```

## 📜 Smart Contract Details

### Contract Address
```
AS12EzGDAjakRnnymvspvn5fyqJ17hmNLwejWU2BTfyRjDrq6w82h
```

### Data Structures

#### Task
```typescript
{
  creator: string,           // Task creator address
  tokenGate: string,         // Required token address
  rewardToken: string,       // Reward token address
  rewardAmount: u64,         // Reward amount
  details: string,           // IPFS hash with task details
  submissions: Submission[], // Array of submissions
  isClosed: boolean,         // Task status
  winner: string            // Winner address
}
```

#### Submission
```typescript
{
  user: string,              // Submitter address
  submissionLink: string     // Link to submitted work
}
```

## 🚀 Usage

### Running the Interaction Script

```bash
yarn hello
```

This will:
1. Initialize connection to the contract
2. Perform read operations (task counter, task details, submissions)
3. Show encoded arguments for write operations
4. Display decoded data for easy understanding

### Example Output

```
Task counter: 0
getTask raw: Uint8Array(0) []
getTask decoded: null
Has submitted: false
getSubmissions raw: Uint8Array(0) []
getSubmissions decoded: []

createTask - args decoded: {
  "tokenGate": "tokenGateAddress",
  "rewardToken": "rewardTokenAddress", 
  "rewardAmount": 1000n,
  "details": "ipfs://details"
}
```

### Contract Interaction Examples

#### Create a Task
```typescript
await createTask(
  'tokenGateAddress',     // Required token contract
  'rewardTokenAddress',   // Reward token contract
  1000n,                  // Reward amount (bigint)
  'ipfs://task-details'   // IPFS hash with task info
);
```

#### Submit to a Task
```typescript
await submitToTask(
  0,                      // Task ID
  'https://github.com/user/work'  // Submission link
);
```

#### Pick a Winner
```typescript
await pickWinner(
  0,                      // Task ID
  'userAddress'           // Winner's address
);
```

## 🔧 Development

### Contract Development
The smart contract is written in AssemblyScript and uses Massa's ASC SDK:

```typescript
// Key imports
import { Context, Storage, generateEvent } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';
```

### Frontend Integration
The contract integrates with the platform-to-earn frontend:
- Task creation and management
- Submission handling
- Winner selection
- IPFS data storage

### Testing
```bash
# Run tests
yarn test

# Build and test
yarn build && yarn test
```

## 🌐 Network Information

- **Network**: Massa Testnet
- **Provider**: JsonRpcProvider.buildnet()
- **Contract**: Deployed on Massa blockchain

## 📝 Events

The contract emits the following events:
- `TaskCreated(taskId, creator)` - When a new task is created
- `Submitted(taskId, user, submissionLink)` - When work is submitted
- `WinnerPicked(taskId, winner)` - When a winner is selected

## 🔒 Security Features

- **Token Gating**: Only users with required tokens can submit
- **Creator Only**: Only task creators can pick winners
- **Max Submissions**: Tasks close after 3 submissions
- **Duplicate Prevention**: Users can only submit once per task

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
- Check the contract documentation
- Review the interaction script examples
- Ensure your environment is properly configured

---

**Built with ❤️ on Massa Blockchain**
