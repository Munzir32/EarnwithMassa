# Task Creator Reputation System

## Overview

The Task Creator Reputation System is a comprehensive solution that tracks and displays task creator performance metrics using Nodit's blockchain analytics API and smart contract data. This system helps users make informed decisions about participating in tasks by providing transparency into creator history and success rates.

## Features

### 🏆 Reputation Scoring
- **Excellent**: 90%+ success rate with 5+ tasks
- **Good**: 75%+ success rate with 5+ tasks  
- **Fair**: 50%+ success rate or new creators
- **Poor**: Below 50% success rate
- **Unknown**: No task history

### 📊 Performance Metrics
- **Total Tasks**: Number of tasks created
- **Completed Tasks**: Tasks with winners selected
- **Success Rate**: Percentage of completed tasks
- **Average Reward**: Mean reward amount per task
- **Total Rewards Distributed**: Sum of all rewards paid out
- **Transaction Count**: Number of blockchain transactions
- **Total Volume**: Transaction volume in ETH/tokens

### 🔍 Analytics Integration
- **Nodit API**: Fetches transaction history and blockchain activity
- **Smart Contract**: Reads task data and completion status
- **IPFS**: Retrieves task details and metadata
- **Real-time Updates**: Live reputation calculation

## Implementation

### Core Components

#### 1. `useCreatorReputation` Hook
```typescript
const { stats, loading, error, refetch } = useCreatorReputation(creatorAddress)
```

**Features:**
- Fetches creator's transaction history from Nodit API
- Analyzes all tasks created by the address
- Calculates reputation metrics and scoring
- Handles API failures with fallback mechanisms

#### 2. `CreatorReputation` Component
```typescript
<CreatorReputation creatorAddress={address} className="mb-8" />
```

**Features:**
- Beautiful UI with reputation badges and icons
- Progress bars for success rates
- Detailed statistics grid
- Reputation insights and recommendations
- Loading and error states

#### 3. Compact Reputation Indicators
Integrated into `TaskCard` and `Taskgrid` components:
- Small reputation badges with icons
- Quick visual indicators
- Hover states for more details

### API Integration

#### Nodit Transaction History
```typescript
const response = await fetch('https://web3.nodit.io/v1/ethereum/sepolia/blockchain/getTransactionsByAccount', {
  method: 'POST',
  headers: {
    'X-API-KEY': process.env.NEXT_PUBLIC_NODIT_API_KEY,
    'accept': 'application/json',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    accountAddress: creatorAddress,
    contractAddress: contract,
    withCount: false
  })
})
```

#### Smart Contract Data
```typescript
// Fetch task counter
const { data: taskCounter } = useReadContract({
  address: contract,
  abi: ABI,
  functionName: 'taskCounter',
})

// Fetch individual task data
const taskData = await client.readContract({
  address: contract,
  abi: ABI,
  functionName: 'getTask',
  args: [BigInt(taskId)]
})
```

### Reputation Calculation Algorithm

```typescript
// Calculate success rate
const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

// Determine reputation level
let reputation: CreatorStats['reputation'] = 'Unknown'
if (totalTasks >= 5) {
  if (successRate >= 90) reputation = 'Excellent'
  else if (successRate >= 75) reputation = 'Good'
  else if (successRate >= 50) reputation = 'Fair'
  else reputation = 'Poor'
} else if (totalTasks > 0) {
  reputation = 'Fair' // New creators start with fair reputation
}
```

## Usage Examples

### Basic Implementation
```typescript
import { useCreatorReputation } from '@/hooks/useCreatorReputation'
import CreatorReputation from '@/components/CreatorReputation'

function TaskDetailPage({ creatorAddress }) {
  const { stats, loading } = useCreatorReputation(creatorAddress)
  
  return (
    <div>
      <CreatorReputation creatorAddress={creatorAddress} />
      {stats && (
        <p>Success Rate: {stats.successRate}%</p>
      )}
    </div>
  )
}
```

### Compact Indicator
```typescript
import { useCreatorReputation } from '@/hooks/useCreatorReputation'

function TaskCard({ creatorAddress }) {
  const { stats } = useCreatorReputation(creatorAddress)
  
  return (
    <div>
      <span>Creator: {creatorAddress}</span>
      {stats && (
        <Badge variant="outline">
          {stats.reputation}
        </Badge>
      )}
    </div>
  )
}
```

## Error Handling

### API Fallbacks
- **Nodit API Failure**: Continues with contract-only data
- **Network Issues**: Graceful degradation with loading states
- **Invalid Addresses**: Handles edge cases gracefully

### Loading States
- Skeleton loaders for reputation components
- Progress indicators for data fetching
- Error messages with retry options

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_NODIT_API_KEY=your_nodit_api_key_here
```

### Contract Configuration
```typescript
export const contract = "0x9fc8cF7cfd2bB1d1bF36E7e30867138516061e09"
```

## Demo Page

Visit `/reputation-demo` to see the reputation system in action with sample creator addresses and detailed analytics.

## Future Enhancements

### Planned Features
1. **Reputation History**: Track reputation changes over time
2. **Creator Profiles**: Detailed creator pages with full history
3. **Reputation Filters**: Filter tasks by creator reputation
4. **Notifications**: Alert users about reputation changes
5. **Advanced Analytics**: More detailed performance metrics

### Potential Integrations
1. **ENS Integration**: Display creator names instead of addresses
2. **Social Proof**: Link to social media profiles
3. **Verification Badges**: Verified creator status
4. **Reputation Challenges**: Dispute resolution system

## Technical Considerations

### Performance
- **Caching**: Reputation data is cached to reduce API calls
- **Lazy Loading**: Components load reputation data on demand
- **Optimization**: Efficient data processing and rendering

### Security
- **API Key Protection**: Environment variable configuration
- **Input Validation**: Address format validation
- **Error Boundaries**: Graceful error handling

### Scalability
- **Modular Design**: Easy to extend and modify
- **API Abstraction**: Clean separation of concerns
- **Component Reusability**: Shared components across the app

## Contributing

When contributing to the reputation system:

1. **Follow TypeScript conventions** for type safety
2. **Add error handling** for all API calls
3. **Include loading states** for better UX
4. **Test with different scenarios** (new creators, failed tasks, etc.)
5. **Update documentation** for any new features

## Support

For issues or questions about the reputation system:
1. Check the demo page at `/reputation-demo`
2. Review the API documentation
3. Test with sample creator addresses
4. Check browser console for error messages 