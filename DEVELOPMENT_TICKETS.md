# AI Paper Partner - Development Tickets (MVP v0)

> 根據 planning document 規劃的前後端開發票，按照依賴關係和優先級排序

---

## Backend Tickets

### BE-001: 專案基礎架構設置
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
建立 FastAPI 專案基礎架構，包含專案結構、配置管理、logging 設定

**Tasks:**
- [ ] 建立 FastAPI 專案目錄結構
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── config.py
  │   ├── api/
  │   │   ├── __init__.py
  │   │   └── v1/
  │   │       ├── __init__.py
  │   │       ├── endpoints/
  │   ├── models/
  │   ├── schemas/
  │   ├── services/
  │   └── utils/
  ├── tests/
  ├── requirements.txt
  └── pyproject.toml
  ```
- [ ] 設定 requirements.txt (FastAPI, uvicorn, SQLAlchemy, pymilvus, PyPDF2, etc.)
- [ ] 建立 config.py 讀取環境變數
- [ ] 設定 logging 機制
- [ ] 建立 main.py with CORS, error handling middleware
- [ ] 建立健康檢查 endpoint: `GET /health`

**Acceptance Criteria:**
- [ ] FastAPI server 可以啟動在 port 8000
- [ ] `/health` endpoint 回傳 200 status
- [ ] 環境變數可以正確讀取
- [ ] Logging 正常運作

**Dependencies:** None

---

### BE-002: PostgreSQL 資料庫連線與 ORM 設定
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
設定 PostgreSQL 資料庫連線，建立 SQLAlchemy ORM 基礎設定

**Tasks:**
- [ ] 設定 SQLAlchemy database engine 和 session
- [ ] 建立 database.py 管理 DB connection
- [ ] 建立 Base model class
- [ ] 設定 Alembic 進行資料庫 migration
- [ ] 建立初始 migration
- [ ] 設定 docker-compose.yml 加入 PostgreSQL service

**Acceptance Criteria:**
- [ ] 可以連線到 PostgreSQL
- [ ] Alembic migration 可以正常執行
- [ ] Database session 可以正常建立和關閉

**Dependencies:** BE-001

---

### BE-003: 建立資料庫 Models (Project, Paper, Chunk, Conversation)
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 6-8 hours

**Description:**
根據 planning document 的 schema 設計，建立所有資料庫 models

**Tasks:**
- [ ] 建立 `Project` model
  ```python
  - project_id (UUID, PK)
  - user_id (String)
  - name (String)
  - description (Text)
  - objectives (JSON)
  - project_tags (Array[String])
  - created_at (DateTime)
  - updated_at (DateTime)
  ```
- [ ] 建立 `Paper` model
  ```python
  - paper_id (UUID, PK)
  - project_id (UUID, FK)
  - title (String)
  - authors (String)
  - source_file_path (String)
  - upload_user (String)
  - upload_time (DateTime)
  ```
- [ ] 建立 `Chunk` model
  ```python
  - chunk_id (UUID, PK)
  - paper_id (UUID, FK)
  - chunk_index (Integer)
  - text (Text)
  - char_start (Integer)
  - char_end (Integer)
  - page_start (Integer)
  - page_end (Integer)
  - milvus_vector_id (String)  # reference to Milvus
  - created_at (DateTime)
  ```
- [ ] 建立 `Conversation` model
  ```python
  - conv_id (UUID, PK)
  - project_id (UUID, FK)
  - user_id (String)
  - messages (JSON)  # [{role, content, timestamp}]
  - last_updated (DateTime)
  - created_at (DateTime)
  ```
- [ ] 建立 relationships (Project -> Papers, Paper -> Chunks, Project -> Conversations)
- [ ] 建立對應的 Pydantic schemas (request/response models)

**Acceptance Criteria:**
- [ ] 所有 models 可以正確建立對應的資料表
- [ ] Foreign key relationships 正確設定
- [ ] Pydantic schemas 可以正確序列化/反序列化

**Dependencies:** BE-002

---

### BE-004: Milvus 向量資料庫連線設定
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
設定 Milvus 向量資料庫連線，建立 collection schema

**Tasks:**
- [ ] 建立 milvus_client.py 管理 Milvus 連線
- [ ] 定義 Milvus collection schema for embeddings
  ```python
  - id (VarChar, PK)
  - chunk_id (VarChar)
  - paper_id (VarChar)
  - embedding (FloatVector, dim=1024 for gemma or 1536 for OpenAI)
  ```
- [ ] 建立 collection with cosine similarity index
- [ ] 實作 connection health check
- [ ] 處理連線錯誤和重試機制

**Acceptance Criteria:**
- [ ] 可以成功連線到 Milvus (docker-compose 啟動的)
- [ ] Collection 可以成功建立
- [ ] 可以執行基本的 insert/search 操作

**Dependencies:** BE-001

---

### BE-005: Project CRUD API
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 6-8 hours

**Description:**
實作 Project 的 CRUD API endpoints

**Tasks:**
- [ ] 實作 `POST /api/projects` - 建立新專案
  - Request: `{name, description, objectives, project_tags, user_id}`
  - Response: `{project_id, ...project_data}`
- [ ] 實作 `GET /api/projects` - 列出所有專案 (支援 pagination, filtering)
- [ ] 實作 `GET /api/projects/{project_id}` - 取得特定專案詳情
- [ ] 實作 `PUT /api/projects/{project_id}` - 更新專案
- [ ] 實作 `DELETE /api/projects/{project_id}` - 刪除專案 (cascade delete)
- [ ] 建立對應的 service layer functions
- [ ] 撰寫單元測試

**Acceptance Criteria:**
- [ ] 所有 endpoints 正常運作
- [ ] 回傳正確的 HTTP status codes
- [ ] 錯誤處理完善 (404, 400, 500)
- [ ] API 符合 RESTful 設計原則
- [ ] 單元測試覆蓋率 > 80%

**Dependencies:** BE-003

---

### BE-006: PDF 上傳與儲存服務
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 6-8 hours

**Description:**
實作 PDF 檔案上傳功能，包含檔案驗證、儲存、metadata 擷取

**Tasks:**
- [ ] 實作 `POST /api/projects/{project_id}/upload` endpoint
  - Accept multipart/form-data with PDF file
  - Validate file type and size (max 50MB)
- [ ] 建立檔案儲存系統 (local filesystem or S3-compatible)
  - Path structure: `uploads/{project_id}/{paper_id}.pdf`
- [ ] 使用 PyPDF2 或 pdfplumber 擷取 PDF metadata
  - Title, Author, Page count
- [ ] 建立 Paper record 在 PostgreSQL
- [ ] 實作檔案清理機制 (當 paper 被刪除時)
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] 可以成功上傳 PDF 檔案
- [ ] 檔案儲存在正確的路徑
- [ ] Paper metadata 正確儲存到資料庫
- [ ] 不接受非 PDF 檔案
- [ ] 檔案大小限制正常運作

**Dependencies:** BE-005

---

### BE-007: PDF Chunking 服務
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 8-10 hours

**Description:**
實作將 PDF 文件切分成 chunks 的服務

**Tasks:**
- [ ] 建立 chunking service (chunking_service.py)
- [ ] 實作基本 fixed-size chunking 策略
  - Chunk size: 512-1024 characters
  - Overlap: 128-256 characters
- [ ] 擷取每個 chunk 的 metadata
  - char_start, char_end
  - page_start, page_end
  - chunk_index
- [ ] 處理跨頁的 chunks
- [ ] 將 chunks 儲存到 PostgreSQL
- [ ] 建立 background task 機制 (使用 Celery 或 FastAPI BackgroundTasks)
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] PDF 可以正確切分成 chunks
- [ ] Chunk metadata 正確記錄
- [ ] Chunks 正確儲存到資料庫
- [ ] Chunking 作為背景任務執行，不阻塞 upload API
- [ ] 處理各種 PDF 格式 (文字、掃描檔等)

**Dependencies:** BE-006

---

### BE-008: Embedding 服務
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 8-10 hours

**Description:**
實作文字 embedding 服務，支援多種 embedding models

**Tasks:**
- [ ] 建立 embedding service (embedding_service.py)
- [ ] 實作 OpenAI embedding 整合
  - text-embedding-3-large or text-embedding-3-small
- [ ] (Optional) 實作 Gemma embedding 整合
- [ ] 實作 batch embedding (減少 API 呼叫次數)
- [ ] 處理 rate limiting 和錯誤重試
- [ ] 將 embeddings 儲存到 Milvus
- [ ] 更新 Chunk 的 milvus_vector_id
- [ ] 建立 background task 整合
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] 可以成功產生 text embeddings
- [ ] Embeddings 正確儲存到 Milvus
- [ ] milvus_vector_id 正確更新到 Chunk model
- [ ] 處理 API rate limiting
- [ ] Batch processing 正常運作

**Dependencies:** BE-004, BE-007

---

### BE-009: Retriever 服務
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 6-8 hours

**Description:**
實作向量檢索服務，根據 query 找出最相關的 chunks

**Tasks:**
- [ ] 建立 retriever service (retriever_service.py)
- [ ] 實作 query embedding
- [ ] 實作 Milvus vector search (cosine similarity)
  - 回傳 top-K chunks (K=3-5)
  - Filter by project_id or paper_id
- [ ] 將 Milvus results 與 PostgreSQL chunks join
- [ ] 實作相關性分數計算和排序
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] 可以根據 query 找到相關的 chunks
- [ ] 回傳的 chunks 包含完整的 text 和 metadata
- [ ] 相關性排序正確
- [ ] 可以正確 filter by project_id

**Dependencies:** BE-008

---

### BE-010: RAG Context Builder
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
建立 RAG context builder，將 retrieved chunks 組成 LLM prompt

**Tasks:**
- [ ] 建立 context builder service
- [ ] 設計 prompt template
  ```
  Based on the following context from research papers, answer the user's question.

  Context:
  {chunks with source citations}

  Question: {user_query}

  Instructions:
  - Provide accurate answer based on the context
  - Cite sources using [Paper Title, Page X]
  - If context doesn't contain answer, say so
  ```
- [ ] 實作 token counting (確保不超過 model context limit)
- [ ] 實作 chunk 截斷策略 (如果 context 太長)
- [ ] 加入 source citation formatting

**Acceptance Criteria:**
- [ ] Prompt 格式正確
- [ ] Context 不超過 token limit
- [ ] Source citations 正確格式化

**Dependencies:** BE-009

---

### BE-011: LLM Integration Service
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 8-10 hours

**Description:**
整合 LLM API (OpenAI, Claude, Gemini) 用於生成回答

**Tasks:**
- [ ] 建立 llm service (llm_service.py)
- [ ] 實作 OpenAI ChatCompletion 整合
- [ ] 實作 Claude Messages API 整合
- [ ] 實作 Gemini API 整合
- [ ] 建立統一的 LLM interface (可切換 model)
- [ ] 實作 streaming response support
- [ ] 處理 API errors 和 rate limiting
- [ ] 實作 token usage tracking
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] 可以成功呼叫各種 LLM APIs
- [ ] 統一的 interface 可以切換不同 models
- [ ] Streaming response 正常運作
- [ ] Error handling 完善

**Dependencies:** BE-010

---

### BE-012: Chat API with Multi-turn Conversation
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 10-12 hours

**Description:**
實作完整的 Chat API，支援多輪對話和 RAG pipeline

**Tasks:**
- [ ] 實作 `POST /api/projects/{project_id}/chat` endpoint
  - Request: `{query, conv_id (optional), model (optional)}`
  - Response: `{answer, sources[], conv_id, usage}`
- [ ] 整合 RAG pipeline
  1. 接收 user query
  2. 呼叫 Retriever 取得 relevant chunks
  3. 使用 Context Builder 組成 prompt
  4. 呼叫 LLM 生成回答
  5. 回傳 answer + sources
- [ ] 實作對話歷史管理
  - 如果提供 conv_id，載入歷史訊息
  - 將新的 Q&A 加入對話歷史
  - 儲存到 Conversation model
- [ ] 實作對話記憶機制 (保留最近 N 輪對話)
- [ ] 實作 streaming response endpoint (WebSocket or SSE)
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] Chat API 正常運作
- [ ] RAG pipeline 完整執行
- [ ] 回傳的 answer 包含 source citations
- [ ] 多輪對話正確維護 context
- [ ] Streaming response 正常運作

**Dependencies:** BE-009, BE-010, BE-011

---

### BE-013: Conversation History APIs
**Priority:** P1
**Complexity:** Low
**Estimated Time:** 3-4 hours

**Description:**
實作對話歷史查詢 APIs

**Tasks:**
- [ ] 實作 `GET /api/projects/{project_id}/conversations`
  - 列出專案內所有對話
  - 支援 pagination
- [ ] 實作 `GET /api/conversations/{conv_id}`
  - 取得特定對話的完整歷史
- [ ] 實作 `DELETE /api/conversations/{conv_id}`
  - 刪除對話
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] 可以列出所有對話
- [ ] 可以取得對話詳情
- [ ] Pagination 正常運作
- [ ] 可以刪除對話

**Dependencies:** BE-012

---

### BE-014: Paper Chunks Query API
**Priority:** P1
**Complexity:** Low
**Estimated Time:** 2-3 hours

**Description:**
實作查詢特定 paper 的 chunks

**Tasks:**
- [ ] 實作 `GET /api/papers/{paper_id}/chunks`
  - Query params: page, limit
  - Response: chunks with metadata
- [ ] 撰寫測試

**Acceptance Criteria:**
- [ ] 可以查詢 paper 的所有 chunks
- [ ] Pagination 正常運作
- [ ] 回傳完整的 chunk metadata

**Dependencies:** BE-007

---

## Frontend Tickets

### FE-001: React 專案基礎架構設置
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
建立 React 專案基礎架構，使用 Vite + TypeScript

**Tasks:**
- [ ] 使用 Vite 建立 React + TypeScript 專案
- [ ] 設定專案目錄結構
  ```
  frontend/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── services/
  │   ├── hooks/
  │   ├── contexts/
  │   ├── types/
  │   ├── utils/
  │   ├── App.tsx
  │   └── main.tsx
  ├── public/
  ├── package.json
  └── tsconfig.json
  ```
- [ ] 安裝必要的 dependencies
  - React Router v6
  - Axios or Fetch wrapper
  - UI library (Tailwind CSS + shadcn/ui or Material-UI)
  - React Query (for data fetching)
- [ ] 設定 TypeScript 嚴格模式
- [ ] 設定 ESLint + Prettier
- [ ] 設定環境變數 (VITE_API_BASE_URL)

**Acceptance Criteria:**
- [x] React app 可以正常啟動
- [x] TypeScript 編譯正常
- [x] ESLint 和 Prettier 正常運作
- [x] 可以讀取環境變數

**Dependencies:** None

---

### FE-002: API Client 與 Type Definitions
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
建立 API client 和 TypeScript type definitions

**Tasks:**
- [ ] 建立 API client (src/services/api.ts)
  - Axios instance with base URL
  - Request/Response interceptors
  - Error handling
- [ ] 定義 TypeScript types (src/types/)
  ```typescript
  // types/project.ts
  interface Project {
    project_id: string;
    name: string;
    description: string;
    objectives: any;
    project_tags: string[];
    created_at: string;
  }

  // types/paper.ts
  interface Paper {
    paper_id: string;
    project_id: string;
    title: string;
    authors: string;
    upload_time: string;
  }

  // types/conversation.ts
  interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: Source[];
  }

  interface Conversation {
    conv_id: string;
    project_id: string;
    messages: Message[];
    last_updated: string;
  }
  ```
- [ ] 建立 API service functions
  - projectService.ts (CRUD operations)
  - paperService.ts (upload, list)
  - chatService.ts (send message)
  - conversationService.ts (list, get)

**Acceptance Criteria:**
- [ ] API client 可以正確發送 requests
- [ ] TypeScript types 定義完整
- [ ] Error handling 正常運作
- [ ] 所有 API service functions 定義完成

**Dependencies:** FE-001

---

### FE-003: Routing 與 Layout 設定
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
設定 React Router 和基本 layout 結構

**Tasks:**
- [ ] 設定 React Router routes
  ```
  / -> Home/Projects List
  /projects/new -> Create Project
  /projects/:projectId -> Project Detail (with nested routes)
    /projects/:projectId/papers -> Papers List
    /projects/:projectId/upload -> Upload Paper
    /projects/:projectId/chat -> Chat Interface
    /projects/:projectId/settings -> Settings
  ```
- [ ] 建立 Layout components
  - MainLayout (header, sidebar, content area)
  - ProjectLayout (project-specific sidebar)
- [ ] 建立 Navigation components
  - TopBar (app logo, user menu)
  - Sidebar (project navigation)
- [ ] 實作 404 Not Found page

**Acceptance Criteria:**
- [ ] Routing 正常運作
- [ ] Layout 在所有頁面正確顯示
- [ ] Navigation 正常運作
- [ ] 404 page 正常顯示

**Dependencies:** FE-002

---

### FE-004: Projects List 頁面
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 6-8 hours

**Description:**
實作專案列表頁面，參考 wireframe project_page.png

**Tasks:**
- [ ] 建立 ProjectsListPage component
- [ ] 使用 React Query 取得 projects list
- [ ] 實作 project cards grid layout
  - 顯示: name, description, tags, created_at
  - Actions: Open, Delete
- [ ] 實作搜尋和篩選功能
- [ ] 實作分頁
- [ ] 實作 loading 和 error states
- [ ] 實作 empty state (沒有 projects 時)
- [ ] 加入 "Create New Project" button

**Acceptance Criteria:**
- [ ] 可以顯示所有 projects
- [ ] 搜尋和篩選正常運作
- [ ] 可以點擊 project 進入詳情頁
- [ ] 可以刪除 project
- [ ] Loading 和 error states 正確顯示

**Dependencies:** FE-003

---

### FE-005: Create Project 頁面
**Priority:** P0 (Blocker)
**Complexity:** Low
**Estimated Time:** 4-6 hours

**Description:**
實作建立專案頁面

**Tasks:**
- [ ] 建立 CreateProjectPage component
- [ ] 實作 form with validation
  - Fields: name (required), description, objectives, tags
  - Use React Hook Form + Zod for validation
- [ ] 實作 form submission
  - Call POST /api/projects
  - Handle success/error
  - Redirect to project detail page
- [ ] 實作 form UI (參考 wireframe)

**Acceptance Criteria:**
- [ ] Form validation 正常運作
- [ ] 可以成功建立 project
- [ ] 建立後自動跳轉到 project 頁面
- [ ] Error handling 正常運作

**Dependencies:** FE-004

---

### FE-006: Upload Paper 頁面
**Priority:** P0 (Blocker)
**Complexity:** Medium
**Estimated Time:** 6-8 hours

**Description:**
實作上傳論文頁面，參考 wireframe upload_page.png

**Tasks:**
- [ ] 建立 UploadPaperPage component
- [ ] 實作檔案上傳 UI
  - Drag & drop zone
  - File picker button
  - File size validation (max 50MB)
  - File type validation (.pdf only)
- [ ] 實作上傳進度顯示
  - Progress bar
  - Upload status messages
- [ ] 實作 multipart/form-data upload
- [ ] 處理上傳成功/失敗
- [ ] 上傳後顯示 processing status (chunking, embedding)
- [ ] 實作 multiple files upload (optional for v0)

**Acceptance Criteria:**
- [ ] Drag & drop 正常運作
- [ ] File validation 正常運作
- [ ] Upload progress 正確顯示
- [ ] 可以成功上傳 PDF
- [ ] Error handling 正常運作

**Dependencies:** FE-003

---

### FE-007: Papers List 頁面
**Priority:** P1
**Complexity:** Low
**Estimated Time:** 4-6 hours

**Description:**
實作專案內的論文列表頁面，參考 wireframe papers_page.png

**Tasks:**
- [ ] 建立 PapersListPage component
- [ ] 顯示專案內所有 papers
  - Title, Authors, Upload time, Status
- [ ] 實作 actions
  - View chunks
  - Delete paper
  - Download original PDF
- [ ] 實作 empty state (沒有 papers 時)
- [ ] 加入 "Upload Paper" button

**Acceptance Criteria:**
- [ ] 可以顯示所有 papers
- [ ] 可以刪除 paper
- [ ] Empty state 正確顯示
- [ ] 可以導航到上傳頁面

**Dependencies:** FE-006

---

### FE-008: Chat Interface - 基本 UI
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 10-12 hours

**Description:**
實作聊天介面 UI，參考 wireframe chat_page.png

**Tasks:**
- [ ] 建立 ChatPage component
- [ ] 實作 three-column layout
  - Left sidebar: Conversations list
  - Center: Chat messages area
  - Right sidebar: Sources/Context panel
- [ ] 實作 messages display
  - User messages (right-aligned)
  - Assistant messages (left-aligned)
  - Markdown rendering for assistant messages
  - Timestamp display
- [ ] 實作 message input area
  - Textarea with auto-resize
  - Send button
  - Loading state (disable input while processing)
  - Character count (optional)
- [ ] 實作 auto-scroll to bottom when new message arrives
- [ ] 實作 empty state (new conversation)

**Acceptance Criteria:**
- [ ] Layout 符合 wireframe 設計
- [ ] Messages 正確顯示
- [ ] Input area 正常運作
- [ ] Auto-scroll 正常運作
- [ ] Responsive design 在不同螢幕大小正常運作

**Dependencies:** FE-003

---

### FE-009: Chat Interface - 對話功能整合
**Priority:** P0 (Blocker)
**Complexity:** High
**Estimated Time:** 8-10 hours

**Description:**
整合聊天 API，實作完整的對話功能

**Tasks:**
- [ ] 實作發送訊息功能
  - Call POST /api/projects/{projectId}/chat
  - Handle streaming response (if implemented)
- [ ] 實作對話狀態管理 (useState or Context API)
- [ ] 實作多輪對話
  - 維護 conv_id
  - 保持對話 context
- [ ] 實作 sources display
  - 在 right sidebar 顯示引用來源
  - Source citation 可點擊 (跳到對應的 chunk)
- [ ] 實作 error handling
  - API errors
  - Network errors
  - Timeout handling
- [ ] 實作 retry 機制

**Acceptance Criteria:**
- [ ] 可以成功發送訊息並收到回覆
- [ ] 多輪對話正常運作
- [ ] Sources 正確顯示
- [ ] Error handling 完善
- [ ] Loading states 正確顯示

**Dependencies:** FE-008

---

### FE-010: Conversations Sidebar
**Priority:** P1
**Complexity:** Medium
**Estimated Time:** 6-8 hours

**Description:**
實作對話歷史側邊欄

**Tasks:**
- [ ] 建立 ConversationsSidebar component
- [ ] 載入 conversations list
  - Call GET /api/projects/{projectId}/conversations
- [ ] 顯示 conversations
  - Title (first user message preview)
  - Last updated time
  - Active state (currently opened conversation)
- [ ] 實作點擊載入對話歷史
- [ ] 實作 "New Conversation" button
- [ ] 實作刪除對話功能
- [ ] 實作搜尋對話功能 (optional for v0)

**Acceptance Criteria:**
- [ ] 可以顯示所有對話
- [ ] 可以點擊切換對話
- [ ] 可以建立新對話
- [ ] 可以刪除對話
- [ ] Active state 正確顯示

**Dependencies:** FE-009

---

### FE-011: Settings 頁面
**Priority:** P2
**Complexity:** Low
**Estimated Time:** 4-6 hours

**Description:**
實作設定頁面，參考 wireframe settings_page.png

**Tasks:**
- [ ] 建立 SettingsPage component
- [ ] 實作專案設定
  - Edit project name, description
  - Edit objectives
  - Edit tags
- [ ] 實作 model 選擇
  - Dropdown 選擇 LLM model
  - Dropdown 選擇 embedding model
- [ ] 實作儲存設定功能
- [ ] 實作刪除專案功能 (with confirmation)

**Acceptance Criteria:**
- [ ] 可以編輯專案設定
- [ ] 可以選擇 models
- [ ] 設定可以成功儲存
- [ ] 刪除專案需要確認

**Dependencies:** FE-003

---

### FE-012: Loading States & Error Handling
**Priority:** P1
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
統一處理 loading states 和 error handling

**Tasks:**
- [ ] 建立 reusable loading components
  - Spinner
  - Skeleton loaders
  - Progress bars
- [ ] 建立 error components
  - Error boundaries
  - Error messages
  - Retry buttons
- [ ] 實作 toast notifications
  - Success messages
  - Error messages
  - Info messages
- [ ] 在所有頁面套用統一的 loading/error states

**Acceptance Criteria:**
- [ ] Loading states 在所有頁面一致
- [ ] Error handling 完善
- [ ] Toast notifications 正常運作
- [ ] Error boundaries 可以捕捉未預期的錯誤

**Dependencies:** All FE tickets

---

### FE-013: Responsive Design & UI Polish
**Priority:** P2
**Complexity:** Medium
**Estimated Time:** 6-8 hours

**Description:**
確保 responsive design 和 UI 細節優化

**Tasks:**
- [ ] 確保所有頁面在 mobile/tablet/desktop 正常顯示
- [ ] 優化 mobile navigation (hamburger menu)
- [ ] 調整 spacing, colors, typography
- [ ] 加入 transitions 和 animations
- [ ] 確保 accessibility (keyboard navigation, ARIA labels)
- [ ] 優化 dark mode (optional for v0)

**Acceptance Criteria:**
- [ ] 在各種螢幕大小正常運作
- [ ] UI 符合設計規範
- [ ] Animations 流暢
- [ ] Accessibility 符合基本標準

**Dependencies:** All FE tickets

---

## Integration & Testing

### INT-001: End-to-End Integration Testing
**Priority:** P1
**Complexity:** High
**Estimated Time:** 8-10 hours

**Description:**
測試完整的 user flow

**Tasks:**
- [ ] 測試完整 flow: Create Project -> Upload PDF -> Chat
- [ ] 測試多輪對話功能
- [ ] 測試 source citations 正確性
- [ ] 測試 error cases
- [ ] 效能測試 (large PDFs, many chunks)
- [ ] 撰寫 E2E tests (Playwright or Cypress)

**Acceptance Criteria:**
- [ ] 所有主要 user flows 正常運作
- [ ] E2E tests pass
- [ ] 效能符合預期

**Dependencies:** All BE and FE tickets

---

## Deployment

### DEP-001: Docker Compose 整合
**Priority:** P1
**Complexity:** Medium
**Estimated Time:** 4-6 hours

**Description:**
更新 docker-compose.yml 包含所有服務

**Tasks:**
- [ ] 加入 PostgreSQL service
- [ ] 加入 Backend service (FastAPI)
- [ ] 加入 Frontend service (Nginx serving built React app)
- [ ] 設定服務間的網路連線
- [ ] 設定 volumes for data persistence
- [ ] 建立 .env.example 和 .env files
- [ ] 撰寫 deployment 文檔

**Acceptance Criteria:**
- [ ] `docker-compose up` 可以啟動所有服務
- [ ] 服務間可以正常通訊
- [ ] Data persistence 正常運作
- [ ] 文檔清楚易懂

**Dependencies:** BE-001, FE-001

---

## Summary

**Backend Tickets:** 14 tickets
**Frontend Tickets:** 13 tickets
**Integration & Testing:** 1 ticket
**Deployment:** 1 ticket
**Total:** 29 tickets

**Estimated Total Time:**
- Backend: ~85-110 hours
- Frontend: ~75-100 hours
- Integration: ~8-10 hours
- Deployment: ~4-6 hours
- **Grand Total: ~172-226 hours** (approximately 4-6 weeks for 1 full-time developer)

**Critical Path for MVP v0:**
1. BE-001 -> BE-002 -> BE-003 -> BE-005 (Project setup & APIs)
2. BE-004 (Milvus setup) in parallel
3. BE-006 -> BE-007 -> BE-008 (Upload & Processing pipeline)
4. BE-009 -> BE-010 -> BE-011 -> BE-012 (RAG pipeline & Chat)
5. FE-001 -> FE-002 -> FE-003 (Frontend setup)
6. FE-004 -> FE-005 (Projects management)
7. FE-006 -> FE-007 (Upload & Papers)
8. FE-008 -> FE-009 -> FE-010 (Chat interface)
9. INT-001 (Integration testing)
10. DEP-001 (Deployment)
