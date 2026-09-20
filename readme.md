** ai-medichain
If you choose PostgreSQL:

React.js
    ↓
Node.js + Express
    ↓
Prisma ORM
    ↓
PostgreSQL

Blockchain remains separate:

Node.js
    ↓
Ethers.js
    ↓
Solidity Smart Contract
    ↓
Ethereum / Hardhat

And your medical-file flow:

Medical File
     ↓
Secure File Storage
     ↓
PostgreSQL → metadata + file reference
     ↓
Hash
     ↓
Blockchain → verification
