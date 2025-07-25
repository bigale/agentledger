# AgentLedger - Self-Healing Distributed Cache on Internet Computer

A blockchain-based distributed cache system with self-healing capabilities, built on the Internet Computer. AgentLedger demonstrates fault-tolerant caching through automatic failure detection, recovery mechanisms, and optional queue processing for enhanced reliability.

## 🚀 Features

### Core Capabilities
- **Persistent Cache Storage**: Key-value pairs stored in blockchain persistent memory
- **6-Node Distributed Architecture**: Simulated nodes within a single canister for fault tolerance
- **Self-Healing System**: Automatic failure detection and recovery with data redistribution
- **Data Replication**: Multi-node replication ensures availability even during failures
- **Graceful Degradation**: Continues operating even with only one healthy node

### Queue Processing (Optional)
- **FIFO Queue**: Sequential processing of cache operations for consistency
- **Operation Buffering**: Handles operations during cache unavailability
- **Retry Logic**: Exponential backoff for failed operations
- **Batch Processing**: Configurable batch sizes for efficient processing
- **Resource Management**: Cycle and memory monitoring with safety thresholds

### Frontend Dashboard
- **Real-time Visualization**: Live view of node health and cache distribution
- **Queue Management**: Manual and automatic processing controls
- **Comprehensive Testing**: Automated test suites for cache and queue operations
- **Performance Monitoring**: Metrics, statistics, and trend analysis
- **Error Debugging**: Detailed error logs and retry status tracking

## 🛠️ Technology Stack

- **Backend**: Motoko (Internet Computer's native language)
- **Frontend**: React + TypeScript
- **State Management**: React Query
- **Build Tool**: Vite
- **Platform**: Internet Computer blockchain

## 📦 Installation

### Prerequisites
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install) (Internet Computer SDK)
- Node.js 16+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/bigale/agentledger.git
cd agentledger
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

3. Start the local Internet Computer replica:
```bash
dfx start --clean
```

4. Deploy the canisters:
```bash
dfx deploy
```

## 🎮 Usage

### Basic Operations

1. **Access the Frontend**:
   - Open `http://localhost:3000` after deployment
   - The frontend will connect to your local canisters

2. **Cache Operations**:
   - **Set**: Add key-value pairs to the cache
   - **Get**: Retrieve values by key
   - **Delete**: Remove entries from the cache

3. **Queue Operations** (Optional):
   - Enable queue processing for buffered operations
   - Configure batch size and processing intervals
   - Monitor queue depth and processing statistics

### Testing

The frontend includes comprehensive test suites:

- **Basic Tests**: Cache operations (set/get/delete)
- **Failure Tests**: Node failure and recovery simulation
- **Performance Tests**: Configurable rate and volume testing
- **Queue Tests**: Inter-canister calls, retry logic, batch processing

## 🏗️ Architecture

### Backend Structure

```
backend/
├── main.mo           # Main cache canister with 6-node simulation
├── queue.mo          # Optional queue canister for buffered processing
└── auth-single-user/ # Authentication management
    └── management.mo
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/   # React components for UI
│   ├── hooks/        # Custom hooks for IC integration
│   ├── app.tsx       # Main application component
│   └── main.tsx      # Application entry point
```

## 📊 Key Concepts

### Self-Healing Mechanism
1. Nodes periodically check health status
2. Failed nodes trigger automatic data redistribution
3. Recovering nodes reintegrate with load balancing
4. System maintains availability with graceful degradation

### Queue Processing Benefits
- **Reliability**: Operations buffered during failures
- **Ordering**: FIFO guarantees operation sequence
- **Efficiency**: Batch processing reduces overhead
- **Monitoring**: Comprehensive statistics and metrics

### Performance Considerations
- Blockchain consensus adds latency vs traditional caches
- Persistence provides durability at the cost of speed
- Suitable for high-reliability, moderate-throughput scenarios
- Consider traditional solutions for ultra-low-latency needs

## 🔧 Configuration

### Environment Variables
Set these in your frontend build:
- `DFX_NETWORK`: Network to connect to (default: `local`)
- `BACKEND_CANISTER_ID`: Main cache canister ID
- `QUEUE_CANISTER_ID`: Queue canister ID

### Queue Configuration
- **Batch Size**: 1-100 operations per batch
- **Processing Interval**: 5-30 seconds for automatic mode
- **Retry Limit**: Maximum retry attempts for failed operations
- **Queue Size**: Maximum number of queued operations

## 📈 Monitoring

### Metrics Available
- Node failure/recovery counts
- Queue depth and processing rates
- Operation success/failure rates
- Inter-canister call statistics
- Resource usage (cycles, memory)

### Performance Testing
- Configure message rate: 1-5 operations/second
- Set total operations: 10-100
- View real-time progress and results
- Analyze throughput and latency metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [DFX Command Reference](https://internetcomputer.org/docs/current/developer-docs/setup/dfx)

## ⚡ Quick Commands

```bash
# Start local replica
dfx start --clean

# Deploy all canisters
dfx deploy

# Deploy specific canister
dfx deploy backend
dfx deploy queue

# Check canister status
dfx canister status backend

# View canister logs
dfx canister logs backend

# Frontend development
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
npm run typecheck # Check TypeScript types
```

## 🎯 Use Cases

### Suitable For
- **Financial Systems**: Credit unions requiring high reliability
- **Audit Trails**: Systems needing persistent cache history
- **Distributed Apps**: dApps requiring decentralized caching
- **High-Reliability Systems**: Where data loss is unacceptable

### Not Recommended For
- **Ultra-Low Latency**: Sub-millisecond response requirements
- **High-Frequency Trading**: Where every microsecond matters
- **Massive Scale**: Billions of operations per second
- **Temporary Data**: Where persistence adds unnecessary cost

## 🛡️ Security Considerations

- All data stored on-chain is publicly readable
- Authentication handled via Internet Identity
- Consider encryption for sensitive cached data
- Queue operations validated to prevent empty keys/values

---

Built with ❤️ on the Internet Computer
<img width="1272" height="13263" alt="agentledger-test" src="https://github.com/user-attachments/assets/4bfd7e2c-0611-4a4f-bb58-c0169c89dfcb" />

