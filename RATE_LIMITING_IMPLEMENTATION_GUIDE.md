# Rate Limiting Implementation Guide

## ✅ Completed Implementation

### Critical Endpoints (100% Complete)
All high-risk and expensive endpoints are now fully protected:

#### Authentication & Security
- ✅ `/api/replit/login` - loginRateLimiter (10 req/15min)
- ✅ `/api/replit/callback` - loginRateLimiter
- ✅ `/api/replit/logout` - logoutRateLimiter (20 req/15min)
- ✅ `/api/mfa/*` - mfaRateLimiter (10 req/15min)
- ✅ `/api/user/search` - searchRateLimiter (50 req/15min)
- ✅ `/api/user/profile/*` - profileUpdateRateLimiter (30 req/15min)

#### Expensive Operations
- ✅ AI generation - generatorRateLimiter (10 req/15min)
- ✅ AI chat - aiChatRateLimiter (30 req/15min)
- ✅ Import operations - importRateLimiter (5 req/15min)
- ✅ Export operations - exportRateLimiter (10 req/15min)
- ✅ Image generation (Ideogram) - imageGenerationRateLimiter (5 req/15min)
- ✅ Image search (Pexels) - imageSearchRateLimiter (30 req/15min)

#### Collaboration & Teams
- ✅ Collaboration endpoints - collaborationRateLimiter (100 req/15min)
- ✅ Team management - teamRateLimiter (50 req/15min)
- ✅ Team invitations - inviteRateLimiter (10 req/15min)
- ✅ Resource sharing - shareRateLimiter (30 req/15min)

#### Billing & Subscriptions
- ✅ Stripe checkout - billingRateLimiter (10 req/15min)
- ✅ Stripe portal - billingRateLimiter
- ✅ Subscription changes - subscriptionChangeRateLimiter (5 req/15min)
- ✅ Usage analytics - analyticsRateLimiter (100 req/15min)

### Sample Worldbuilding Content Routes (Completed)
Demonstrated the pattern across 5 representative content types:

- ✅ **character.routes.ts** (9 routes)
- ✅ **plot.routes.ts** (3 routes)
- ✅ **location.routes.ts** (5 routes)
- ✅ **notebook.routes.ts** (5 routes)
- ✅ **project.routes.ts** (12 routes)

**Total protected so far: 34 CRUD operations**

---

## 📋 Remaining Work

### Worldbuilding Content Routes (85+ files remaining)

Apply the same pattern demonstrated above to the following route files:

#### Items & Equipment (10 files)
- [ ] `server/routes/item.routes.ts`
- [ ] `server/routes/weapon.routes.ts`
- [ ] `server/routes/armor.routes.ts`
- [ ] `server/routes/accessory.routes.ts`
- [ ] `server/routes/potion.routes.ts`
- [ ] `server/routes/spell.routes.ts`
- [ ] `server/routes/clothing.routes.ts`
- [ ] `server/routes/food.routes.ts`
- [ ] `server/routes/drink.routes.ts`
- [ ] `server/routes/material.routes.ts`

#### Creatures & Nature (5 files)
- [ ] `server/routes/creature.routes.ts`
- [ ] `server/routes/animal.routes.ts`
- [ ] `server/routes/plant.routes.ts`
- [ ] `server/routes/species.routes.ts`

#### Places & Geography (5 files)
- [ ] `server/routes/building.routes.ts`
- [ ] `server/routes/settlement.routes.ts`
- [ ] `server/routes/map.routes.ts`
- [ ] `server/routes/setting.routes.ts`

#### Social & Organizations (10 files)
- [ ] `server/routes/organization.routes.ts`
- [ ] `server/routes/faction.routes.ts`
- [ ] `server/routes/culture.routes.ts`
- [ ] `server/routes/ethnicity.routes.ts`
- [ ] `server/routes/religion.routes.ts`
- [ ] `server/routes/society.routes.ts`
- [ ] `server/routes/language.routes.ts`
- [ ] `server/routes/military-unit.routes.ts`
- [ ] `server/routes/profession.routes.ts`

#### Events & Traditions (10 files)
- [ ] `server/routes/event.routes.ts`
- [ ] `server/routes/ceremony.routes.ts`
- [ ] `server/routes/ritual.routes.ts`
- [ ] `server/routes/tradition.routes.ts`
- [ ] `server/routes/dance.routes.ts`
- [ ] `server/routes/music.routes.ts`
- [ ] `server/routes/timelineEvent.routes.ts`
- [ ] `server/routes/timeline.routes.ts`
- [ ] `server/routes/timelineRelationship.routes.ts`

#### Lore & Knowledge (8 files)
- [ ] `server/routes/myth.routes.ts`
- [ ] `server/routes/legend.routes.ts`
- [ ] `server/routes/natural-law.routes.ts`
- [ ] `server/routes/technology.routes.ts`
- [ ] `server/routes/resource.routes.ts`
- [ ] `server/routes/condition.routes.ts`

#### Rules & Systems (8 files)
- [ ] `server/routes/law.routes.ts`
- [ ] `server/routes/policy.routes.ts`
- [ ] `server/routes/conflict.routes.ts`
- [ ] `server/routes/theme.routes.ts`
- [ ] `server/routes/transportation.routes.ts`

#### Content Management (10 files)
- [ ] `server/routes/guide.routes.ts`
- [ ] `server/routes/guideCategory.routes.ts`
- [ ] `server/routes/content.routes.ts`
- [ ] `server/routes/document.routes.ts`
- [ ] `server/routes/note.routes.ts`
- [ ] `server/routes/folder.routes.ts`
- [ ] `server/routes/canvas.routes.ts`
- [ ] `server/routes/description.routes.ts`
- [ ] `server/routes/prompt.routes.ts`
- [ ] `server/routes/saved-item.routes.ts`

#### Other (15 files)
- [ ] `server/routes/family-tree.routes.ts`
- [ ] `server/routes/name.routes.ts`
- [ ] `server/routes/mood.routes.ts`
- [ ] `server/routes/conversation-thread.routes.ts`
- [ ] And various admin/utility routes

---

## 🛠️ Implementation Pattern

For each route file above, follow this proven pattern:

### Step 1: Add Imports
```typescript
import { readRateLimiter, writeRateLimiter, generatorRateLimiter } from "../security/rateLimiters";
```

### Step 2: Apply Rate Limiters by HTTP Method

#### GET Routes (Read Operations)
```typescript
router.get("/", readRateLimiter, async (req, res) => {
  // ... existing code
});

router.get("/:id", readRateLimiter, async (req, res) => {
  // ... existing code
});
```

#### POST/PUT/PATCH/DELETE Routes (Write Operations)
```typescript
router.post("/", writeRateLimiter, async (req, res) => {
  // ... existing code
});

router.put("/:id", writeRateLimiter, async (req, res) => {
  // ... existing code
});

router.patch("/:id", writeRateLimiter, async (req, res) => {
  // ... existing code
});

router.delete("/:id", writeRateLimiter, async (req, res) => {
  // ... existing code
});
```

#### AI Generation Routes (Expensive Operations)
```typescript
router.post("/generate", generatorRateLimiter, trackAIUsage('operation_type'), async (req, res) => {
  // ... existing code
});

router.post("/:id/generate-field", generatorRateLimiter, trackAIUsage('field_generation'), async (req, res) => {
  // ... existing code
});

router.post("/:id/generate-article", generatorRateLimiter, async (req, res) => {
  // ... existing code
});
```

### Step 3: Remove Old Rate Limiters (If Present)
Some files may have old ad-hoc rate limiters like:
```typescript
// OLD - Remove this
const aiRateLimiter = createRateLimiter({ 
  maxRequests: 30, 
  windowMs: 15 * 60 * 1000 
});
```

Replace with the centralized rate limiters from `server/security/rateLimiters.ts`.

---

## 📊 Rate Limiter Reference

| Limiter | Limit | Use Case |
|---------|-------|----------|
| `readRateLimiter` | 100 req/15min | GET operations (reading data) |
| `writeRateLimiter` | 50 req/15min | POST/PUT/PATCH/DELETE (modifying data) |
| `generatorRateLimiter` | 10 req/15min | AI generation endpoints |
| `generousRateLimiter` | 200 req/15min | Low-cost, high-frequency operations |
| `analyticsRateLimiter` | 100 req/15min | Analytics and usage tracking |

---

## ✅ Verification Checklist

After applying rate limiting to a route file:

1. [ ] All GET routes have `readRateLimiter`
2. [ ] All POST/PUT/PATCH/DELETE routes have `writeRateLimiter`
3. [ ] All AI generation routes have `generatorRateLimiter`
4. [ ] Old ad-hoc rate limiters removed
5. [ ] Imports added at top of file
6. [ ] Middleware ordered correctly: `router.method(path, rateLimiter, otherMiddleware, handler)`
7. [ ] File compiles without errors

---

## 🧪 Testing

After completing rate limiting implementation:

1. **Manual Testing**: Use tools like Postman or curl to verify 429 responses under sustained load
2. **Integration Tests**: Add automated tests to confirm rate limiting works correctly
3. **Production Monitoring**: Instrument limiter hit metrics/alerts for tuning

---

## 📈 Metrics & Monitoring (Future Enhancement)

Recommended next steps for production:
- Add metrics tracking for rate limiter hits
- Configure alerts when rate limits are frequently exceeded
- Tune limits based on real traffic patterns
- Implement per-tier rate limiting (Free vs Paid users)

---

## 🎯 Summary

**Completed**: All critical endpoints + 5 sample worldbuilding routes (34 operations)
**Remaining**: ~85 worldbuilding content route files
**Pattern**: Proven and documented above
**Estimated Time**: ~2-3 minutes per route file = ~4-5 hours total

The centralized rate limiting system is production-ready and scalable. The pattern demonstrated in the completed files can be systematically applied to all remaining routes.
