#!/bin/bash
# ============================================
# Woker Email Funnel - Deployment Script
# Spusť z root adresáře projektu:
# cd /Users/vaclav/Desktop/eurojob.py/woker
# bash deploy-email-funnel.sh
# ============================================

echo "🚀 Woker Email Funnel Deployment"
echo "================================"

# 1. Instalace Resend
echo ""
echo "📦 Instaluji resend..."
npm install resend

# 2. Vytvoření složek
echo ""
echo "📁 Vytvářím složky..."
mkdir -p app/api/lead
mkdir -p app/api/cron/emails
mkdir -p app/api/unsubscribe
mkdir -p app/zdarma
mkdir -p public/downloads

echo ""
echo "✅ Struktura připravena!"
echo ""
echo "================================"
echo "DALŠÍ KROKY (ruční):"
echo "================================"
echo ""
echo "1. Zkopíruj soubory z woker-deploy/ do projektu:"
echo "   cp woker-deploy/app/api/lead/route.ts app/api/lead/"
echo "   cp woker-deploy/app/api/cron/emails/route.ts app/api/cron/emails/"
echo "   cp woker-deploy/app/api/unsubscribe/route.ts app/api/unsubscribe/"
echo "   cp woker-deploy/app/zdarma/page.tsx app/zdarma/"
echo "   cp woker-deploy/public/downloads/5-kroku-prace-svycarsko.pdf public/downloads/"
echo "   cp woker-deploy/vercel.json ."
echo ""
echo "2. Spusť SQL v Supabase SQL Editoru (soubor: supabase-migration.sql)"
echo ""
echo "3. Přidej env proměnné do .env.local a Vercel:"
echo "   RESEND_API_KEY=re_xxxxxxxxxxxx"
echo "   SUPABASE_SERVICE_ROLE_KEY=tvůj-service-key"
echo "   CRON_SECRET=nahodny-string-123"
echo ""
echo "4. git add . && git commit -m 'Email funnel' && git push"
echo ""
echo "================================"
