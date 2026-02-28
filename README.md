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
<img width="1280" height="624" alt="Screenshot 2026-02-28 at 11 49 29 PM" src="https://github.com/user-attachments/assets/24f7ea05-749e-48b4-9a3f-66142c8e6ff5" />


### 1. Wallet Selection & Connect
<img width="1280" height="636" alt="Screenshot 2026-02-28 at 11 49 45 PM" src="https://github.com/user-attachments/assets/bd67c54c-a236-4d19-b945-166342c9c530" />


### 2. Live Vote UI & Results Graph
<img width="1280" height="647" alt="Screenshot 2026-02-28 at 11 50 08 PM" src="https://github.com/user-attachments/assets/b2afae78-87b6-4da7-b685-20c7c7d4b53a" />


### 3. Transaction Success State
<img width="1280" height="618" alt="Screenshot 2026-02-28 at 11 50 23 PM" src="https://github.com/user-attachments/assets/0f65cba2-a744-4038-9413-ae5cfa8ac399" />


---
*Built for the Stellar Orange Belt Challenge.*
