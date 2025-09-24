# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Supported Versions

Active full support: 1.1.2 (latest), 1.1.1 (previous). Security maintenance (critical fixes only): 1.1.0. All versions < 1.1.0 are End of Security Support (EoSS). See `SECURITY.md` for the evolving support policy.

## [Unreleased]

_Planned changes will appear here before the next tagged release._
## [1.2.0] - 2025-09-05

## [1.1.2] - 2025-08-08

### Patch Summary

Codebase integrity restoration and build stabilization after widespread comment / syntax corruption in multiple UI, hook, and blockchain agent files.

### Technical Improvements (1.1.2)

- Fixed malformed block comments that broke TypeScript parsing across many files (hooks, libs, UI components, onchain agent files)
- Repaired corrupted hook/function declarations (`useChart`, `Skeleton`, `useAgent`, `useMonad`, pagination, chart, logger, API utilities)
- Cleaned duplicated / stray exports and invalid JSX remnants in `stories/page.tsx`
- Normalized JSDoc formatting to prevent future `*/ expected` compiler errors
- Consolidated duplicate exports in chart & pagination components
- Rewrote corrupted `route.ts` for onchain agent (added clean `POST` handler) and created safe temporary replacement

### Bug Fixes (1.1.2)

- Resolved 116 TypeScript build errors (unclosed comments, unterminated regex, unexpected tokens)
- Eliminated invalid mixed hook declarations appended after context creation lines
- Removed duplicated React imports and rogue inline hook definitions inside variable declarations
- Fixed metadata + client component conflict on Stories page
- Ensured all updated files pass `tsc --noEmit`

### Developer Experience (1.1.2)

- Consistent comment style reduces likelihood of parser breakage
- Removed confusing placeholder / duplicated blocks to simplify future diffs
- Introduced safer server/client separation in stories page wrapper

### Files Affected (Representative)

`components/ui/{chart.tsx,pagination.tsx,skeleton.tsx,calendar.tsx,carousel.tsx}`  
`components/story-summary-backup.tsx`  
`hooks/{use-groq.ts,use-monad.ts,use-story-analysis.ts,use-story-summary.ts}`  
`src/blockchain/onchain-agent/app/hooks/useAgent.ts`  
`lib/{api-utils.ts,constants.ts,logger-broken.ts,mock-data-backup.ts,transaction-components.ts}`  
`app/stories/page.tsx`  
`src/blockchain/onchain-agent/app/api/agent/{route.new.ts,create-agent.ts,prepare-agentkit.ts}`

### Notes

- No public API surface changes intended; all changes are internal quality / build health.

---

## [1.1.1] - 2025-08-05

### Major Changes (1.1.1)
- **Production Deployment Focus**: Removed all blockchain/Web3 functionality to focus on core AI storytelling features
- **GROQ-Only Integration**: Eliminated LLAMA support, maintaining only GROQ API for story generation
- **Clean Architecture**: Commented out all onchain scripts and wallet mockups for streamlined deployment

### Technical Improvements (1.1.1)

- **Build Stability**: Fixed all `GROQ_MODELS.LLAMA_3_70B` compilation errors
  - Updated API routes to use existing GROQ models (`STORY_GENERATION`, `RECOMMENDATIONS`, `STORY_ANALYSIS`)
  - Added `generateContentCustom()` function for flexible GROQ API calls
- **TypeScript Fixes**: Resolved parsing errors in dialog components
  - Fixed malformed interface definitions in `story-comments-dialog.tsx` and `story-details-dialog.tsx`
  - Eliminated build-blocking syntax errors

### Blockchain/Web3 Functionality - Temporarily Disabled

- **NFT Minting**: Disabled `app/api/monad/mint/route.ts` - returns 503 status with "temporarily disabled" message
- **Wallet Integration**: Replaced `components/connect-wallet-button.tsx` with placeholder showing "Wallet (Coming Soon)"
- **NFT Marketplace**: Commented out `components/nft-marketplace.tsx` and `components/nft-purchase.tsx`
- **Web3 Provider**: Replaced `components/providers/web3-provider.tsx` with stub implementation
- **Blockchain Services**: Disabled `lib/monad-service.ts` with preserved original code in comments
- **Web3 Hooks**: Removed `hooks/use-web3-auth.ts` completely

### File Changes

- **Removed Files**:
  - `hooks/use-web3-auth.ts` - Web3 authentication hook (completely removed)
- **Modified Files**:
  - `app/api/monad/mint/route.ts` - NFT minting endpoint (disabled)
  - `components/connect-wallet-button.tsx` - Wallet connection (placeholder)
  - `components/nft-marketplace.tsx` - NFT marketplace (disabled)
  - `components/nft-purchase.tsx` - NFT purchasing (disabled)
  - `components/providers/web3-provider.tsx` - Web3 context (stub implementation)
  - `lib/monad-service.ts` - Blockchain service (disabled)
  - `lib/groq-service.ts` - Enhanced with generateContentCustom function
  - `app/layout.tsx` - Uses disabled Web3Provider

### Bug Fixes (1.1.1)

- **API Routes**: Fixed story generation endpoints using undefined GROQ models
- **Component Imports**: Updated all Web3-related component imports to use disabled versions
- **Interface Definitions**: Fixed broken TypeScript interfaces causing parsing errors

### Developer Experience (1.1.1)

- **Code Preservation**: All original blockchain functionality preserved in comments for future restoration
- **Clean Separation**: Blockchain features cleanly disabled without affecting core AI functionality
- **Build Process**: Resolved all compilation errors for successful production deployment

### Deployment (1.1.1)

- **Production Ready**: Application now builds successfully without Web3 dependencies
- **Simplified Stack**: Focus on core AI storytelling features using GROQ API
- **Public Deployment**: Ready for deployment without blockchain complexity

### Migration Notes (1.1.1)

- **Blockchain Features**: All Web3/blockchain functionality is temporarily disabled but preserved in code comments
- **API Changes**: Story generation now exclusively uses GROQ API models
- **Component Behavior**: Wallet and NFT components show "disabled" or "coming soon" messages
- **Future Restoration**: Original blockchain code can be easily restored by uncommenting preserved implementations

---

## [1.1.0] - 2025-08-02

### Major Changes (1.1.0)

- **Codebase Reorganization**: Complete restructuring of project files into organized directories
- **SSR/Deployment Fix**: Resolved critical "document is not defined" errors affecting Vercel deployment
- **Enhanced Security**: Updated security policies and best practices documentation

### New Features (1.1.0)

- **Organized Directory Structure**: 
  - Created `src/blockchain/` for Web3 and blockchain-related files
  - Created `src/ai/` for AI model training and processing scripts
  - Created `src/data/` for datasets and training configurations
  - Created `src/tools/` for utility and development scripts
  - Created `deployment/` for deployment configurations
- **Version Management**: Added VERSION file and comprehensive changelog tracking
- **Architecture Documentation**: Enhanced with Mermaid flowcharts and improved organization

### Technical Improvements (1.1.0)

- **SSR Compatibility**: Fixed all server-side rendering issues in React components
  - Protected `window`, `document`, `navigator`, and `localStorage` access with proper guards
  - Added SSR-safe patterns for browser API access
  - Implemented proper client-side hydration patterns
- **Component Stability**: Enhanced reliability of core components:
  - `galaxy-background.tsx`: Fixed animation coordinate calculations for SSR
  - `header.tsx`: Protected scroll event listeners and localStorage access
  - `ai-story-generator.tsx`: Fixed URL parameters, clipboard, and download functionality
  - `admin-login-modal.tsx`: Protected all storage APIs and document access
  - `wallet-connect.tsx`: Fixed clipboard API access patterns

### Bug Fixes (1.1.0)

- **Deployment Errors**: Resolved ReferenceError during static page generation
- **Browser API Access**: Added proper feature detection for all browser-specific APIs
- **Storage Operations**: Protected localStorage and sessionStorage operations
- **Navigation**: Fixed client-side navigation and URL manipulation

### File Organization (1.1.0)

- **Moved Files**:
  - `blockchain_data_fetch.js` → `src/blockchain/`
  - `nft_data_fetch.js` → `src/blockchain/`
  - `clients.ts` → `src/blockchain/`
  - `main.py` → `src/ai/`
  - `train_groq_model.py` → `src/ai/`
  - `requirements.txt` → `src/ai/`
  - Training datasets → `src/data/`
  - Utility scripts → `src/tools/`

### Security Updates (1.1.0)

- **Enhanced Security Policies**: Updated SECURITY.md with current best practices
- **Secure Session Management**: Improved admin authentication with proper token handling
- **Protected API Access**: Added security checks for browser API access

### Documentation (1.1.0)

- **README Enhancement**: Added architecture links and improved navigation
- **Architecture Documentation**: Enhanced with detailed Mermaid diagrams
- **Wiki Integration**: Improved cross-referencing between documentation sections

### Developer Experience (1.1.0)

- **Build Process**: Improved build reliability and error handling
- **Code Organization**: Better separation of concerns and maintainability
- **Development Workflow**: Enhanced with proper file structure and conventions

### Deployment (1.1.0)

- **Vercel Compatibility**: Fixed all deployment blocking issues
- **SSR/SSG Support**: Proper Next.js rendering patterns implemented
- **Production Ready**: Stable deployment configuration established

### Performance (1.1.0)

- **Bundle Optimization**: Improved code splitting and loading patterns
- **Rendering Performance**: Enhanced SSR/client hydration efficiency
- **Resource Loading**: Optimized browser API access patterns

### Migration Notes (1.1.0)

- **File Paths**: Updated import paths to reflect new directory structure
- **Configuration**: Updated build and deployment configurations
- **Dependencies**: Maintained all existing functionality while improving organization

---

## [1.0.0] - 2025-02-04

### Initial Release
- Core GroqTales platform functionality
- AI-powered story generation
- NFT marketplace integration
- Web3 wallet connectivity
- Community features and user profiles
- Admin dashboard and management tools

---

### Version Format
- **Major.Minor.Patch** (e.g., 1.1.0)
- **Major**: Breaking changes or significant new features
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes and small improvements

### Categories
- **Major Changes**: Significant new features or breaking changes
- **New Features**: New functionality added
- **Technical Improvements**: Code quality and architecture improvements  
- **Bug Fixes**: Issues resolved
- **File Organization**: Structure and organization changes
- **Security Updates**: Security-related improvements
- **Documentation**: Documentation improvements
- **Developer Experience**: Development workflow improvements
- **Deployment**: Deployment and infrastructure changes
- **Performance**: Performance optimizations
- **Migration Notes**: Important notes for updating
