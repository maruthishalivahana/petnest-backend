# Advertisement System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ADVERTISEMENT SYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC FLOW (No Auth)                        │
└─────────────────────────────────────────────────────────────────────┘

1. AD REQUEST SUBMISSION
   POST /api/ad-requests
   ↓
   [AdRequestController] → [AdRequestService] → [AdRequestRepo]
   ↓
   MongoDB (AdRequest collection)
   Status: pending

2. VIEW ADS BY PLACEMENT
   GET /api/ads?placement=home_top_banner&device=mobile
   ↓
   [AdController] → [AdService] → [AdRepo]
   ↓
   Returns: Active ads (filtered by date, device, placement)

3. TRACK IMPRESSION
   POST /api/ads/:id/impression
   ↓
   [AdController] → [AdService] → [AdRepo]
   ↓
   MongoDB: $inc impressions counter

4. TRACK CLICK
   POST /api/ads/:id/click
   ↓
   [AdController] → [AdService] → [AdRepo]
   ↓
   MongoDB: $inc clicks counter

5. GET FEED WITH INLINE ADS
   GET /api/feed?page=1&limit=12&device=mobile
   ↓
   [FeedController] → [FeedService]
   ├─→ [FeedRepo] → Fetch pets
   └─→ [AdRepo] → Fetch pet_feed_inline ads
   ↓
   Mix: [pet, pet, pet, pet, AD, pet, pet, pet, pet, AD, ...]
   ↓
   Returns: Unified feed with type markers

┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN FLOW (Auth Required)                      │
└─────────────────────────────────────────────────────────────────────┘

1. REVIEW AD REQUESTS
   GET /api/admin/ad-requests?status=pending
   ↓
   [Auth Middleware] → [Role Check: admin]
   ↓
   [AdRequestController] → [AdRequestService] → [AdRequestRepo]
   ↓
   Returns: Paginated ad requests

2. APPROVE/REJECT REQUEST
   PATCH /api/admin/ad-requests/:id/status
   Body: { status: "approved", rejectionReason: "..." }
   ↓
   [Auth Middleware] → [Validation] → [AdRequestController]
   ↓
   Update status in MongoDB

3. CREATE AD
   POST /api/admin/ads
   ↓
   [Auth Middleware] → [Validation] → [AdController]
   ↓
   [AdService] → [AdRepo]
   ↓
   MongoDB (Ad collection)

4. MANAGE ADS
   GET    /api/admin/ads              - List all ads
   GET    /api/admin/ads/:id          - Get single ad
   PATCH  /api/admin/ads/:id          - Update ad
   DELETE /api/admin/ads/:id          - Delete ad
   PATCH  /api/admin/ads/:id/toggle   - Toggle active status

┌─────────────────────────────────────────────────────────────────────┐
│                         DATA MODELS                                 │
└─────────────────────────────────────────────────────────────────────┘

AdRequest Model (adsRequest.model.ts)
┌─────────────────────────────────┐
│ brandName: string               │
│ contactEmail: string            │
│ contactNumber?: string          │
│ requestedPlacement: string      │
│ message?: string                │
│ mediaUrl?: string               │
│ status: pending|approved|reject │
│ rejectionReason?: string        │
│ timestamps: true                │
└─────────────────────────────────┘

Ad Model (adsLising.model.ts)
┌─────────────────────────────────┐
│ title: string                   │
│ imageUrl: string                │
│ ctaText: string                 │
│ redirectUrl: string             │
│ placement: enum (10 options)    │
│ device: mobile|desktop|both     │
│ targetPages: string[]           │
│ startDate: Date                 │
│ endDate: Date                   │
│ impressions: number (0)         │
│ clicks: number (0)              │
│ isActive: boolean (true)        │
│ timestamps: true                │
└─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      AD PLACEMENTS                                  │
└─────────────────────────────────────────────────────────────────────┘

Home Page:
  ├─ home_top_banner      (Top banner)
  ├─ home_sidebar         (Side column)
  └─ home_footer          (Bottom banner)

Pet Pages:
  ├─ pet_feed_inline      (Between pet cards)
  ├─ pet_mobile_sticky    (Fixed mobile banner)
  ├─ pet_detail_below_desc (Below description)
  └─ pet_detail_sidebar   (Side column)

Blog:
  ├─ blog_mid_article     (Mid-article)
  └─ blog_sidebar         (Side column)

Dashboard:
  └─ dashboard_header     (Dashboard top)

┌─────────────────────────────────────────────────────────────────────┐
│                      MODULE STRUCTURE                               │
└─────────────────────────────────────────────────────────────────────┘

src/
├── database/
│   └── models/
│       ├── adsRequest.model.ts     ✅ Ad request model
│       └── adsLising.model.ts      ✅ Ad model
│
├── modules/
│   ├── adRequest/                  ✅ Ad request module
│   │   ├── adRequest.controller.ts
│   │   ├── adRequest.service.ts
│   │   ├── adRequest.repo.ts
│   │   ├── adRequest.types.ts
│   │   └── index.ts
│   │
│   ├── ad/                         ✅ Ad management module
│   │   ├── ad.controller.ts
│   │   ├── ad.service.ts
│   │   ├── ad.repo.ts
│   │   ├── ad.types.ts
│   │   └── index.ts
│   │
│   └── feed/                       ✅ Feed with ads module
│       ├── feed.controller.ts
│       ├── feed.service.ts
│       ├── feed.repo.ts
│       ├── feed.types.ts
│       └── index.ts
│
├── routes/
│   ├── ad.routes.ts                ✅ All ad routes
│   └── index.ts                    ✅ Updated
│
├── validations/
│   └── ad.validation.ts            ✅ Zod schemas
│
└── shared/
    └── middlewares/
        ├── auth.middleware.ts      (existing)
        └── validation.middleware.ts ✅ New

┌─────────────────────────────────────────────────────────────────────┐
│                    REQUEST/RESPONSE FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

Client Request
    ↓
Express Router (routes/ad.routes.ts)
    ↓
[Middleware Stack]
    ├─ Authentication (if admin route)
    ├─ Role Check (if admin route)
    └─ Validation (Zod schema)
    ↓
Controller Layer
    ├─ Request parsing
    ├─ Input validation
    └─ Service call
    ↓
Service Layer
    ├─ Business logic
    ├─ Data validation
    ├─ Date checks
    └─ Repository call
    ↓
Repository Layer
    ├─ MongoDB queries
    ├─ Data filtering
    └─ Aggregations
    ↓
MongoDB Database
    ↓
← Response flows back through layers ←
    ↓
JSON Response to Client

┌─────────────────────────────────────────────────────────────────────┐
│                   TRACKING WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

Frontend:
    ↓
1. Fetch ad by placement
    ↓
2. Render ad in DOM
    ↓
3. Intersection Observer
   (when ad becomes visible)
    ↓
4. POST /api/ads/:id/impression
    ↓
   Backend increments counter
    ↓
5. User clicks ad
    ↓
6. POST /api/ads/:id/click
    ↓
   Backend increments counter
    ↓
7. Redirect to ad.redirectUrl

┌─────────────────────────────────────────────────────────────────────┐
│                     FEED ALGORITHM                                  │
└─────────────────────────────────────────────────────────────────────┘

Input: GET /api/feed?limit=12

Step 1: Fetch 12 pets from database
Step 2: Fetch active pet_feed_inline ads
Step 3: Mix algorithm

pets = [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12]
ads = [A1, A2, A3]

Result:
[
  {type: "pet", data: P1},
  {type: "pet", data: P2},
  {type: "pet", data: P3},
  {type: "pet", data: P4},
  {type: "ad", data: A1},    ← After 4 pets
  {type: "pet", data: P5},
  {type: "pet", data: P6},
  {type: "pet", data: P7},
  {type: "pet", data: P8},
  {type: "ad", data: A2},    ← After 4 more pets
  {type: "pet", data: P9},
  {type: "pet", data: P10},
  {type: "pet", data: P11},
  {type: "pet", data: P12}
]

Step 4: Return unified feed

┌─────────────────────────────────────────────────────────────────────┐
│                   VALIDATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────┘

Request
    ↓
Validation Middleware
    ↓
Zod Schema Parse
    ├─ Success → next()
    └─ Fail → 400 JSON error response
        {
          success: false,
          message: "Validation error",
          errors: [
            { field: "title", message: "Title is required" }
          ]
        }

┌─────────────────────────────────────────────────────────────────────┐
│                   SECURITY FEATURES                                 │
└─────────────────────────────────────────────────────────────────────┘

✓ JWT Authentication for admin routes
✓ Role-based access control (admin only)
✓ Input validation with Zod schemas
✓ Date range validation
✓ URL validation for imageUrl and redirectUrl
✓ Atomic MongoDB operations for tracking
✓ Type safety with TypeScript
✓ Error handling at all layers

┌─────────────────────────────────────────────────────────────────────┐
│                     SUCCESS CRITERIA                                │
└─────────────────────────────────────────────────────────────────────┘

✅ Public advertiser request flow (no login)
✅ Admin APIs for request management
✅ Ad CRUD operations (admin only)
✅ Complete Ad schema with all required fields
✅ 10 placement types
✅ Device targeting (mobile/desktop/both)
✅ Date-based scheduling
✅ Placement-based ad fetching (public)
✅ Feed API with inline ads (1 ad per 4 pets)
✅ Impression tracking
✅ Click tracking
✅ MVC architecture
✅ Validation with Zod
✅ Pagination
✅ Consistent JSON responses
✅ Async/await error handling
✅ TypeScript types
✅ Complete documentation
