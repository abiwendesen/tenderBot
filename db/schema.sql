-- PostgreSQL schema for tenderBot
-- Run: psql -U your_user -d tenderbot -f db/schema.sql

CREATE TABLE IF NOT EXISTS tender (
  id SERIAL PRIMARY KEY,
  "tenderId" VARCHAR(255) UNIQUE NOT NULL,
  "lotId" VARCHAR(255),
  "lotName" TEXT,
  "lotDescription" TEXT,
  "procurementReferenceNo" VARCHAR(255),
  "procuringEntity" VARCHAR(255),
  "lotRefNumber" VARCHAR(255),
  "submissionDeadline" TIMESTAMP,
  "procurementCategory" VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tender_tender_id ON tender ("tenderId");
