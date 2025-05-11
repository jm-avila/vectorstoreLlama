# VectorStore-Llama

A document-based conversational agent that leverages the power of vector embeddings to provide context-aware responses. This project implements a Retrieval-Augmented Generation (RAG) system using LlamaIndex and Google's Gemini AI.

## Features

- Document indexing and storage using LlamaIndex vector database
- Persistent storage of vector embeddings
- Conversation-based interaction through a CLI interface
- Integration with Google's Gemini AI model
- Modular architecture with clear separation of concerns

## Prerequisites

- Node.js (v18 or higher)
- TypeScript
- Google Gemini API key

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/vectorstore-llama.git
   cd vectorstore-llama
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Add your Gemini API key to the `.env` file:
   ```
   LLM_GEMINI_API_KEY=your_api_key_here
   LLM_GEMINI_MODEL_NAME=gemini-2.0-flash
   ```

## Usage

1. Start the application:

   ```bash
   npm start
   ```

2. Interact with the agent through the command line interface:

   ```
   You: What information do you have about TypeScript?
   AI: [Response based on indexed documents]
   ```

3. Type `exit` to end the conversation.

## Project Structure

- `src/index.ts` - Entry point and CLI interface
- `src/rag.ts` - Document indexing and RAG functionality
- `src/graph.ts` - LangChain graph-based conversation flow
- `src/tools.ts` - Tools for the agent to use
- `src/nodes.ts` - Graph nodes for the conversation agent
- `src/config.ts` - Configuration management
- `src/interface.ts` - Type definitions and interfaces
- `src/navigation.ts` - File system navigation for document loading
- `src/state.ts` - State management for the conversation
- `docs/` - Sample documents for testing (currently includes tmux documentation)
- `storage/` - Persistent storage for vector embeddings and index data

## Adding Your Own Documents

The system is designed to index documents from the `docs/` directory. You can:

1. Add your own text documents to the `docs/` directory
2. The system will automatically index these documents on first run
3. Vector embeddings will be stored in the `storage/` directory for future use
4. If you need to re-index documents, delete the contents of the `storage/` directory

## License

ISC
