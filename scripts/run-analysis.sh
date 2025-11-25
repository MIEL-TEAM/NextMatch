#!/bin/bash

# Prisma Performance Analysis Runner
# This script runs both static and runtime analysis

echo "🔍 Starting Prisma Performance Analysis..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}STEP 1: Static Code Analysis${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Run static analysis
npx ts-node scripts/analyze-prisma-queries.ts

echo ""
echo -e "${GREEN}✓ Static analysis complete${NC}"
echo ""
echo -e "${YELLOW}📄 Check prisma-analysis-report.json for detailed static analysis${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}STEP 2: Runtime Instrumentation Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if instrumentation is enabled
if grep -q "PRISMA_INSTRUMENTATION=true" .env.local 2>/dev/null; then
  echo -e "${GREEN}✓ Runtime instrumentation is already enabled${NC}"
else
  echo -e "${YELLOW}⚠ Runtime instrumentation is not enabled${NC}"
  echo ""
  echo "To enable runtime instrumentation:"
  echo "  1. Add to .env.local:"
  echo "     PRISMA_INSTRUMENTATION=true"
  echo ""
  echo "  2. Restart your dev server"
  echo ""
  echo "  3. Use the application to generate query data"
  echo ""
  echo "  4. Run: npx ts-node scripts/generate-performance-report.ts"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Analysis Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review prisma-analysis-report.json"
echo "  2. Enable runtime instrumentation (see above)"
echo "  3. Test the application"
echo "  4. Generate runtime report"
echo ""

