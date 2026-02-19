#!/bin/bash

# Kill any existing npm processes on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Clear node_modules cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
