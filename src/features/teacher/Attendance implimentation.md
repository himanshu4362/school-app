# Teacher Face Attendance Module Documentation (V1 Locked Architecture)

## Project Context

This attendance system is NOT a standalone application.

It is a feature integration inside an existing:

* Ionic React + Capacitor ERP frontend
* Node.js + Express backend
* MongoDB database
* Feature-based modular architecture

The attendance module must integrate into the existing project structure without redesigning the current ERP architecture.

---

# Primary Goal

Build a:

* Mobile-first
* Offline-capable
* Secure-enough-for-MVP
* Teacher attendance system

using:

* Face verification
* GPS polygon validation
* Native Android processing
* Capacitor bridge integration

while keeping the implementation maintainable and future-upgradable.

---

# Important Product Decisions (LOCKED)

## Attendance Scope

Attendance feature is:

* Teacher-only
* Mobile app only
* Android-first

The web platform will NOT support teacher face attendance operations.

---

## Security Model

### Allowed

* Offline attendance
* Local verification
* Temporary offline queue

### Not Allowed

* Browser attendance
* Teacher self face registration
* Editable local embeddings
* Multi-device usage without admin approval

---

# Architecture Overview

```text
Ionic React ERP
    ↓
Attendance Feature Module
    ↓
Capacitor Native Plugin Bridge
    ↓
Native Android Kotlin Layer
    ↓
ML Kit + TensorFlow Lite
```

---

# V1 Design Philosophy

The MVP focuses on:

* Practical fraud resistance
* Offline reliability
* Fast attendance
* Maintainable architecture

The MVP intentionally avoids:

* Enterprise anti-tampering systems
* Advanced spoof AI
* Server-side face recognition
* Play Integrity API
* Complex cryptographic infrastructure

These are future-version concerns.

---

# Frontend Architecture

## Existing Structure

Current frontend structure already follows feature-based organization.

Attendance feature must follow the same pattern.

---

# Frontend Feature Structure

```text
src/features/teacher/attendance
src/features/admin/attendance
```

---

# Recommended Frontend Structure

```text
src/features/teacher/attendance
    components/
    hooks/
    pages/
    services/
    store/
    utils/
    types/

src/features/admin/attendance
    components/
    pages/
    services/
```

---

# Responsibilities By Layer

# Ionic React Layer Responsibilities

The Ionic layer handles:

* Attendance UI
* Attendance history
* Attendance sync status
* API communication
* Offline UX
* Local app state
* Teacher session state
* Admin dashboards
* Error handling
* Polygon visualization

The Ionic layer DOES NOT handle:

* Face embedding generation
* Camera frame processing
* TFLite inference
* ML Kit processing

These belong to native Android.

---

# Native Android Layer Responsibilities

The native Android layer handles:

* Camera stream
* Face detection
* Face landmark analysis
* Liveness checks
* TFLite embedding generation
* Cosine similarity calculation
* Encrypted local biometric storage

---

# Backend Responsibilities

The backend handles:

* Attendance validation
* Duplicate prevention
* Teacher enrollment management
* Device authorization
* Audit logs
* Attendance history
* Offline sync processing
* Attendance rule management

---

# Backend Architecture

Backend already follows feature-based architecture.

Attendance feature must integrate using the same structure.

---

# Backend Feature Structure

```text
features/attendance
```

---

# Recommended Backend Structure

```text
features/attendance
    attendance.controller.js
    attendance.routes.js
    attendance.service.js
    attendance.validation.js
    attendance.repository.js

features/attendance/admin
    adminAttendance.controller.js
    adminAttendance.routes.js
    adminAttendance.service.js

features/attendance/mobile
    mobileAttendance.controller.js
    mobileAttendance.routes.js
```

---

# Database Design (MongoDB)

# Collection: teacherFaceProfiles

Purpose:
Store enrolled teacher embeddings.

---

## Structure

```json
{
  "_id": "ObjectId",
  "teacherId": "ObjectId",
  "embeddingEncrypted": "string",
  "embeddingVersion": 1,
  "registeredBy": "adminId",
  "registeredAt": "date",
  "deviceBindingRequired": true,
  "active": true
}
```

---

# Collection: teacherDevices

Purpose:
Restrict one teacher to one authorized mobile device.

---

## Structure

```json
{
  "_id": "ObjectId",
  "teacherId": "ObjectId",
  "deviceIdHash": "string",
  "registeredAt": "date",
  "active": true
}
```

---

# Collection: attendanceRecords

Purpose:
Store attendance entries.

---

## Structure

```json
{
  "_id": "ObjectId",
  "teacherId": "ObjectId",
  "date": "2026-06-02",
  "checkInTime": "ISODate",
  "latitude": 0,
  "longitude": 0,
  "confidence": 0.91,
  "offlineSynced": false,
  "deviceIdHash": "string",
  "verificationMethod": "face",
  "status": "approved"
}
```

---

# Collection: attendanceAuditLogs

Purpose:
Track suspicious activity and verification events.

---

## Structure

```json
{
  "_id": "ObjectId",
  "teacherId": "ObjectId",
  "event": "MULTIPLE_FACE_DETECTED",
  "timestamp": "ISODate",
  "metadata": {}
}
```

---

# Capacitor Native Integration

# Why Native Android Plugin Is Required

ML Kit + TensorFlow Lite face recognition cannot be implemented reliably using only web technologies inside Ionic React.

Native Android processing is required for:

* CameraX integration
* ML Kit performance
* TFLite inference
* Secure local storage
* Reliable frame analysis

---

# Capacitor Workflow

## Install Android Platform

```bash
npm install @capacitor/android
npx cap add android
```

---

# Open Android Studio

```bash
npx cap open android
```

This opens the generated Android project.

All native attendance logic will be written inside this Android project.

---

# Native Plugin Strategy

Create a custom Capacitor plugin.

Recommended plugin name:

```text
FaceAttendancePlugin
```

---

# Plugin Responsibilities

The plugin will expose methods to Ionic React.

---

# JS → Native Methods

## verifyFace()

Used during attendance verification.

---

## registerTeacherFace()

Used only from admin-controlled device.

---

## getSecureDeviceId()

Used for device binding.

---

# Native → JS Response

Example:

```json
{
  "success": true,
  "confidence": 0.93,
  "livenessPassed": true
}
```

---

# Android Native Dependencies

# CameraX

Used for camera preview and image analysis.

Dependency:

```gradle
implementation "androidx.camera:camera-camera2:1.3.0"
implementation "androidx.camera:camera-lifecycle:1.3.0"
implementation "androidx.camera:camera-view:1.3.0"
implementation "androidx.camera:camera-core:1.3.0"
```

---

# ML Kit Face Detection

Used for:

* face detection
* landmarks
* eye-open detection
* liveness checks

Dependency:

```gradle
implementation 'com.google.mlkit:face-detection:16.1.5'
```

---

# TensorFlow Lite

Used for:

* embedding generation

Dependencies:

```gradle
implementation 'org.tensorflow:tensorflow-lite:2.14.0'
implementation 'org.tensorflow:tensorflow-lite-support:0.4.4'
```

---

# Face Detection Pipeline

# Step 1 — CameraX Frame Stream

Use CameraX ImageAnalysis.

Recommended resolution:

```text
480x640
```

Lower resolution improves performance.

---

# Step 2 — ML Kit Face Detection

Use:

```kotlin
FaceDetectorOptions
```

Configuration:

```kotlin
FaceDetectorOptions.Builder()
    .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
    .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
    .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
    .enableTracking()
```

---

# Why These Options

## PERFORMANCE_MODE_FAST

Optimized for realtime attendance verification.

---

## LANDMARK_MODE_ALL

Required for:

* eye detection
* head movement
* face alignment

---

## CLASSIFICATION_MODE_ALL

Required for:

* smile probability
* eye-open probability

Used for basic liveness.

---

# Liveness Rules (V1)

Basic liveness only.

Required checks:

* eyes open
* slight head turn
* single face visible

Reject if:

* multiple faces
* no eyes visible
* face too small
* low confidence

---

# TensorFlow Lite Face Embedding

# Model Selection

Use:

```text
MobileFaceNet
```

Reason:

* lightweight
* mobile optimized
* fast
* low memory usage

---

# Model Placement

Store model inside:

```text
android/app/src/main/assets/
```

Example:

```text
mobile_face_net.tflite
```

---

# Embedding Pipeline

```text
Camera Frame
    ↓
ML Kit Detect Face
    ↓
Crop Face Bitmap
    ↓
Resize To Model Input
    ↓
Normalize Pixels
    ↓
Run TFLite Model
    ↓
Generate Embedding Vector
```

---

# Cosine Similarity

Used to compare:

* enrolled embedding
* live embedding

---

# Thresholds (V1)

```text
0.85+ → success
0.70–0.85 → retry
below 0.70 → fail
```

---

# Secure Local Storage

# Required Storage

Store locally:

* encrypted embedding
* encrypted attendance queue
* device binding
* config cache

---

# Encryption Strategy

Use:

```text
Android Keystore
+
EncryptedSharedPreferences
```

DO NOT store:

* raw face images
* unencrypted embeddings

---

# Device Binding

# Rule

One teacher = one authorized device.

---

# Device Binding Flow

During first login:

```text
teacher login
    ↓
backend checks device
    ↓
if no device exists
    → register device
else
    → verify existing device
```

---

# If Teacher Changes Phone

Admin approval required.

---

# Attendance Flow (LOCKED)

# Step 1 — Open Attendance Screen

Teacher opens attendance page.

---

# Step 2 — GPS Permission

Request location permission.

---

# Step 3 — Fetch Current GPS

Use Capacitor Geolocation plugin.

---

# Step 4 — Polygon Validation

Check:

* teacher inside allowed polygon

Reject if outside.

---

# Step 5 — Open Native Verification

Call Capacitor plugin:

```ts
FaceAttendancePlugin.verifyFace()
```

---

# Step 6 — Native Verification

Native layer performs:

* camera capture
* ML Kit detection
* liveness checks
* TFLite embedding generation
* similarity comparison

---

# Step 7 — Result Returned To Ionic

Example:

```json
{
  "success": true,
  "confidence": 0.92
}
```

---

# Step 8 — Create Attendance Packet

```json
{
  "teacherId": "T101",
  "timestamp": 1748852012,
  "latitude": 22.8,
  "longitude": 86.2,
  "confidence": 0.92,
  "deviceIdHash": "abc123"
}
```

---

# Step 9 — API Submission

Call:

```text
POST /api/teacher/attendance/mark
```

---

# Step 10 — Offline Queue

If network unavailable:

Store locally.

Sync later automatically.

---

# Offline Sync Strategy

Use:

* local encrypted queue
* retry mechanism

---

# Sync Triggers

Retry sync when:

* internet reconnects
* app opens
* periodic background sync

---

# Backend API Design

# Teacher APIs

## POST /api/teacher/attendance/mark

Purpose:
Submit attendance.

---

## GET /api/teacher/attendance/history

Purpose:
Attendance history.

---

## GET /api/teacher/attendance/status

Purpose:
Current attendance status.

---

# Admin APIs

## POST /api/admin/attendance/register-face

Purpose:
Register teacher embedding.

---

## PUT /api/admin/attendance/update-face

Purpose:
Update face embedding.

---

## GET /api/admin/attendance/alerts

Purpose:
Suspicious activity monitoring.

---

# Face Enrollment Flow

# Important Rule

Teacher NEVER self-registers face.

Only admin device can register face.

---

# Enrollment Process

```text
Admin selects teacher
    ↓
Capture multiple frames
    ↓
Generate embeddings
    ↓
Average embeddings
    ↓
Encrypt embedding
    ↓
Upload to backend
```

---

# Recommended Capture Count

```text
10–15 face frames
```

with:

* different angles
* slight movement
* different expressions

---

# Edge Case Handling

# Multiple Faces

Reject immediately.

---

# Poor Lighting

Prompt retry.

---

# No Internet

Store attendance locally.

---

# GPS Weak Accuracy

Require:

```text
accuracy < 50 meters
```

Else:
request better signal.

---

# Camera Permission Denied

Attendance blocked until granted.

---

# Backend Down

Queue attendance locally.

---

# App Reinstall

Teacher must re-login.

Embedding downloaded again.

---

# Corrupted Local Data

Clear local attendance module storage and re-sync.

---

# Security Assumptions

# V1 Security Goal

Prevent:

* casual spoofing
* fake attendance
* location abuse

V1 does NOT guarantee:

* root-level protection
* military-grade anti-tampering
* advanced biometric attacks

---

# V2 Future Enhancements

NOT part of current MVP.

---

# Planned V2 Features

* Play Integrity API
* Advanced spoof detection
* Backend fraud scoring
* Root detection
* iOS support
* Face snapshot audit uploads
* Advanced anomaly detection

---

# Final Locked Architecture Summary

```text
Teacher Mobile App
    ↓
GPS Polygon Validation
    ↓
Native Face Verification
    ↓
ML Kit Face Detection
    ↓
TensorFlow Lite Embedding
    ↓
Local Similarity Match
    ↓
Attendance Packet
    ↓
Online API OR Offline Queue
    ↓
Backend Validation
    ↓
Attendance Approved
```

---

# Final Engineering Principle

The attendance module must remain:

* modular
* mobile-first
* offline-capable
* maintainable
* upgradeable

without forcing redesign of the existing ERP architecture.
