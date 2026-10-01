# CSIA — Crime Scene Intelligence Assistant

An AI-assisted case organization platform for forensic education, training, and mock investigations.

># CSIA — Crime Scene Intelligence Assistant

An AI-assisted crime-scene intelligence platform designed for **forensic education, training, and mock investigations**. CSIA brings case records, evidence, AI-assisted analysis, witness statements, timelines, next-step suggestions, and reports into one unified workflow.

> **Human-in-the-loop:** CSIA assists. Humans decide. Every AI output — object detections, OCR results, statement summaries, extracted entities, and next-step suggestions — is presented for human review and is never treated as an autonomous decision.

---

## About the Project

Crime-scene investigations can involve multiple types of evidence such as photographs, witness statements, CCTV frames, and case records. Managing these separately can make it difficult to organize information and maintain a clear investigation timeline.

CSIA provides a unified platform where investigators or students working on mock cases can:

* Create and manage investigation cases
* Upload and associate evidence with cases
* Analyze images using YOLOv8
* Extract visible text using EasyOCR
* Summarize witness statements using NLP
* Extract relevant entities from statements
* Automatically generate chronological timelines
* Generate rule-based next-step suggestions
* Search cases and evidence
* Generate structured case reports
* Review AI-generated outputs before taking any action

CSIA is an **educational prototype** and is not intended for live criminal investigations or autonomous decision-making.
---

## 🔗 Live Demo

**Frontend:** https://csia-crime-scene-intelligence-agent.vercel.app/

> The frontend is hosted on Vercel. The backend (FastAPI + YOLOv8 + EasyOCR + spaCy) runs separately and is exposed through a temporary tunnel for demonstrations, so live data is only available while the backend is running.


---

# Objectives

| Objective                   | Description                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| **Unified Case Management** | Maintain case information and associated evidence in one place.                       |
| **AI Evidence Analysis**    | Use computer vision and OCR to analyze uploaded evidence.                             |
| **Statement Summarization** | Summarize witness statements using NLP techniques.                                    |
| **Entity Extraction**       | Extract useful entities such as people, locations, and organizations from statements. |
| **Automatic Timeline**      | Organize evidence-related events chronologically.                                     |
| **Next-Step Suggestions**   | Provide rule-based prompts to support the investigation workflow.                     |
| **Search**                  | Search and filter cases and evidence.                                                 |
| **Exportable Reports**      | Generate structured reports containing case and evidence information.                 |

---

# System Modules

## 1. Case Management + Search

Handles the core case and evidence records.

### Features

* Create cases
* Retrieve cases
* Update cases
* Delete cases
* Attach evidence to cases
* Search and filter cases
* Search and filter evidence

---

## 2. Evidence Upload

Provides the mechanism for adding evidence to an investigation case.

### Supported evidence workflow

* Image evidence
* Text/statements
* Other evidence files depending on the configured upload workflow

Evidence is associated with the appropriate case so that downstream analysis can use the correct case context.

---

## 3. Image Analysis — YOLOv8

Uses **YOLOv8** for object detection in uploaded images.

### Output

The image-analysis module returns structured detection information such as:

* Detected object
* Confidence score
* Bounding-box information

The output is presented as AI-assisted evidence analysis and requires human verification.

---

## 4. OCR — EasyOCR

Uses **EasyOCR** to identify and extract visible text from uploaded images.

### Example use cases

* Text appearing in photographs
* Signs
* Labels
* Documents
* Other visible text within evidence images

OCR results are returned as structured output for further review.

---

## 5. NLP Engine + Entity Extraction

The NLP module processes witness statements and other textual information.

### Features

* Statement processing
* Statement summarization
* Entity extraction
* Identification of entities such as:

  * People
  * Locations
  * Organizations

The NLP output is provided to the investigator for review rather than being treated as a final conclusion.

---

## 6. Timeline Generator

The timeline module organizes case events chronologically using available evidence timestamps and case information.

### Purpose

It helps present the available evidence in an ordered sequence so that the investigator can review the development of a case more easily.

> **Important:** The generated timeline represents the timestamps available in the evidence. An evidence-collection timestamp does not necessarily represent the exact time when an incident occurred.

---

## 7. Next-Step Suggestions

CSIA provides **rule-based** next-step prompts based on available case/evidence information.

For example:

> "Check nearby CCTV."

The suggestions are prompts for human review and are not autonomous investigative decisions.

---

## 8. Report Generator

The report-generation component creates a structured case report containing relevant case and evidence information.

Reports are intended for review and demonstration purposes within the educational prototype.

---

# Investigation Workflow

```text
             ┌─────────────────┐
             │   Create Case   │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Upload Evidence │
             └────────┬────────┘
                      │
                      ▼
        ┌────────────────────────────┐
        │      AI Evidence Analysis  │
        │                            │
        │ YOLOv8 + EasyOCR + NLP     │
        └─────────────┬──────────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  Case Records   │
             │  + AI Outputs   │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │     Timeline    │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Next-Step Rules │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Human Review    │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  Case Report    │
             └─────────────────┘
```

---

# System Architecture

CSIA is implemented as a modular application in which the different capabilities are exposed through the backend API.

```text
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │  Dashboard / Case UI │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI API     │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
 ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
 │ Case Management│   │ Image Analysis │   │  NLP Engine    │
 │   + Search     │   │ YOLOv8+OCR     │   │ Summary +      │
 │                │   │                │   │ Entities       │
 └───────┬────────┘   └───────┬────────┘   └───────┬────────┘
         │                     │                    │
         └─────────────────────┼────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Timeline +           │
                    │ Next-Step Suggestions│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Report Generator   │
                    └──────────────────────┘
```

---

# Technology Stack

| Layer                 | Technology                                  |
| --------------------- | ------------------------------------------- |
| **Frontend**          | React + Tailwind CSS                        |
| **Backend**           | FastAPI + Python                            |
| **Computer Vision**   | YOLOv8 / Ultralytics                        |
| **OCR**               | EasyOCR                                     |
| **NLP**               | spaCy + Sentence Transformers               |
| **Database**          | SQLAlchemy with configured database backend |
| **API Documentation** | FastAPI Swagger / OpenAPI                   |
| **Report Generation** | ReportLab                                   |

---

# Backend Structure

# CSIA — Crime Scene Intelligence Assistant

## Complete Project File Structure

```text
CSIA-Crime-Scene-Intelligence-Agent-/
│
├── README.md
├── .gitignore
├── docker-compose.yml
│
├── backend/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   │
│   │   ├── case_management/
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── crud.py
│   │   │   ├── database.py
│   │   │   └── routes.py
│   │   │
│   │   ├── image_analysis/
│   │   │   ├── __init__.py
│   │   │   ├── yolo_detector.py
│   │   │   ├── ocr_reader.py
│   │   │   └── routes.py
│   │   │
│   │   ├── nlp_engine/
│   │   │   ├── __init__.py
│   │   │   ├── entity_extraction.py
│   │   │   └── routes.py
│   │   │
│   │   ├── timeline_suggestions/
│   │   │   ├── __init__.py
│   │   │   ├── timeline_builder.py
│   │   │   ├── next_step_rules.py
│   │   │   └── routes.py
│   │   │
│   │   └── shared/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── exceptions.py
│   │       └── utils.py
│   │
│   ├── tests/
│   │   ├── test_timeline.py
│   │   ├── test_next_steps.py
│   │   └── test_full_flow.py
│   │
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── CaseDashboard/
│   │   │   ├── EvidenceUpload/
│   │   │   ├── Timeline/
│   │   │   ├── SearchBar/
│   │   │   └── ReportExport/
│   │   │
│   │   ├── pages/
│   │   │
│   │   ├── api/
│   │   │   └── API service files
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── ml_models/
│   ├── yolo/
│   │   └── model weights
│   │
│   └── nlp/
│       └── NLP model files
│
├── docs/
│   ├── architecture.md
│   ├── api_spec.md
│   ├── CSIA_Presentation.pptx
│   └── CSIA_Team_Roles_and_Responsibilities.pdf
│
└── reports/
    └── generated case reports
```

## Team-wise Ownership

### 1. Yojit Wagh — Case Management + Search

```text
backend/app/case_management/
├── models.py
├── schemas.py
├── crud.py
├── database.py
└── routes.py
```

**Responsibility:**

* Case creation and management
* Case retrieval and updating
* Evidence association
* Case/evidence search
* Database interaction

**Main output:** Working Case Management and Search APIs.

---

### 2. Anwesha Dhote — Image Analysis — YOLOv8 + EasyOCR

```text
backend/app/image_analysis/
├── yolo_detector.py
├── ocr_reader.py
└── routes.py

ml_models/yolo/
└── model weights
```

**Responsibility:**

* Object detection from crime-scene images
* OCR-based text extraction
* Detection confidence and bounding-box information
* Returning structured image-analysis results

**Main output:** Image → detected objects + extracted text.

---

### 3. Saumya Sinha — Frontend — React + Tailwind CSS

```text
frontend/
├── src/
│   ├── components/
│   │   ├── CaseDashboard/
│   │   ├── EvidenceUpload/
│   │   ├── Timeline/
│   │   ├── SearchBar/
│   │   └── ReportExport/
│   ├── pages/
│   ├── api/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

**Responsibility:**

* Investigation dashboard
* Case view
* Evidence upload interface
* Timeline display
* Search interface
* Report export interface
* Connecting frontend with FastAPI APIs

**Main output:** Unified investigator dashboard.

---

### 4. Anmol Panjwani — NLP Engine + Entity Extraction

```text
backend/app/nlp_engine/
├── entity_extraction.py
└── routes.py

ml_models/nlp/
└── NLP model files
```

**Responsibility:**

* Processing witness/investigator statements
* Extracting important entities
* Identifying names, locations, organizations and other relevant information
* Returning structured NLP results through API

**Main output:**

```text
Statement
    ↓
NLP Processing
    ↓
Entity Extraction
    ↓
Structured Information
```

**Note:** Relationship Graph is **not part of the current project scope**.

---

### 5. Tanya Kakkar — Evidence Upload + Report Generator

Evidence handling is integrated with the case-management flow.

```text
backend/app/case_management/
└── routes.py

reports/
└── generated case reports
```

**Responsibility:**

* Evidence upload workflow
* Linking evidence with cases
* Maintaining evidence metadata
* Preparing case information for reporting
* Generating/exporting case reports

**Main output:** Evidence linked to cases + exportable investigation report.

---

### 6. Sanskruti Prashant Chanekar — Team Lead · Timeline + Next-Step Suggestions

```text
backend/app/timeline_suggestions/
├── timeline_builder.py
├── next_step_rules.py
└── routes.py

README.md
```

**Responsibility:**

* Building chronological investigation timelines
* Processing evidence timestamps
* Generating rule-based next-step suggestions
* Timeline API integration
* Integration testing
* Project README/documentation

**Main output:**

```text
Case Evidence
      ↓
Timeline Builder
      ↓
Chronological Timeline
      ↓
Next-Step Rules
      ↓
Investigation Suggestions
      ↓
Human Review
```

---

# Backend Architecture

```text
                         ┌─────────────────────┐
                         │     FRONTEND        │
                         │ React + Tailwind     │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │       FASTAPI       │
                         │      main.py        │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
     │ Case Management│    │ Image Analysis │    │  NLP Engine    │
     │                │    │                │    │                │
     │ Cases          │    │ YOLOv8         │    │ Entity         │
     │ Evidence      │    │ EasyOCR        │    │ Extraction     │
     │ Search         │    │                │    │                │
     └───────┬────────┘    └────────────────┘    └────────────────┘
             │
             ▼
     ┌────────────────────┐
     │ Timeline +          │
     │ Next-Step           │
     │ Suggestions         │
     └─────────┬──────────┘
               │
               ▼
     ┌────────────────────┐
     │ Investigator Review │
     │ & Final Decision    │
     └────────────────────┘
```

# Investigation Data Flow

```text
CREATE CASE
     ↓
ADD EVIDENCE
     ↓
┌───────────────────────────────┐
│       AI ANALYSIS             │
│                               │
│ YOLOv8 → Objects              │
│ EasyOCR → Text                │
│ NLP → Entities                │
└───────────────┬───────────────┘
                ↓
       STRUCTURED RESULTS
                ↓
       TIMELINE GENERATION
                ↓
       NEXT-STEP RULES
                ↓
        INVESTIGATOR REVIEW
                ↓
          CASE REPORT
```

# Module Summary

| Module                | Technology                    | Main Function              | Owner     |
| --------------------- | ----------------------------- | -------------------------- | --------- |
| Case Management       | FastAPI + SQLAlchemy          | Cases and evidence         | Yojit     |
| Search                | FastAPI                       | Case/evidence search       | Yojit     |
| Evidence Management   | FastAPI                       | Evidence handling          | Tanya     |
| Image Analysis        | YOLOv8                        | Object detection           | Anwesha   |
| OCR                   | EasyOCR                       | Text extraction            | Anwesha   |
| NLP Engine            | NLP models                    | Statement processing       | Anmol     |
| Entity Extraction     | NLP                           | Extract important entities | Anmol     |
| Timeline              | Python                        | Chronological events       | Sanskruti |
| Next-Step Suggestions | Rule-based Python             | Investigation prompts      | Sanskruti |
| Report Generation     | ReportLab                     | Case report export         | Tanya     |
| Frontend              | React + Tailwind              | Investigator dashboard     | Saumya    |
| Authentication        | JWT                           | API authentication         | Team      |
| Database              | SQLAlchemy / SQLite prototype | Data persistence           | Team      |


**Important documentation rule:** the current CSIA documentation should consistently use **“NLP Engine + Entity Extraction”** and should not contain `RelationshipGraph`, `relationship_graph.py`, “relationship graph,” or “relationship information.” The original planning file still contains those older entries, so this cleaned version should be used as the replacement.


# API Modules

The backend exposes APIs for the major project modules.

### Case Management

* Create case
* List cases
* Retrieve case
* Update case
* Delete case

### Evidence

* Associate evidence with a case
* Retrieve evidence

### Search

* Search cases
* Search evidence

### Image Analysis

```text
POST /api/v1/image-analysis/analyze
```

Processes an uploaded image using the image-analysis pipeline.

### NLP

```text
POST /api/v1/nlp/extract
```

Processes a witness statement and returns NLP-related structured information.

### Health Check

```text
GET /api/v1/health
```

Returns the API health status.

---

# Current Implementation

The current prototype brings together the major investigation components into one workflow:

* Case management
* Case and evidence search
* Evidence association
* YOLOv8 image analysis
* EasyOCR text extraction
* NLP statement processing
* Entity extraction
* Timeline generation
* Rule-based next-step suggestions
* Report-generation capability
* React-based frontend integration
* FastAPI backend
* Swagger/OpenAPI API documentation
* Human-in-the-loop review approach

---

# Team Responsibilities

| Team Member                     | Responsibility                                         |
| ------------------------------- | ------------------------------------------------------ |
| **Sanskruti Prashant Chanekar** | Team Lead · Timeline Generator + Next-Step Suggestions |
| **Yojit Wagh**                  | Case Management + Search                               |
| **Anwesha Dhote**               | Image Analysis — YOLOv8 + OCR — EasyOCR                |
| **Anmol Panjwani**              | NLP Engine + Entity Extraction                         |
| **Tanya Kakkar**                | Evidence Upload + Report Generator                     |
| **Saumya Sinha**                | Frontend — React + Tailwind CSS                        |

---

# Responsible AI / Human-in-the-Loop

CSIA is designed as an **AI-assisted system rather than an autonomous investigation system**.

The system follows these principles:

* AI outputs are suggestions for human review.
* Object detections may be incorrect.
* OCR results may contain errors.
* NLP summaries may omit or misinterpret information.
* Extracted entities require verification.
* Next-step suggestions are rule-based prompts.
* The system does not make autonomous investigative decisions.
* Human investigators or students remain responsible for interpreting the information.

---

# Limitations

* The project is an educational prototype.
* AI detections and OCR results can be incorrect.
* NLP output depends on the quality and clarity of the input statement.
* Timeline accuracy depends on the timestamps available in evidence.
* YOLOv8 and EasyOCR can be computationally demanding on CPU-only systems.
* Real-world deployment would require stronger security and privacy controls.
* Real forensic applications would require validated datasets and domain-specific testing.
* Proper chain-of-custody mechanisms would be required for real forensic evidence.
* The system is **not intended for live criminal casework**.

---

# Future Scope

Possible future extensions include:

* Multilingual statement processing
* Improved forensic-domain NLP models
* Advanced evidence classification
* 3D crime-scene reconstruction
* AR/VR crime-scene visualization
* Live CCTV analysis
* Voice-based interaction
* Advanced evidence correlation
* Secure cloud deployment
* Stronger authentication and authorization
* Chain-of-custody support

---

# Conclusion

CSIA demonstrates how computer vision, OCR, NLP, case management, timeline generation, and rule-based reasoning can be integrated into a single educational crime-scene intelligence platform.

The goal is not to replace human investigators. Instead, CSIA organizes information and provides AI-assisted outputs that can help users review a mock investigation in a structured manner.

> **CSIA assists. Humans decide.**


## Academic Information

| | |
|---|---|
| University | VIT Bhopal University |
| Course | Project Exhibition 1 |
| Course Code | DSN 2098 |
| Branch | AI & ML | 



