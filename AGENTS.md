# AI-COMMERCE Codex Rules

## Project Roots
Development Root:
D:\AI-ECOMMERCE

Production Root:
D:\AI-ECOMMERCE\AI-CommerceLIVE

Audit/Backup Output:
D:\AI-ECOMMERCE\PROJECT_AUDIT

## Main Folders
Only these app folders are valid:
- server
- admin
- client

Production folder must contain only:
- server
- admin
- client

## Critical Rules
- 
- Work in Development Root first:D:\AI-ECOMMERCE
- Dont Copy any file or folder to Production:D:\AI-ECOMMERCE\AI-CommerceLIVE without Server admin and client folder
- After a phase is completed and build passes: Copy only updated server/admin/client folders files to Production:D:\AI-ECOMMERCE\AI-CommerceLIVE
- Git commit and push ONLY from Production Root:D:\AI-ECOMMERCE\AI-CommerceLIVE
- Supabase migration only when database/schema changes exist.
- Never modify Production directly before Development build passes.
- Never modify files without backup.
- No blind/global regex patching.
- Inspect exact file before changing.
- Use surgical file-specific fixes only.
- Do not create duplicate APIs, duplicate components, or duplicate routes.
- Do not remove valid routes from server app.ts.
- All scripts must be Windows PowerShell.
- Every phase must create report TXT and backup ZIP in PROJECT_AUDIT.
- After one task is complete, copy fixed folders to AI-CommerceLIVE.
- Git push must be from production folder.
- Supabase migration must be planned after local validation.
- Follow the Development Sequence: Database → User Role → Server → Admin → Client → Build PASS → Audit PASS
- Dont Blind Update Audit First
- Keep CSS Theme style Same Style like others Admin and Client Pages implemented
- Complete every development Admin-Server-Client Complete

## Required Workflow
1. Audit exact issue.
2. Create backup the file or folder ZIP once before code update.
3. Patch only required files.
4. Run validation:
   - server build/typecheck
   - admin build
   - client build
   - Playwright browser/view tests
5. Copy to production folder.
6. Git status.
7. Commit and push from production folder.
8. Prepare Supabase DB/table migration notes.

## Browser/View Test Requirement
Codex must test:
- Chromium
- Firefox
- WebKit
- Desktop viewport
- Laptop viewport
- Tablet viewport
- Mobile viewport

Important pages:
- client /
- client /shop
- client /account
- client /checkout
- client /login
- admin /dashboard
- admin /homepage-hero
- admin /products
- admin /store-settings

## Master File Ownership
- Every file has one owner.
- Never create another implementation.
- Update the existing owner.


## Business Flow Verification

প্রত্যেক Phase এ Verify করবে

Customer

↓

Cart

↓

Checkout

↓

Payment

↓

Order

↓

Invoice

↓

Stock

↓

Ledger

↓

Report

৫।

## Admin → Client Verification

প্রত্যেক কাজ শেষে Verify করবে

Admin এ Change

↓

Client এ Reflect করছে?

↓

Real API?

↓

Real Database?

↓

Real UI?

↓

Real Permission?


## Responsive Gate
- Playwright
- 320
- 360
- 390
- 430
- 768
- 820
- 1024
- 1280
- 1366
- 1440
- 1536
- 1920

সব Screen এ

- No Overflow
- No Gap
- No Hidden Button
- No Broken Table
- No Duplicate Header
- No Duplicate Sidebar


## AI Placement Review

প্রত্যেক Phase এ Review করবে

- AI Button বেশি?
- AI Button কম?
- AI কোথায় থাকা উচিত?
- AI কোথায় থাকা উচিত না?


## Admin Control Matrix

সবচেয়ে Important Verify করবে:

Client এ যা আছে

↓

Admin থেকে Manage করা যায়?

YES / NO

যদি না যায়

Report করবে।


## Production Release Gate

- Git Push এর আগে
- Verify করবে
- Server PASS
- Admin PASS
- Client PASS
- Playwright PASS
- Security PASS
- Responsive PASS
- RBAC PASS
- Database PASS
- Supabase PASS

- No Duplicate
- Git Clean
- তারপর Push।


## Future Development Rule

সবচেয়ে Important

Every future feature must follow

Database

↓

API

↓

Admin

↓

Client

↓

Build

↓

Playwright

↓

Production Sync

↓

Git Push

↓

Deploy

- কখনো Client আগে Database পরে এইভাবে Development করা যাবে না।

## FINAL RULES LOCKED
✅ Development
Development Root = D:\AI-ECOMMERCE
Production Root = D:\AI-ECOMMERCE\AI-CommerceLIVE
Production-এ direct code change নয়
✅ Backup
Full Backup একবারই (ইতিমধ্যে নেওয়া হয়েছে)
এরপর Phase-specific backup লাগলে শুধু affected files/folders
✅ Existing File Rule
Existing file update
No duplicate file
No FeatureNew
No FeatureFinal
No Copy
No Temp
✅ Build Gate

প্রতি Phase শেষে:

Server Build
Admin Build
Client Build
Playwright Browser Test
Responsive Verification
✅ Production Gate

শুধু PASS হলে:

Production Sync
Production Build
Git Commit
Git Push
✅ Database
Supabase migration শুধুমাত্র Phase 5 বা schema change হলে
Schema diff review ছাড়া migration নয়
Destructive migration কখনো approval ছাড়া নয়


## Final RELEASE_CHECKLIST

প্রত্যেক Release-এর আগে Codex এটি verify করবে।

Database PASS

Server PASS

Admin PASS

Client PASS

Playwright PASS

Responsive PASS

Security PASS

RBAC PASS

Tenant PASS

AI PASS

Performance PASS

Accessibility PASS

Production Build PASS

Git Clean

Supabase Status Verified

Deployment Ready

