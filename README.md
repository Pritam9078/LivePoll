# 🟠 Orange Belt: Live Poll dApp

A full-stack decentralized application built on the **Stellar Testnet** using **Soroban smart contracts** and a modern **React/Vite/TypeScript** frontend.

## 🌟 Features

- **Multi-Wallet Integration**: Supports both Freighter and xBull wallets using `@creit-tech/stellar-wallets-kit`.
- **Live Voting**: Cast YES/NO votes that are recorded securely on the blockchain.
- **Double-Vote Prevention**: Smart contract strictly enforces one vote per wallet address.
- **Real-Time Synchronization**: UI automatically polls the contract and updates the vote graph in real-time.
- **Optimistic UI & Caching**: Fast loading using `localStorage` caching and immediate UI feedback while transactions process.
- **Detailed Transaction Tracking**: Clearly shows pending, success, and failed states, with clickable links to Stellar Expert.

## 🛠️ Tech Stack

- **Backend / Smart Contract**: Rust, Soroban SDK
- **Frontend Framework**: React, Vite, TypeScript
- **Styling**: TailwindCSS
- **Blockchain Interaction**: `@stellar/stellar-sdk`, `@creit-tech/stellar-wallets-kit`

---

## 🚀 Setup Instructions

### 1. Smart Contract (Backend)

We assume you have Rust and the `soroban-cli` installed.

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
cargo test
```

To deploy to Testnet (make sure your CLI is configured with a funded testnet identity):

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/live_poll.wasm \
  --network testnet
```

*Copy the resulting Contract ID and place it in the frontend utility file.*

### 2. Frontend Configuration

Update the contract ID in `frontend/src/utils/stellarUtils.ts`:

```typescript
export const CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID";
```

### 3. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔗 Links and References

- **Contract Address (Testnet)**: `[REPLACE_WITH_DEPLOYED_CONTRACT_ID_ONCE_DEPLOYED]`
- **Live Demo Link**: `[REPLACE_WITH_VERCEL_OR_NETLIFY_LINK]`
- **Demo Video Link (1 min)**: `[REPLACE_WITH_YOUTUBE_OR_LOOM_LINK]`

---

## 📸 Screenshots

### 1. Wallet Selection & Connect
![Wallet Modal]([REPLACE_WITH_SCREENSHOT_LINK])

### 2. Live Vote UI & Results Graph
![Poll UI]([REPLACE_WITH_SCREENSHOT_LINK])

### 3. Transaction Success State
![Transaction Success]([REPLACE_WITH_SCREENSHOT_LINK])

### 4. Passing Unit Tests
![Unit Tests Output]([REPLACE_WITH_SCREENSHOT_LINK])

---
*Built for the Stellar Orange Belt Challenge.*
