# DocuExplain AI — AI-Powered Document Tutor

DocuExplain AI is a full-stack document question-answering application that helps users understand PDF documents by asking questions in natural language. It retrieves relevant content from the selected document and uses a locally hosted Large Language Model (LLM) to generate simple, context-aware answers with source-page citations.

The project uses **Retrieval-Augmented Generation (RAG)** to ground answers in document content and make it easier to verify the information.

## Features

- **PDF Upload:** Upload and work with one PDF document at a time.
- **PDF Text Extraction:** Extract selectable text and page metadata using Apache PDFBox.
- **Text Chunking:** Split document text into overlapping chunks for retrieval.
- **Semantic Embeddings:** Generate embeddings using `nomic-embed-text`.
- **Context-Aware Answers:** Retrieve relevant document chunks and generate answers using `llama3.2:3b`.
- **Source Citations:** Display source-page references to help users verify answers.
- **Chat History:** Persist document-related chat history in MySQL.
- **Answer Status Handling:** Handle out-of-scope questions and partial-answer scenarios.
- **React Interface:** Interact with documents through a web-based upload and chat interface.
- **Local AI Processing:** Run language-model inference locally through Ollama.

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Java 21, Spring Boot |
| Frontend | React, JavaScript, Vite |
| Database | MySQL 8 |
| PDF Processing | Apache PDFBox |
| LLM Runtime | Ollama |
| Chat Model | `llama3.2:3b` |
| Embedding Model | `nomic-embed-text` |
| Retrieval | In-memory cosine similarity search |
| Build Tool | Maven |
| Package Manager | npm |

## Architecture

The application follows a frontend-backend architecture with a retrieval-augmented generation pipeline.

1. **Upload:** The user selects a PDF through the React frontend.
2. **Extraction:** The Spring Boot backend extracts text and page metadata using PDFBox.
3. **Chunking:** Extracted text is divided into overlapping chunks.
4. **Embedding:** Ollama generates vector embeddings for the chunks.
5. **Storage:** Document information, chunks, embeddings, and chat history are stored in MySQL.
6. **Retrieval:** When the user asks a question, the backend retrieves relevant chunks using cosine similarity.
7. **Generation:** The retrieved content is sent to the Ollama chat model to generate an answer.
8. **Citation:** The application returns source-page references alongside the answer.

## Requirements

Install the following before running the project:

- Java Development Kit (JDK) 21
- Apache Maven 3.9 or later
- Node.js 20 or later
- MySQL 8 or Docker Desktop
- Ollama

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd docuexplain-ai
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your actual GitHub repository URL.

### 2. Install and start Ollama

Download Ollama from [https://ollama.com/](https://ollama.com/).

Pull the chat and embedding models:

```powershell
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

Ensure Ollama is running locally at:

```text
http://localhost:11434
```

Ollama normally starts its local service automatically after installation. If necessary, start it using:

```powershell
ollama serve
```

If the service is already running, do not start a second instance.

### 3. Configure environment variables

The backend uses Ollama's OpenAI-compatible API endpoints. This does **not** mean that an OpenAI account or API key is required.

Open a PowerShell terminal and set the variables:

```powershell
$env:AI_API_KEY="ollama"
$env:AI_BASE_URL="http://localhost:11434/v1"
$env:AI_CHAT_MODEL="llama3.2:3b"
$env:AI_EMBEDDING_MODEL="nomic-embed-text"
```

These values are for the current local Ollama configuration. The placeholder API key is not a real credential.

Run these commands in the same terminal session used to start the backend.

> Note: Confirm that the application's Spring Boot configuration reads these exact environment variable names. If your configuration uses different names, update the commands accordingly.

### 4. Start MySQL

If the repository includes a Docker Compose configuration for MySQL, run the following command from the project root:

```powershell
docker compose up -d mysql
```

Alternatively, use a local MySQL 8 installation.

Ensure that:

- MySQL is running.
- The `docuexplain` database exists or is created by your application configuration.
- The database username and password match the backend configuration.

Do not commit database passwords or other secrets to the repository.

### 5. Start the Spring Boot backend

Open a terminal at the project root:

```powershell
cd backend
mvn spring-boot:run
```

Wait for Spring Boot to finish starting before using the frontend.

### 6. Start the React frontend

Open a separate terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

### 7. Open the application

Visit the local development URL:

[http://localhost:5173](http://localhost:5173)

You can now upload a PDF and ask questions about its contents.

## Project Structure

The project is organized into separate backend and frontend applications.

```text
docuexplain-ai/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

This is an illustrative structure. Your repository may contain additional files or slightly different directories.

## Retrieval-Augmented Generation (RAG)

DocuExplain AI uses a RAG workflow to retrieve document content before generating an answer.

- **Chunking:** Divide extracted PDF text into smaller, overlapping segments.
- **Embedding:** Convert each chunk into a vector representation using `nomic-embed-text`.
- **Similarity Search:** Compare the question embedding with stored document embeddings using cosine similarity.
- **Context Construction:** Select relevant chunks and pass them to the chat model.
- **Answer Generation:** Use `llama3.2:3b` to generate an answer grounded in the retrieved context.
- **Source References:** Return page references associated with the retrieved document content.

The current implementation uses in-memory cosine similarity search over vectors stored in MySQL. It does not use a dedicated vector database.

## Important Limitations

DocuExplain AI is a **learning MVP**, not a production-hardened application.

- **Single-document workflow:** The application is designed to work with one selected PDF at a time.
- **Scanned PDFs:** PDFs without selectable text are detected and rejected with an explanatory message. OCR is not currently implemented.
- **Retrieval scalability:** The current implementation scans stored vectors in memory for each question. A dedicated vector database may be more suitable for larger document collections.
- **Similarity threshold:** Retrieval thresholds are heuristic and should be evaluated against a representative test dataset.
- **Answer reliability:** RAG and source citations can improve traceability but do not guarantee that every generated claim is correct.
- **Authentication:** User authentication and document ownership controls are not implemented.
- **File storage:** Durable object storage is not implemented.
- **Background processing:** Document processing does not use a dedicated background-job system.
- **Production operations:** Additional testing, monitoring, migrations, rate limiting, upload limits, and independent claim verification are needed before public deployment.

## Future Improvements

Potential improvements include:

- User authentication and authorization
- OCR support for scanned PDFs
- A dedicated vector database such as Qdrant
- Background processing for large documents
- Stronger citation validation and answer verification
- Unit and integration testing
- Docker-based deployment for the complete application
- Improved error handling, logging, and monitoring
- Deployment to a hosting environment

## Security Notes

- Do not commit API keys, database passwords, or other secrets to GitHub.
- Keep local configuration and credentials outside source control.
- Ollama's local API is configured here for local development; a public deployment requires appropriate access controls and security review.
- Add authentication, authorization, upload limits, and other production safeguards before exposing the application publicly.

## Learning Outcomes

Building this project provides practical experience with:

- Java and Spring Boot backend development
- REST API integration
- React frontend development
- MySQL persistence
- PDF parsing and document processing
- Embeddings and semantic retrieval
- Retrieval-Augmented Generation (RAG)
- Local LLM integration using Ollama

## Author

**Hamza Alam**


---

*DocuExplain AI — making complex documents easier to understand.*