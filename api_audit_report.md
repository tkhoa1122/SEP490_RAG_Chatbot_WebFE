# Detailed API Mapping Report (Backend -> UI Components)

## 1. Missing Completely (No API wrapper in frontend)
- 🔴 **MISSING COMPLETELY**: `POST /api/v1/documents/upload` - No API wrapper in frontend.
- 🔴 **MISSING COMPLETELY**: `POST /api/v1/payments/callback` - No API wrapper in frontend.

## 2. Missing UI (API wrapper exists, but UI does not use it)
- 🟡 **MISSING UI**: `GET /api/v1/users` - Wrapper exists (`userAPI`), but NEVER used in UI.
- 🟡 **MISSING UI**: `GET /api/v1/users/{id}` - Wrapper exists (`userAPI`), but NEVER used in UI.
- 🟡 **MISSING UI**: `DELETE /api/v1/users/{id}` - Wrapper exists (`userAPI`), but NEVER used in UI.
- 🟡 **MISSING UI**: `PUT /api/v1/users/{id}` - Wrapper exists (`userAPI`), but NEVER used in UI.

## 3. Implemented (API wrapper exists and used in UI)
- ✅ **IMPLEMENTED**: `POST /api/v1/api-keys` - Used in 1 UI files (e.g., `\src\components\business\settings\ApiKeysManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/api-keys` - Used in 1 UI files (e.g., `\src\components\business\settings\ApiKeysManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/api-keys/{apiKeyId}` - Used in 1 UI files (e.g., `\src\components\business\settings\ApiKeysManager.tsx`).
- ✅ **IMPLEMENTED**: `DELETE /api/v1/api-keys/{id}` - Used in 1 UI files (e.g., `\src\components\business\settings\ApiKeysManager.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/auth/login` - Used in 4 UI files (e.g., `\src\app\[tenant_id]\(storefront)\cart\page.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/auth/me` - Used in 8 UI files (e.g., `\src\app\(auth)\login\page.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/businesses` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/businesses` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/businesses/profile` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `PUT /api/v1/businesses/profile` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `PUT /api/v1/businesses/{id}/verify` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/catalog-teams` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/catalog-teams` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/catalog-teams/{id}` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `PUT /api/v1/catalog-teams/{id}` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `DELETE /api/v1/catalog-teams/{id}` - Used in 9 UI files (e.g., `\src\components\business\billing\BillingManager.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/payments` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/payments` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/payments/test-success` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/payments/order/{orderCode}` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/products` - Used in 5 UI files (e.g., `\src\app\[tenant_id]\(storefront)\page.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/subscriptions` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/subscriptions` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `PUT /api/v1/subscriptions/{id}` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `DELETE /api/v1/subscriptions/{id}` - Used in 5 UI files (e.g., `\src\app\payment-success\page.tsx`).
- ✅ **IMPLEMENTED**: `POST /api/v1/system-contents` - Used in 1 UI files (e.g., `\src\components\dashboard\SystemContentsManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/system-contents` - Used in 1 UI files (e.g., `\src\components\dashboard\SystemContentsManager.tsx`).
- ✅ **IMPLEMENTED**: `PUT /api/v1/system-contents/{id}` - Used in 1 UI files (e.g., `\src\components\dashboard\SystemContentsManager.tsx`).
- ✅ **IMPLEMENTED**: `DELETE /api/v1/system-contents/{id}` - Used in 1 UI files (e.g., `\src\components\dashboard\SystemContentsManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/system-contents/{id}` - Used in 1 UI files (e.g., `\src\components\dashboard\SystemContentsManager.tsx`).
- ✅ **IMPLEMENTED**: `GET /api/v1/system-contents/key/{key}` - Used in 1 UI files (e.g., `\src\components\dashboard\SystemContentsManager.tsx`).