# Firebase Firestore Database Design

This document outlines the data structure for the R&D (Run and Develop) application using Google Cloud Firestore. The design is based on the features the application will support, focusing on efficient queries and scalability.

## Design Principles

- **Data is structured for queries:** We design the database based on how the app's screens will fetch and display data.
- **Denormalization for performance:** We duplicate small, non-volatile data (like `username`) across different documents to avoid costly and slow JOIN-like operations (which don't exist in Firestore).
- **Shallow documents:** We keep documents relatively small and avoid deep nesting where possible, preferring separate top-level collections.

---

## 1. User and Profile Data

### `users`

This is the central collection for all user-specific information. It serves the **User Data** and **User Profile** features. The document ID for each user is their Firebase Authentication `uid`.

**Path:** `/users/{userId}`

**Document Structure:**
```json
{
  "uid": "string",
  "fullName": "string",
  "username": "string",
  "phone": "string",
  "email": "string",
  "dob": "date",
  "gender": "string",
  "profession": "string",
  "profileImageUrl": "string",
  "bio": "string",
  "subscriptionStatus": "string", // e.g., "free", "pro", "expired"
  "createdAt": "timestamp"
}
```

---

## 2. Dashboard and Progress Tracking

These collections power the **User Dashboard** and **Progress** features.

### `runs`

Stores every single run or workout activity recorded by any user.

**Path:** `/runs/{runId}`

**Document Structure:**
```json
{
  "runId": "string",
  "userId": "string",
  "username": "string", // Denormalized for feeds
  "distance": "number", // in kilometers
  "duration": "number", // in seconds
  "avgPace": "number", // minutes per km
  "caloriesBurned": "number",
  "date": "timestamp",
  "title": "string",
  "notes": "string"
}
```

### `userStatistics`

Stores aggregated statistics for each user, perfect for displaying on the dashboard. This data is updated via Cloud Functions whenever a new run is added.

**Path:** `/userStatistics/{userId}`

**Document Structure:**
```json
{
  "userId": "string",
  "totalDistance": "number",
  "totalRuns": "number",
  "totalDuration": "number",
  "averagePace": "number",
  "lastUpdated": "timestamp"
}
```

---

## 3. Events

### `events`

This collection stores global event details that are visible to all users.

**Path:** `/events/{eventId}`

**Document Structure:**
```json
{
  "eventId": "string",
  "name": "string",
  "description": "string",
  "date": "timestamp",
  "location": "string",
  "isVirtual": "boolean",
  "registrationLink": "string",
  "createdBy": "string" // Admin or Crew ID
}
```

### `eventRegistrations`

This collection links users to the events they have registered for.

**Path:** `/eventRegistrations/{registrationId}`

**Document Structure:**
```json
{
  "registrationId": "string",
  "eventId": "string",
  "userId": "string",
  "username": "string", // Denormalized
  "registeredAt": "timestamp"
}
```

---

## 4. Community

### `crews`

A crew is a group of users who can run together and participate in crew-specific events.

**Path:** `/crews/{crewId}`

**Document Structure:**
```json
{
  "crewId": "string",
  "name": "string",
  "description": "string",
  "ownerId": "string",
  "memberIds": ["uid1", "uid2", "uid3"],
  "createdAt": "timestamp"
}
```

### `posts`

This collection powers the community feed. 

**Path:** `/posts/{postId}`

**Document Structure:**
```json
{
  "postId": "string",
  "authorId": "string",
  "authorUsername": "string",
  "authorProfileImageUrl": "string",
  "type": "string", // "run_share" or "text_post"
  "runId": "string", // Optional
  "text": "string",
  "likesCount": "number",
  "commentCount": "number",
  "createdAt": "timestamp"
}
```

**Data Integrity & Security Rules:**
- `likesCount` and `commentCount` should **not** be client-writable. They should be updated using Cloud Functions that trigger when a document is added/deleted in the `likes` or `comments` subcollections. This prevents users from setting fake numbers and ensures data integrity.
- A user should only be able to create a post, not edit fields like `authorId` after creation.

### Subcollection: `likes`

Tracks who liked a specific post. The existence of a document indicates a like.

**Path:** `/posts/{postId}/likes/{userId}`

**Document Structure:**
```json
{
  "likedAt": "timestamp"
}
```

### Subcollection: `comments`

Stores all comments for a specific post.

**Path:** `/posts/{postId}/comments/{commentId}`

**Document Structure:**
```json
{
  "commentId": "string",
  "authorId": "string",
  "authorUsername": "string",
  "authorProfileImageUrl": "string",
  "text": "string",
  "createdAt": "timestamp"
}
```

---

## 5. Subscriptions and Payments

### `subscriptions`

Manages the subscription status for each user.

**Path:** `/subscriptions/{userId}`

**Document Structure:**
```json
{
  "userId": "string",
  "planId": "string",
  "status": "string", // "active", "canceled", "past_due"
  "startDate": "timestamp",
  "endDate": "timestamp",
  "stripeSubscriptionId": "string"
}
```

### `transactions`

Logs every payment made by a user.

**Path:** `/transactions/{transactionId}`

**Document Structure:**
```json
{
  "transactionId": "string",
  "userId": "string",
  "amount": "number",
  "currency": "string",
  "planId": "string",
  "status": "string", // "completed", "failed", "refunded"
  "stripeChargeId": "string",
  "createdAt": "timestamp"
}
```
