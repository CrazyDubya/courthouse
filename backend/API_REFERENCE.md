# Backend API Reference

This document provides comprehensive documentation for the Courthouse Simulator backend REST API.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API uses optional user identification via headers:
- `x-user-id`: Optional user identifier for tracking requests

---

## Cases API

### GET /api/cases

Retrieve all cases with optional filtering and pagination.

**Query Parameters:**
- `userId` (string, optional): Filter cases by user ID
- `limit` (number, optional, default: 50): Maximum number of cases to return
- `offset` (number, optional, default: 0): Number of cases to skip

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "title": "string",
    "type": "civil" | "criminal",
    "summary": "string",
    "participants": [
      {
        "id": "string",
        "name": "string",
        "role": "string",
        "description": "string",
        "aiControlled": boolean,
        "llmConfig": {}
      }
    ],
    "phase": "opening" | "trial" | "closing" | "deliberation" | "verdict",
    "transcript": [],
    "settings": {},
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

**Errors:**
- `500`: Failed to fetch cases

---

### GET /api/cases/:id

Retrieve a specific case by ID.

**Parameters:**
- `id` (string): Case identifier

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "type": "civil" | "criminal",
  ...
}
```

**Errors:**
- `404`: Case not found
- `500`: Failed to fetch case

---

### POST /api/cases

Create a new case.

**Request Body:**
```json
{
  "title": "string (required, 1-200 chars)",
  "type": "civil" | "criminal" (required),
  "summary": "string (required, 1-2000 chars)",
  "participants": [
    {
      "name": "string (required)",
      "role": "string (required)",
      "description": "string (optional)",
      "aiControlled": boolean (required),
      "llmConfig": {} (optional)
    }
  ],
  "settings": {
    "realtimeSpeed": number (optional, 0.1-5.0),
    "autoProgress": boolean (optional),
    "jurySize": number (optional, 0-12),
    "enableObjections": boolean (optional),
    "complexityLevel": "simple" | "intermediate" | "advanced" (optional)
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  ...
}
```

**Errors:**
- `400`: Validation error
- `500`: Failed to create case

---

### PUT /api/cases/:id

Update an existing case.

**Parameters:**
- `id` (string): Case identifier

**Request Body:**
```json
{
  "title": "string (optional, 1-200 chars)",
  "type": "civil" | "criminal" (optional)",
  "summary": "string (optional, 1-2000 chars)",
  "participants": [],
  "settings": {}
}
```

**Response:** `200 OK`

**Errors:**
- `400`: Validation error
- `404`: Case not found
- `500`: Failed to update case

---

### DELETE /api/cases/:id

Delete a case.

**Parameters:**
- `id` (string): Case identifier

**Response:** `204 No Content`

**Errors:**
- `404`: Case not found
- `500`: Failed to delete case

---

### POST /api/cases/:id/participants

Add a participant to a case.

**Parameters:**
- `id` (string): Case identifier

**Request Body:**
```json
{
  "name": "string (required)",
  "role": "string (required)",
  "description": "string (optional)",
  "aiControlled": boolean (required),
  "llmConfig": {} (optional)
}
```

**Response:** `200 OK`

**Errors:**
- `404`: Case not found
- `500`: Failed to add participant

---

### PUT /api/cases/:id/participants/:participantId

Update a participant in a case.

**Parameters:**
- `id` (string): Case identifier
- `participantId` (string): Participant identifier

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  ...
}
```

**Response:** `200 OK`

**Errors:**
- `404`: Case or participant not found
- `500`: Failed to update participant

---

### DELETE /api/cases/:id/participants/:participantId

Remove a participant from a case.

**Parameters:**
- `id` (string): Case identifier
- `participantId` (string): Participant identifier

**Response:** `200 OK`

**Errors:**
- `404`: Case or participant not found
- `500`: Failed to remove participant

---

### GET /api/cases/:id/transcript

Get the transcript for a case.

**Parameters:**
- `id` (string): Case identifier

**Response:** `200 OK`
```json
[
  {
    "speaker": "string",
    "text": "string",
    "timestamp": "timestamp",
    "type": "string"
  }
]
```

**Errors:**
- `404`: Case not found
- `500`: Failed to fetch transcript

---

### POST /api/cases/:id/transcript

Add an entry to the case transcript.

**Parameters:**
- `id` (string): Case identifier

**Request Body:**
```json
{
  "speaker": "string",
  "text": "string",
  "timestamp": "timestamp",
  "type": "string"
}
```

**Response:** `200 OK`

**Errors:**
- `404`: Case not found
- `500`: Failed to add transcript entry

---

### PUT /api/cases/:id/phase

Update the phase of a case.

**Parameters:**
- `id` (string): Case identifier

**Request Body:**
```json
{
  "phase": "opening" | "trial" | "closing" | "deliberation" | "verdict" (required)
}
```

**Response:** `200 OK`

**Errors:**
- `400`: Phase is required
- `404`: Case not found
- `500`: Failed to update phase

---

## LLM API

### POST /api/llm/request

Queue an LLM generation request.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system" | "user" | "assistant" (required),
      "content": "string (required)"
    }
  ],
  "config": {
    "provider": "openai" | "anthropic" | "ollama" | "openrouter" | "groq" (required),
    "model": "string (required)",
    "apiKey": "string (optional)",
    "endpoint": "string (optional)",
    "temperature": number (optional, 0-2),
    "maxTokens": number (optional, 1-8000)
  },
  "priority": number (optional, 0-10, default: 0),
  "sessionId": "string (optional)"
}
```

**Response:** `202 Accepted`
```json
{
  "requestId": "string",
  "status": "queued",
  "position": number,
  "estimatedWaitTime": number
}
```

**Errors:**
- `400`: Validation error
- `500`: Failed to process LLM request

---

### GET /api/llm/request/:requestId/status

Get the status of an LLM request.

**Parameters:**
- `requestId` (string): Request identifier

**Response:** `200 OK`
```json
{
  "requestId": "string",
  "status": "pending" | "active" | "completed" | "failed",
  "position": number | undefined,
  "result": {} | null,
  "error": "string" | null,
  "timestamp": "timestamp"
}
```

**Errors:**
- `404`: Request not found
- `500`: Failed to fetch request status

---

### POST /api/llm/request/:requestId/cancel

Cancel a pending or active LLM request.

**Parameters:**
- `requestId` (string): Request identifier

**Response:** `200 OK`
```json
{
  "message": "Request cancelled successfully"
}
```

**Errors:**
- `404`: Request not found or cannot be cancelled
- `500`: Failed to cancel request

---

### POST /api/llm/request/:requestId/retry

Retry a failed LLM request.

**Parameters:**
- `requestId` (string): Request identifier

**Response:** `200 OK`
```json
{
  "message": "Request queued for retry"
}
```

**Errors:**
- `404`: Request not found or cannot be retried
- `500`: Failed to retry request

---

### GET /api/llm/providers

Get the status of all LLM providers.

**Response:** `200 OK`
```json
{
  "openai": {
    "available": boolean,
    "models": ["string"]
  },
  "anthropic": {
    "available": boolean,
    "models": ["string"]
  },
  ...
}
```

**Errors:**
- `500`: Failed to fetch provider status

---

### POST /api/llm/providers/:provider/test

Test a provider configuration.

**Parameters:**
- `provider` (string): Provider name

**Request Body:**
```json
{
  "config": {
    "apiKey": "string",
    "model": "string",
    ...
  }
}
```

**Response:** `200 OK`
```json
{
  "provider": "string",
  "valid": boolean,
  "timestamp": "string"
}
```

**Errors:**
- `400`: Provider config is required
- `500`: Failed to test provider

---

### GET /api/llm/queue/stats

Get queue statistics.

**Response:** `200 OK`
```json
{
  "pending": number,
  "active": number,
  "completed": number,
  "failed": number,
  "delayed": number
}
```

**Errors:**
- `500`: Failed to fetch queue stats

---

### GET /api/llm/queue/jobs/active

Get active job IDs.

**Response:** `200 OK`
```json
{
  "activeJobs": ["string"],
  "count": number
}
```

**Errors:**
- `500`: Failed to fetch active jobs

---

### GET /api/llm/queue/jobs/pending

Get pending job IDs.

**Response:** `200 OK`
```json
{
  "pendingJobs": ["string"],
  "count": number
}
```

**Errors:**
- `500`: Failed to fetch pending jobs

---

### POST /api/llm/queue/cleanup

Cleanup completed or failed jobs.

**Request Body:**
```json
{
  "type": "completed" | "failed" | "all"
}
```

**Response:** `200 OK`
```json
{
  "message": "string",
  "type": "string",
  "clearedCount": number
}
```

**Errors:**
- `500`: Failed to cleanup queue

---

## Evidence API

### GET /api/evidence

Retrieve all evidence with filtering and pagination.

**Query Parameters:**
- `caseId` (string, optional): Filter by case ID
- `type` (string, optional): Filter by evidence type
- `submittedBy` (string, optional): Filter by submitter
- `limit` (number, optional, default: 50): Max results
- `offset` (number, optional, default: 0): Results to skip

**Response:** `200 OK`
```json
{
  "evidence": [
    {
      "id": "string",
      "title": "string",
      "type": "document" | "video" | "audio" | "photo" | "testimony" | "physical",
      "description": "string",
      "submittedBy": "string",
      "caseId": "string",
      "exhibit": "string",
      "filePath": "string",
      "admissible": boolean,
      "privileged": boolean,
      "chainOfCustody": ["string"],
      "createdAt": "timestamp"
    }
  ],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Errors:**
- `500`: Failed to fetch evidence

---

### GET /api/evidence/:id

Get specific evidence by ID.

**Parameters:**
- `id` (string): Evidence identifier

**Response:** `200 OK`

**Errors:**
- `404`: Evidence not found
- `500`: Failed to fetch evidence

---

### POST /api/evidence

Create new evidence (with optional file upload).

**Request Body (multipart/form-data):**
```
title: string (required, 1-200 chars)
type: document | video | audio | photo | testimony | physical (required)
description: string (required, 1-2000 chars)
submittedBy: string (required)
caseId: string (required)
exhibit: string (optional)
admissible: boolean (optional, default: true)
privileged: boolean (optional, default: false)
chainOfCustody: array (optional, default: [])
files: file[] (optional, max 5 files, max 10MB each)
```

**Response:** `201 Created`
```json
{
  "message": "string",
  "evidence": {}
}
```

**Errors:**
- `400`: Validation error
- `500`: Failed to create evidence

---

### PUT /api/evidence/:id

Update evidence metadata.

**Parameters:**
- `id` (string): Evidence identifier

**Request Body:**
```json
{
  "title": "string (optional, 1-200 chars)",
  "description": "string (optional, 1-2000 chars)",
  "exhibit": "string (optional)",
  "admissible": boolean (optional)",
  "privileged": boolean (optional)",
  "chainOfCustodyEntry": "string (optional)"
}
```

**Response:** `200 OK`

**Errors:**
- `400`: Validation error
- `404`: Evidence not found
- `500`: Failed to update evidence

---

### DELETE /api/evidence/:id

Delete evidence and associated file.

**Parameters:**
- `id` (string): Evidence identifier

**Response:** `204 No Content`

**Errors:**
- `404`: Evidence not found
- `500`: Failed to delete evidence

---

### GET /api/evidence/:id/file

Download evidence file.

**Parameters:**
- `id` (string): Evidence identifier

**Response:** `200 OK` (file download)

**Errors:**
- `404`: Evidence file not found
- `500`: Failed to serve evidence file

---

### POST /api/evidence/:id/chain-of-custody

Add chain of custody entry.

**Parameters:**
- `id` (string): Evidence identifier

**Request Body:**
```json
{
  "entry": "string (required)",
  "actor": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "message": "Chain of custody entry added",
  "evidence": {}
}
```

**Errors:**
- `400`: Entry and actor are required
- `404`: Evidence not found
- `500`: Failed to add chain of custody entry

---

## Valuation API

### GET /api/valuation

Get all economic valuations.

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "caseId": "string",
    "method": "string",
    "inputs": {},
    "result": {},
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

**Errors:**
- `500`: Failed to fetch valuations

---

### GET /api/valuation/:id

Get valuation by ID.

**Parameters:**
- `id` (string): Valuation identifier

**Response:** `200 OK`

**Errors:**
- `404`: Valuation not found
- `500`: Failed to fetch valuation

---

### GET /api/valuation/case/:caseId

Get valuations for a specific case.

**Parameters:**
- `caseId` (string): Case identifier

**Response:** `200 OK`

**Errors:**
- `500`: Failed to fetch case valuations

---

### POST /api/valuation

Create a new valuation.

**Request Body:**
```json
{
  "caseId": "string",
  "method": "string",
  "inputs": {}
}
```

**Response:** `201 Created`

**Errors:**
- `500`: Failed to create valuation

---

### PUT /api/valuation/:id

Update a valuation.

**Parameters:**
- `id` (string): Valuation identifier

**Request Body:**
```json
{
  "result": {},
  ...
}
```

**Response:** `200 OK`

**Errors:**
- `404`: Valuation not found
- `500`: Failed to update valuation

---

### DELETE /api/valuation/:id

Delete a valuation.

**Parameters:**
- `id` (string): Valuation identifier

**Response:** `204 No Content`

**Errors:**
- `404`: Valuation not found
- `500`: Failed to delete valuation

---

### POST /api/valuation/calculate/saas-metrics

Calculate SaaS business metrics.

**Request Body:**
```json
{
  "revenueData": {} (required),
  "customerMetrics": {} (required),
  "profitMargin": number (optional),
  "salesAndMarketingSpend": number (optional)
}
```

**Response:** `200 OK`
```json
{
  "arr": number,
  "mrr": number,
  "ltv": number,
  "cac": number
}
```

**Errors:**
- `400`: Missing required data
- `500`: Failed to calculate SaaS metrics

---

### POST /api/valuation/calculate/arr

Calculate Annual Recurring Revenue.

**Request Body:**
```json
{
  "revenueData": {} (required)
}
```

**Response:** `200 OK`
```json
{
  "arr": number
}
```

**Errors:**
- `400`: Missing required data
- `500`: Failed to calculate ARR

---

### POST /api/valuation/calculate/mrr

Calculate Monthly Recurring Revenue.

**Request Body:**
```json
{
  "revenueData": {} (required)
}
```

**Response:** `200 OK`
```json
{
  "mrr": number
}
```

**Errors:**
- `400`: Missing required data
- `500`: Failed to calculate MRR

---

### POST /api/valuation/calculate/clv

Calculate Customer Lifetime Value.

**Request Body:**
```json
{
  "avgContractValue": number (required),
  "avgContractLength": number (required),
  "retentionRate": number (required)
}
```

**Response:** `200 OK`
```json
{
  "clv": number
}
```

**Errors:**
- `400`: Missing required data
- `500`: Failed to calculate CLV

---

### POST /api/valuation/calculate/projection

Project future revenue.

**Request Body:**
```json
{
  "historicalData": array (required),
  "months": number (required),
  "growthRate": number (required),
  "confidence": number (optional)
}
```

**Response:** `200 OK`
```json
{
  "projections": [number]
}
```

**Errors:**
- `400`: Missing required data
- `500`: Failed to project revenue

---

### POST /api/valuation/calculate/valuation

Calculate business valuation.

**Request Body:**
```json
{
  "method": "dcf" | "market-multiple" | "asset-based" | "revenue-multiple" | "arr-multiple" (required),
  "inputs": {} (required)
}
```

**Response:** `200 OK`
```json
{
  "value": number,
  "confidence": number
}
```

**Errors:**
- `400`: Invalid method or missing data
- `500`: Failed to calculate valuation

---

### POST /api/valuation/calculate/damages

Calculate total damages.

**Request Body:**
```json
{
  "lostRevenue": number (required),
  "lostCustomers": number (required),
  "mitigationCosts": {} (optional),
  "businessImpact": {} (optional),
  "interestRate": number (optional)
}
```

**Response:** `200 OK`
```json
{
  "total": number,
  "breakdown": {}
}
```

**Errors:**
- `400`: Missing required data
- `500`: Failed to calculate damages

---

### POST /api/valuation/:id/analyze

Run LLM analysis on valuation (placeholder).

**Parameters:**
- `id` (string): Valuation identifier

**Response:** `200 OK`

**Errors:**
- `404`: Valuation not found
- `500`: Failed to analyze valuation

---

## WebSocket Events

The backend also provides WebSocket communication on the same port. Connect to:
```
ws://localhost:3001
```

### Client Events

- `llm_request`: Send LLM generation request
- `llm_stream_request`: Send streaming LLM request
- `case_subscribe`: Subscribe to case updates
- `case_unsubscribe`: Unsubscribe from case updates

### Server Events

- `llm_response`: LLM generation complete
- `llm_stream_chunk`: Streaming LLM chunk
- `llm_stream_complete`: Streaming complete
- `llm_error`: LLM request error
- `case_update`: Case state changed
- `transcript_update`: Transcript entry added
- `phase_change`: Case phase changed
- `participant_update`: Participant modified

---

## Error Response Format

All error responses follow this format:
```json
{
  "error": "string",
  "details": "string" | ["string"]
}
```

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production.

## Data Persistence

The backend uses in-memory storage for cases and evidence. Redis/Bull is used for LLM request queuing. Consider adding persistent database in production.
