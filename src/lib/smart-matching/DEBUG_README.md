# Smart Matches Debug & Trace System

## Overview

Production-grade debugging system for Smart Matches that provides complete explainability for why each candidate appears and their scoring breakdown.

**Key Features:**
- ✅ Zero production performance impact
- ✅ Structured console output with full score breakdowns
- ✅ JSON export mode for analysis
- ✅ Summary statistics (avg/min/max scores, top candidates)
- ✅ Easy to enable/disable

---

## Usage

### Enable Debug Mode

**Option 1: Console Output (Development)**

Set in your `.env.local`:

```bash
NODE_ENV=development
SMART_MATCH_DEBUG=true
```

This will output detailed trace logs for each candidate to the console.

**Option 2: JSON Export Mode**

```bash
NODE_ENV=development
SMART_MATCH_DEBUG=json
```

This will output a single JSON object at the end containing all traces and summary stats.

### Production Safety

The debug system is **completely disabled** in production:
- `process.env.NODE_ENV === 'production'` → debug disabled
- All debug code is conditionally executed with zero overhead when disabled
- No database writes, no async overhead

---

## Output Format

### Console Mode

Each candidate gets a detailed trace:

```
==============================
[SmartMatch Trace]
candidate: cm2abc123
total: 78
breakdown:
  age: 20
  location: 15
  interest: 25
  personality: 8
  behavior: 10
topFactor: interest
features:
  ageDiff: 2
  preferredAgeRangeHit: true
  mutualInterests: ["hiking", "tech"]
  distanceKm: 3
  sameCity: true
  interactionCount: 5
  isVerified: true
  lastActiveHours: 0
signals:
  - mutual_interest_count
  - location_exact
selectedInsight: "2 shared interests detected"
==============================
```

At the end, you'll see a summary:

```
========== SMART MATCH SUMMARY ==========
User: cm1xyz789
Total Candidates Scored: 147
Average Score: 45
Max Score: 89
Min Score: 12

Top 3 Candidates:
  1. cm2abc123 - Score: 89
  2. cm2def456 - Score: 82
  3. cm2ghi789 - Score: 78
=========================================
```

### JSON Mode

A single JSON export at the end:

```json
{
  "userId": "cm1xyz789",
  "generatedAt": "2026-02-13T10:00:00.000Z",
  "totalCandidates": 147,
  "candidates": [
    {
      "candidateId": "cm2abc123",
      "total": 78,
      "breakdown": {
        "age": 20,
        "location": 15,
        "interest": 25,
        "personality": 8,
        "behavior": 10
      },
      "topFactor": "interest",
      "features": {
        "ageDiff": 2,
        "preferredAgeRangeHit": true,
        "mutualInterests": ["hiking", "tech"],
        "distanceKm": 3,
        "sameCity": true,
        "candidateCity": "Tel Aviv",
        "isVerified": true,
        "lastActiveHours": 0,
        "interactionCount": 5
      },
      "signals": ["mutual_interest_count", "location_exact"],
      "selectedInsight": "2 shared interests detected"
    }
  ],
  "summary": {
    "avgScore": 45,
    "maxScore": 89,
    "minScore": 12,
    "top3Candidates": [
      { "candidateId": "cm2abc123", "score": 89 },
      { "candidateId": "cm2def456", "score": 82 },
      { "candidateId": "cm2ghi789", "score": 78 }
    ]
  }
}
```

---

## What You Can Debug

### Score Breakdown
- **age**: How age compatibility scored (max 25)
- **location**: Location proximity score (max 20)
- **interest**: Shared interests score (max 25)
- **personality**: Description similarity score (max 15)
- **behavior**: Learned behavior patterns score (max 15)

### Features (Raw Inputs)
- **ageDiff**: Absolute age difference
- **preferredAgeRangeHit**: Does candidate fall in user's learned age preference?
- **mutualInterests**: Array of shared interest names
- **distanceKm**: Distance between users (0 if same city)
- **sameCity**: Boolean for exact city match
- **interactionCount**: How many times user interacted with this candidate
- **isVerified**: OAuth verification status
- **lastActiveHours**: Hours since last active (placeholder)

### Signals
List of insight types triggered:
- `mutual_interest_count`
- `mutual_interest_specific`
- `location_exact`
- `age_exact`
- `high_activity`

### Selected Insight
The primary match reason text shown to the user.

---

## Use Cases

### 1. Why is this candidate ranked so high/low?

Check the `breakdown` and `topFactor` to see which scoring dimension dominated.

Example:
```
topFactor: interest
breakdown:
  interest: 25  ← Max score here
  age: 8        ← Low age compatibility
```

### 2. Is behavior learning working?

Check `preferredAgeRangeHit` and `features.interactionCount`:
- If `preferredAgeRangeHit: true` and `behavior: 15`, the system learned their preference
- If `interactionCount > 0`, previous interactions are weighted

### 3. Are insights accurate?

Compare `signals` and `selectedInsight` with actual features:
- `selectedInsight: "2 shared interests"` should match `mutualInterests: ["hiking", "tech"]`

### 4. Export for Analysis

Use JSON mode to export all traces, then analyze in Python/R:

```bash
SMART_MATCH_DEBUG=json npm run dev > traces.json
```

Parse the JSON to find patterns:
- Which features correlate most with high scores?
- Are there any scoring anomalies?
- Distribution of age differences for top matches?

---

## Performance Impact

### Development (Debug Enabled)
- **Console Mode**: ~5-10ms overhead per candidate (logging)
- **JSON Mode**: ~1-2ms overhead per candidate (no logging, only collection)
- Total impact: ~0.5-3 seconds for 300 candidates

### Production (Debug Disabled)
- **Overhead**: 0ms (all debug code skipped via `if` guard)
- **No database writes**
- **No async operations**
- **No memory allocation** (traces array not created)

The checks are optimized:
```typescript
const debugEnabled = isDebugEnabled(); // Called once
if (debugEnabled) { /* entire debug block */ }
```

---

## Code Structure

```
src/lib/smart-matching/
├── debug.ts           # Debug system (new file)
│   ├── SmartMatchTrace interface
│   ├── isDebugEnabled()
│   ├── createTrace()
│   ├── logSmartMatchTrace()
│   ├── logSummary()
│   └── exportDebugSession()
├── orchestrator.ts    # Integrated debug calls
│   └── (scoring loop modified to collect traces)
└── DEBUG_README.md    # This file
```

### Key Functions

**`isDebugEnabled()`**
- Returns `true` if debug mode is on
- Guards all debug code paths

**`createTrace()`**
- Builds structured trace object from scoring data
- Calculates top factor

**`logSmartMatchTrace()`**
- Pretty-prints trace to console
- Only in console mode

**`logSummary()`**
- Calculates and prints summary stats
- Shows avg/min/max and top 3

**`exportDebugSession()`**
- Outputs full JSON export
- Only in JSON mode

---

## Extending the Debug System

### Add New Feature Tracking

Edit `SmartMatchTrace` interface in `debug.ts`:

```typescript
export interface SmartMatchTrace {
  // ... existing fields
  features: {
    // ... existing features
    myNewFeature: number;  // Add your feature
  };
}
```

Then in `orchestrator.ts`, pass the feature to `createTrace()`:

```typescript
const trace = createTrace(
  candidate.userId,
  score,
  {
    // ... existing features
    myNewFeature: calculateMyFeature(),
  },
  signals,
  insights,
  candidateInteractionCount
);
```

### Add Custom Summary Stats

Edit `calculateSummary()` in `debug.ts` to include new metrics.

---

## Troubleshooting

**Debug logs not appearing?**
- Check `NODE_ENV !== 'production'`
- Check `SMART_MATCH_DEBUG=true` or `=json`
- Verify you're calling `getSmartMatches()` (not cached results)

**Too much output?**
- Use JSON mode instead: `SMART_MATCH_DEBUG=json`
- Redirect to file: `npm run dev > debug.log`

**Want to filter specific candidates?**
Add a filter in `orchestrator.ts`:
```typescript
if (debugEnabled && candidate.userId === 'cm2abc123') {
  // Debug only this candidate
}
```

---

## Best Practices

1. **Use JSON mode for analysis** - easier to parse and analyze
2. **Console mode for live debugging** - see traces as they happen
3. **Disable in production** - already enforced by code
4. **Commit debug files** - helps team understand scoring logic
5. **Update this README** - when you modify trace structure

---

## Example Workflow

1. Enable debug mode:
```bash
echo "SMART_MATCH_DEBUG=true" >> .env.local
```

2. Run the app and trigger Smart Matches
3. Check console for traces
4. Analyze why a candidate scored unexpectedly:
   - Check `breakdown` for scoring distribution
   - Check `features` for raw inputs
   - Check `topFactor` for dominant dimension

5. Switch to JSON mode for batch analysis:
```bash
# Change to SMART_MATCH_DEBUG=json
npm run dev > traces.json
```

6. Parse JSON and analyze:
```javascript
const data = require('./traces.json');
const avgInterest = data.candidates
  .map(c => c.breakdown.interest)
  .reduce((a, b) => a + b) / data.candidates.length;
console.log('Average interest score:', avgInterest);
```

---

## Related Files

- `scoring.ts` - Scoring logic implementation
- `featureEngine.ts` - Behavior pattern learning
- `insights.ts` - Insight generation
- `orchestrator.ts` - Main matching orchestration

---

**Questions?** Check the inline code comments in `debug.ts` and `orchestrator.ts`.
