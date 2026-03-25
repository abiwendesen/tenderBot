# TenderBot

A comprehensive tender information system that fetches, stores, and enables semantic search of Ethiopian Government Procurement (EGP) tenders through a Telegram bot interface.

## 🚀 Features

- **Automated Tender Fetching**: Continuously fetches tender data from the Ethiopian Government Procurement portal
- **Database Storage**: Stores tender information in MySQL database with deduplication
- **Vector Search**: Implements semantic search using vector embeddings for intelligent tender queries
- **Telegram Bot Interface**: User-friendly Telegram bot for querying tenders
- **Real-time Updates**: Periodic fetching ensures up-to-date tender information
- **Multilingual Support**: Uses multilingual embedding model for better search across languages

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL for structured tender data storage
- **Vector Database**: Qdrant for semantic search capabilities
- **Bot Framework**: Grammy for Telegram bot development
- **AI/ML**: Xenova Transformers for text embeddings
- **APIs**: Ethiopian Government Procurement API integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL Server
- Qdrant Vector Database
- Telegram Bot API Token

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tenderbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=tenderbot

   # Telegram Bot
   TELEGRAM_API_KEY=your_telegram_bot_api_key

   # Server
   PORT=3000

   # Qdrant (Vector Database)
   QDRANT_URL=http://127.0.0.1:6333
   ```

4. **Set up MySQL Database**

   Create a database named `tenderbot` and run the following SQL to create the tender table:

   ```sql
   CREATE TABLE tender (
       id INT AUTO_INCREMENT PRIMARY KEY,
       tenderId VARCHAR(255) UNIQUE NOT NULL,
       lotId VARCHAR(255),
       lotName TEXT,
       lotDescription TEXT,
       procurementReferenceNo VARCHAR(255),
       procuringEntity VARCHAR(255),
       lotRefNumber VARCHAR(255),
       submissionDeadline DATETIME,
       procurementCategory VARCHAR(255),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Set up Qdrant Vector Database**

   Install and run Qdrant locally:
   ```bash
   # Using Docker
   docker run -p 6333:6333 qdrant/qdrant
   ```

## 🚀 Usage

### Starting the Application

```bash
npm start
```

This will start the Express server and Telegram bot.

### Telegram Bot Commands

- `/start` - Welcome message and bot introduction
- `/tender` - Trigger tender fetching process

### API Endpoints

The application provides REST API endpoints for direct integration:

- `GET /` - Health check endpoint

## 🏗️ Project Structure

```
tenderbot/
├── app.js                 # Main application entry point
├── fetcher.js             # Tender data fetching logic
├── vectorStore.js         # Vector database operations
├── test.js                # Testing utilities
├── data1.json             # Sample tender data
├── package.json           # Project dependencies
├── db/
│   ├── db.js             # MySQL database connection
│   └── vectorDb.js       # Qdrant vector database client
└── utill/
    └── embedder.js       # Text embedding utilities
```

## 🔍 How It Works

### Tender Fetching Process

1. **API Integration**: Connects to the EGP API endpoint to fetch tender data
2. **Pagination Handling**: Implements pagination to fetch all available tenders
3. **Deduplication**: Checks for existing tenders before insertion to avoid duplicates
4. **Data Storage**: Stores structured tender information in MySQL database

### Vector Search Implementation

1. **Text Embedding**: Uses paraphrase-multilingual-MiniLM-L12-v2 model to generate embeddings
2. **Vector Storage**: Stores embeddings in Qdrant for efficient similarity search
3. **Semantic Queries**: Enables natural language queries for tender information

## 📊 Database Schema

### Tender Table

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| tenderId | VARCHAR(255) | Unique tender identifier |
| lotId | VARCHAR(255) | Lot identifier |
| lotName | TEXT | Tender lot name |
| lotDescription | TEXT | Detailed tender description |
| procurementReferenceNo | VARCHAR(255) | Procurement reference number |
| procuringEntity | VARCHAR(255) | Organization procuring the tender |
| lotRefNumber | VARCHAR(255) | Lot reference number |
| submissionDeadline | DATETIME | Tender submission deadline |
| procurementCategory | VARCHAR(255) | Category (Goods, Services, Works) |

## 🤖 Telegram Bot Integration

The bot provides an easy interface for users to:

- Receive notifications about new tenders
- Query tenders by keywords or categories
- Get detailed information about specific tenders
- Set up alerts for relevant procurement opportunities

## 🔧 Configuration

### Environment Variables

- `DB_HOST`: MySQL database host
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: MySQL database name
- `TELEGRAM_API_KEY`: Telegram bot API token
- `PORT`: Server port (default: 3000)
- `QDRANT_URL`: Qdrant server URL

### Embedding Configuration

- Model: `Xenova/paraphrase-multilingual-MiniLM-L12-v2`
- Dimensions: 1024
- Quantization: Enabled for performance

## 🧪 Testing

Run the test script to verify embedding and vector search functionality:

```bash
node test.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.



**Note**: This project is designed for educational and informational purposes. Always verify tender information directly from official government sources before making procurement decisions.
