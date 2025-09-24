<!-- markdownlint-disable MD033 -->
<h1 align="center">Monad Mythics</h1>
<p align="center"><b>AI-Powered Web3 Storytelling Platform</b></p>
<p align="center">Create, share, and own AI-generated stories and comics as NFTs on the Monad blockchain.</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.2-blue?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/github/deployments/Drago-03/GroqTales/Production?label=deploy%20(prod)&logo=vercel&style=flat-square" alt="Production Deployment"/>
  <img src="https://img.shields.io/github/deployments/Drago-03/GroqTales/Preview?label=deploy%20(preview)&logo=vercel&style=flat-square" alt="Preview Deployments"/>
  <img src="https://img.shields.io/github/actions/workflow/status/Drago-03/GroqTales/ci.yml?branch=main&label=CI&style=flat-square" alt="CI Status"/>
  <img src="https://img.shields.io/github/last-commit/Drago-03/GroqTales?style=flat-square" alt="Last Commit"/>
  <img src="https://img.shields.io/github/commit-activity/m/Drago-03/GroqTales?style=flat-square" alt="Commit Activity"/>
  <img src="https://img.shields.io/github/issues/Drago-03/GroqTales?style=flat-square" alt="Open Issues"/>
  <img src="https://img.shields.io/github/issues-pr/Drago-03/GroqTales?style=flat-square" alt="Open PRs"/>
  <img src="https://img.shields.io/github/license/Drago-03/GroqTales?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Active"/>
  <img src="https://img.shields.io/badge/contributions-welcome-blueviolet?style=flat-square" alt="Contributions Welcome"/>
  <img src="https://img.shields.io/badge/website-groqtales.xyz-0052cc?style=flat-square" alt="Website"/>
  <a href="mailto:support@groqtales.xyz"><img src="https://img.shields.io/badge/contact-support%40groqtales.xyz-orange?style=flat-square" alt="Contact Us"/></a>
  <a href="https://discord.gg/JK29FZRm"><img src="https://img.shields.io/discord/1245696768829601812?label=Discord&logo=discord&style=flat-square" alt="Discord"/></a>
  
</p>

<p align="center">
  <img src="https://img.shields.io/badge/GSSOC'25-Open%20Source-orange?style=flat-square" alt="GSSOC'25"/>
  <img src="https://img.shields.io/badge/FOSS%20Hack-Open%20Source-blue?style=flat-square" alt="FOSS Hack"/>
  <img src="https://img.shields.io/badge/LGM--SOC-Open%20Source-purple?style=flat-square" alt="LGM-SOC"/>
  <img src="https://img.shields.io/badge/MLH-Open%20Source-red?style=flat-square" alt="MLH"/>
  <img src="https://img.shields.io/badge/HackinCodes-Open%20Source-green?style=flat-square" alt="HackinCodes"/>
  <img src="https://img.shields.io/badge/cWoc-Open%20Source-ff69b4?style=flat-square" alt="cWoc"/>
  <img src="https://img.shields.io/badge/Indie%20Hub-Main%20Partner-6e5494?style=flat-square" alt="Indie Hub"/>
  <img src="https://img.shields.io/badge/Open%20Source%20Community-Welcome-0052cc?style=flat-square" alt="Open Source Community"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&duration=4000&pause=600&color=F97316&center=true&vCenter=true&width=800&lines=---+AI-powered+Web3+Storytelling+on+the+Monad+Blockchain+---" alt="Animated Divider" />
</p>
<!-- markdownlint-enable MD033 -->

## What is Monad Mythics?

Monad Mythics is an open-source, AI-powered Web3 storytelling platform. Writers and artists can generate
immersive narratives or comic-style stories using Groq AI, then mint and trade them as NFTs on the
Monad blockchain. With a focus on ownership, authenticity, and community, Monad Mythics bridges the
world of creative writing, generative AI, and decentralized technology.

---

## Features

- **AI-Driven Story & Comic Generation**  
  Use Groq AI to generate stories or comic panel outlines by specifying title, genre, setting,
  characters, and themes. Both text and comic formats are supported.
- **NFT Minting on Monad Blockchain**  
  Seamlessly mint your stories as NFTs on Monad (Testnet live, Mainnet coming soon). Each NFT proves
  authenticity, ownership, and collectibility.
- **Community Gallery**  
  Publish your stories publicly, browse the gallery, and interact with other creators. Stories can
  be shared freely or as NFTs.
- **Customizable Prompts & Creativity Levels**  
  Fine-tune AI output by adjusting prompts, genres, outlines, and creativity settings to match your
  vision.
- **Wallet Integration**  
  Connect with MetaMask, WalletConnect, or Ledger for secure publishing and minting. Wallet is
  required for NFT actions.
- **Real-Time Story Streaming**  
  Watch your story unfold in real-time as Groq AI generates each segment.
- **Mobile-Friendly & Responsive UI**  
  Built with modern web technologies for a seamless experience on any device.
- **Extensible & Open Source**  
  Modular codebase with clear separation of frontend, backend, and smart contract logic.
  Contributions are welcome!

---

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, shadcn/ui
- **Backend:** Node.js, API Routes
- **AI:** Groq API (story generation), Unsplash API (optional visuals)
- **Blockchain:** Monad SDK, Solidity Smart Contracts
- **Database:** MongoDB
- **Hosting:** Vercel

---

## Quick Start

```bash
git clone https://github.com/Drago-03/GroqTales
cd GroqTales
npm install
cp .env.example .env.local
# Add GROQ_API_KEY, UNSPLASH key, Monad network if needed
npm run dev
```

1. Visit [http://localhost:3000](http://localhost:3000)
2. Connect your wallet (optional; required for minting/publishing)
3. Generate your story → Publish or Mint as NFT

See the [Wiki](https://github.com/Drago-03/GroqTales/wiki) for configuration, environment variables,
and deployment details.

---

## For Developers

- **Folder Structure:**
  - `/app` – Next.js application (pages, UI, routes)
  - `/components` – Reusable React components
  - `/contracts` – Solidity smart contracts for NFT minting
  - `/lib` – Utility functions and API integrations
  - `/public` – Static assets
  - `/test` and `/tests` – Test scripts and sample data
  - `/scripts` – Automation and deployment scripts

- **Environment Variables:**
  - `GROQ_API_KEY` – Your Groq AI API key
  - `UNSPLASH_API_KEY` – (Optional) for placeholder visuals
  - `MONAD_RPC_URL` – Monad blockchain RPC endpoint

- **Smart Contract Deployment:**
  - Contracts are written in Solidity and can be deployed to Monad Testnet/Mainnet.
  - See `/contracts` and `/scripts` for deployment instructions.

- **Extending AI Models:**
  - AI logic is modular—add support for new models or prompt types in `/lib` and `/components`.

- **Testing:**
  - Frontend: Use Jest/React Testing Library.
  - Smart Contracts: Use Hardhat/Foundry for Solidity tests.

- **Contributions:**
  - Issues are tagged by difficulty, area, and technology for easy onboarding.
  - Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CONTRIBUTORS.md](CONTRIBUTORS.md) before
    submitting PRs.

---

## 🤝 Contributing

GroqTales is community-powered!  
We welcome all contributions—whether you're a developer, designer, writer, or blockchain enthusiast.

**How You Can Help:**

- Tackle issues labeled `good first issue` (great for newcomers)
- Enhance story-generation logic, outlines, or UI design
- Add support for new AI models or blockchains
- Improve UX (dark mode, mobile layout, galleries)
- Optimize NFT metadata or IPFS workflows
- Write or improve documentation and tests

**What’s in It for You:**

- Build your open-source portfolio
- Feature your work in the contributors section
- Community recognition and GitHub Sponsors eligibility

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Roadmap

- AI visuals: Integrate Stable Diffusion/DALL·E for comic panels
- Multilingual story generation
- Native marketplace for story NFTs
- Enhanced wallet security & decentralized data storage
- Mobile app support
- More blockchain integrations

---

## Contributors

We value every contribution! Please read our [CONTRIBUTORS.md](CONTRIBUTORS.md) file before making
your first contribution to understand our guidelines and recognition process.

### Project Contributors

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://github.com/Drago-03/GroqTales/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Drago-03/GroqTales" alt="Contributors" />
  </a>
</p>

Thanks to these amazing people for making GroqTales better!

---

## Documentation & Architecture

### Core Documentation

- **Architecture Overview:** [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Comprehensive system design
  and technical architecture
- **Project Wiki:** [GitHub Wiki](https://github.com/Drago-03/GroqTales/wiki) - Detailed guides and
  documentation
- **API Documentation:** [Wiki/API](https://github.com/Drago-03/GroqTales/wiki/API) - Backend API
  reference
- **Smart Contracts:** [Wiki/Blockchain](https://github.com/Drago-03/GroqTales/wiki/Blockchain) -
  Contract documentation

### System Architecture

- **Frontend Architecture:**
  [ARCHITECTURE.md#frontend](docs/ARCHITECTURE.md#frontend-architecture) - Next.js application
  structure
- **Backend Architecture:** [ARCHITECTURE.md#backend](docs/ARCHITECTURE.md#backend-architecture) -
  API and service design
- **Blockchain Integration:**
  [ARCHITECTURE.md#blockchain](docs/ARCHITECTURE.md#blockchain-architecture) - Web3 and smart
  contract integration
- **AI Integration:** [ARCHITECTURE.md#ai](docs/ARCHITECTURE.md#ai-architecture) - Groq AI
  implementation
- **System Diagrams:** [ARCHITECTURE.md#diagrams](docs/ARCHITECTURE.md#system-diagrams) - Mermaid
  flowcharts and architecture diagrams

### Development Resources

- **Setup Guide:**
  [Wiki/Development-Setup](https://github.com/Drago-03/GroqTales/wiki/Development-Setup)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute to the project
- **Code of Conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- **Security Policy:** [SECURITY.md](SECURITY.md) - Security practices and vulnerability reporting

---

## Resources

- **Website:** [groqtales.xyz](https://www.groqtales.xyz)
- **Docs:** [Wiki](https://github.com/Drago-03/GroqTales/wiki)
- **Community Hub:** [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions)
- **Discord Support:** [Join our Discord](https://discord.gg/JK29FZRm)

---

## License

Released under the [MIT License](LICENSE).

---

## Security

For vulnerabilities or security-related issues, please refer to [SECURITY.md](SECURITY.md).

---

## Note

_GroqTales currently operates on Monad Testnet for NFT minting. Mainnet support coming soon—stay
tuned!_

---

<p align="center"><i>Support the project and share it with others.</i></p>
<!-- markdownlint-enable MD033 -->
