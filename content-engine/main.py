"""
Woker Content Engine - Main Orchestrator
=========================================
Generates a full week of Instagram content for Woker.

Usage:
    python main.py generate          # Generate 7 days of content
    python main.py preview           # Preview weekly schedule (no API call)
    python main.py single <pillar>   # Generate single post (salary/tips/myths/product/lifestyle)

Requirements:
    pip install anthropic python-dotenv

Setup:
    1. Copy .env.example to .env
    2. Add your ANTHROPIC_API_KEY
    3. Run: python main.py generate
"""
import sys
import json
import os
from datetime import datetime

from config import CONTENT_PILLARS, BRAND_NAME, OUTPUT_DIR
from content_generator import (
    get_client, generate_weekly_content, 
    generate_post, select_pillars_for_week,
    build_hashtag_set
)
from output_formatter import save_weekly_content, save_single_post, ensure_output_dir


def cmd_preview():
    """Preview the weekly content schedule without generating."""
    print(f"\n🗓️  {BRAND_NAME} Content Engine — Weekly Preview")
    print("=" * 55)
    
    schedule = select_pillars_for_week()
    
    for entry in schedule:
        pillar = entry["pillar"]
        emoji_map = {
            "salary": "💰",
            "tips": "💡", 
            "myths": "🤔",
            "product": "🤖",
            "lifestyle": "🏔️",
        }
        emoji = emoji_map.get(pillar["id"], "📌")
        
        print(f"\n{emoji} {entry['day']}")
        print(f"   Pilíř: {pillar['name']}")
        print(f"   Formát: {entry['format'].upper()}")
        print(f"   Hook: {entry['hook']}")
    
    print(f"\n{'='*55}")
    print("💡 Pro generování obsahu spusť: python main.py generate")


def cmd_generate():
    """Generate a full week of content."""
    print(f"\n🚀 {BRAND_NAME} Content Engine — Generuji týdenní obsah")
    print("=" * 55)
    
    client = get_client()
    
    print("\n⏳ Generuji 7 postů (trvá cca 1-2 minuty)...\n")
    weekly_content = generate_weekly_content(client)
    
    print("\n💾 Ukládám obsah...")
    week_dir = save_weekly_content(weekly_content)
    
    print(f"\n✅ Hotovo! Obsah uložen do: {week_dir}/")
    print(f"\n📂 Soubory:")
    print(f"   📋 00_WEEKLY_OVERVIEW.txt  — přehled celého týdne")
    print(f"   📋 00_CONTENT_PLAN.md      — vše v jednom souboru")
    
    for post in weekly_content:
        day_num = post["day_number"]
        fmt = post["format"].upper()
        print(f"   📝 {day_num}_{post['day']}_*_CAPTION.txt  — hotová caption k postnutí")
    
    print(f"\n💡 Workflow:")
    print(f"   1. Otevři _CONTENT.txt pro instrukce k vizuálu")
    print(f"   2. Vytvoř vizuál (Canva / CapCut / ručně)")
    print(f"   3. Zkopíruj text z _CAPTION.txt do Instagramu")
    print(f"   4. Publikuj v doporučeném čase")
    print(f"\n🔄 Pro nový týden spusť znovu: python main.py generate")


def cmd_single(pillar_id=None):
    """Generate a single post for specific pillar."""
    valid_ids = [p["id"] for p in CONTENT_PILLARS]
    
    if pillar_id not in valid_ids:
        print(f"\n❌ Neznámý pilíř: {pillar_id}")
        print(f"   Dostupné: {', '.join(valid_ids)}")
        return
    
    pillar = next(p for p in CONTENT_PILLARS if p["id"] == pillar_id)
    
    print(f"\n📝 Generuji post: {pillar['name']}...")
    
    client = get_client()
    
    import random
    entry = {
        "pillar": pillar,
        "format": random.choice(pillar["formats"]),
        "hook": random.choice(pillar["hooks"]),
    }
    
    post = generate_post(client, entry)
    post["hashtags"] = build_hashtag_set(pillar_id)
    post["pillar"] = pillar["name"]
    post["format"] = entry["format"]
    
    # Print to console
    print(f"\n{'='*55}")
    print(f"🎯 Hook: {post.get('hook', 'N/A')}")
    print(f"📱 Formát: {entry['format'].upper()}")
    print(f"\n{post.get('content', 'N/A')}")
    print(f"\n📝 Caption:")
    print(f"{'-'*40}")
    print(post.get("caption", "N/A"))
    print(f"\n# {post['hashtags']}")
    
    # Save
    caption_path = save_single_post(post)
    print(f"\n💾 Caption uložena: {caption_path}")


def cmd_help():
    """Show help."""
    print(f"""
🚀 {BRAND_NAME} Content Engine
{'='*40}

Příkazy:
  python main.py generate     Vygeneruj 7 dní obsahu
  python main.py preview      Náhled plánu (bez API)
  python main.py single <p>   Jeden post pro pilíř
  python main.py help         Tato nápověda

Pilíře obsahu:
  salary     💰 Porovnání platů CZ vs CH
  tips       💡 Tipy a rady pro život v CH
  myths      🤔 Mýty a FAQ
  product    🤖 Woker product showcase
  lifestyle  🏔️  Lifestyle ve Švýcarsku

Příklady:
  python main.py generate
  python main.py single salary
  python main.py single tips
""")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        cmd_help()
        sys.exit(0)
    
    command = sys.argv[1].lower()
    
    if command == "generate":
        cmd_generate()
    elif command == "preview":
        cmd_preview()
    elif command == "single":
        pillar_id = sys.argv[2] if len(sys.argv) > 2 else None
        cmd_single(pillar_id)
    elif command == "help":
        cmd_help()
    else:
        print(f"❌ Neznámý příkaz: {command}")
        cmd_help()
