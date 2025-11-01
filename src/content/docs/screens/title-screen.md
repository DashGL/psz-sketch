---
title: Title Screen
description: The landing page and authentication flow for Density Dwarf
---

![Title Screen](/screenshots/title-screen.png)

The title screen is the first screen players encounter when visiting the root path (`/`) of Density Dwarf. It implements a frictionless, anonymous authentication system that allows players to start playing immediately without registration.

## Authentication Flow

The title screen handles the cryptographic authentication process entirely behind the scenes, creating a seamless experience for players.

### 1. Private Key Generation

When a player first navigates to `/`, the browser checks for an existing ED25519 private key in local storage:

- **If no key exists**: The browser generates a new ED25519 private key in JWK (JSON Web Key) format
- **If key exists**: The browser uses the existing key for authentication

This approach ensures each player has a unique cryptographic identity without requiring any user input.

### 2. Challenge-Response Authentication

Once the private key is available, the client initiates a challenge-response authentication flow:

1. **Public Key Transmission**: The client extracts the public key from the ED25519 key pair and sends it to the server
2. **Challenge Generation**: The server generates a random challenge (nonce) and sends it back to the client
3. **Challenge Signing**: The client signs the challenge using its ED25519 private key
4. **Session Creation**: The server verifies the signature using the public key and creates an authenticated session for the client

### 3. Session Management

After successful authentication, the server creates a session associated with the client's public key. The player is then redirected to the [Sync](/screens/sync) screen to download game assets before proceeding to [Character Select](/screens/character-select) where they can:

- Choose from existing characters or create a new one
- Play the game anonymously
- Maintain progress across browser sessions
- Migrate to a full account later if desired

## Benefits of This Approach

### Zero Friction Onboarding
- No sign-up forms
- No email verification
- No passwords to remember
- Instant play within seconds

### Security Without Compromise
- Cryptographic authentication using ED25519
- Challenge-response prevents replay attacks
- Private keys never leave the client
- Each session is cryptographically verified

### Future-Proof Identity
- Players can migrate their anonymous account to a full account later
- Private keys can be exported for account recovery
- Supports adding traditional authentication methods without losing progress

## Technical Implementation

The authentication system uses modern web cryptography APIs:

- **ED25519**: Modern elliptic curve signature algorithm providing strong security with small key sizes
- **JWK Format**: Standard JSON format for representing cryptographic keys
- **Local Storage**: Browser storage for persisting the private key across sessions

This implementation provides a balance between user experience and security, allowing players to start playing immediately while maintaining the integrity of the game's authentication system.
