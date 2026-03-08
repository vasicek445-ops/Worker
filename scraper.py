"""
Woker Job Scraper — stahuje švýcarské nabídky z veřejných API
Zdroje: arbeitnow.com, Jooble (volitelně)

Použití:
  python scraper.py                  # Stáhne vše
  python scraper.py --source arbeitnow  # Jen arbeitnow
  python scraper.py --dry-run        # Jen ukáže co by stáhl
"""

import requests
import os
import sys
import re
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL") or os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

# Švýcarská města a kantony pro filtrování
SWISS_LOCATIONS = [
    "zurich", "zürich", "bern", "basel", "geneva", "genève", "lausanne",
    "lucerne", "luzern", "winterthur", "st. gallen", "lugano", "biel",
    "thun", "zug", "switzerland", "schweiz", "suisse", "aarau", "baden",
    "schaffhausen", "chur", "davos", "interlaken", "solothurn", "olten",
    "frauenfeld", "kreuzlingen", "rapperswil", "wil", "buchs", "sion",
    "fribourg", "neuchâtel", "neuchatel", "yverdon", "montreux", "vevey",
    "nyon", "morges", "renens", "biel/bienne", "köniz", "emmen", "kriens",
    "uster", "dübendorf", "dietikon", "wädenswil", "horgen",
]

# Mapování města → kanton
CITY_TO_CANTON = {
    "zurich": "ZH", "zürich": "ZH", "winterthur": "ZH", "uster": "ZH", "dübendorf": "ZH", "dietikon": "ZH", "wädenswil": "ZH", "horgen": "ZH",
    "bern": "BE", "thun": "BE", "biel": "BE", "biel/bienne": "BE", "interlaken": "BE", "köniz": "BE",
    "basel": "BS", "lucerne": "LU", "luzern": "LU", "emmen": "LU", "kriens": "LU",
    "geneva": "GE", "genève": "GE", "lausanne": "VD", "nyon": "VD", "morges": "VD", "renens": "VD", "yverdon": "VD", "montreux": "VD", "vevey": "VD",
    "lugano": "TI", "zug": "ZG", "st. gallen": "SG", "rapperswil": "SG", "wil": "SG", "buchs": "SG",
    "aarau": "AG", "baden": "AG", "schaffhausen": "SH", "chur": "GR", "davos": "GR",
    "solothurn": "SO", "olten": "SO", "frauenfeld": "TG", "kreuzlingen": "TG",
    "sion": "VS", "fribourg": "FR", "neuchâtel": "NE", "neuchatel": "NE",
}

# Kategorizace podle klíčových slov v titulku
CATEGORY_KEYWORDS = {
    "IT / Software": ["software", "developer", "engineer", "devops", "frontend", "backend", "fullstack", "python", "java", "react", "angular", "data scientist", "data engineer", "cloud", "sre", "qa", "tester", "it "],
    "Stavebnictví": ["bau", "construct", "maurer", "zimmermann", "schreiner", "maler", "gipser", "dachdecker", "polier", "bauführer", "bauleiter", "architect"],
    "Gastronomie": ["koch", "cook", "chef", "küche", "gastro", "restaurant", "hotel", "kellner", "service", "barista", "bäcker"],
    "Zdravotnictví": ["nurse", "pflege", "arzt", "doctor", "medizin", "pharma", "kranken", "spital", "klinik", "therapeut", "zahnarzt"],
    "Logistika": ["logist", "lager", "warehouse", "transport", "fahrer", "driver", "chauffeur", "kurier", "spedition", "supply chain"],
    "Elektro / Technik": ["elektr", "mechani", "techniker", "monteur", "installat", "sanitär", "heizung", "klima", "wartung", "instandhalt"],
    "Úklid / Údržba": ["reinig", "clean", "hauswart", "facility", "gebäude"],
    "Finance": ["financ", "account", "buchhal", "treuhänd", "audit", "bank", "versicher"],
    "Marketing / Sales": ["market", "sales", "verkauf", "vertrieb", "business develop", "account manager", "customer success"],
    "HR / Admin": ["human resource", "hr ", "personal", "admin", "sachbearbeit", "sekretär", "empfang", "office"],
}


def detect_canton(location: str) -> str:
    """Detekuje kanton z textu lokace."""
    loc = location.lower()
    for city, canton in CITY_TO_CANTON.items():
        if city in loc:
            return canton
    # Zkusit přímý match na kanton kódy
    canton_codes = ["ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR", "SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG", "TI", "VD", "VS", "NE", "GE", "JU"]
    for code in canton_codes:
        if f" {code}" in location or f"({code})" in location or location.strip().endswith(code):
            return code
    return None


def detect_category(title: str) -> str:
    """Detekuje kategorii práce z titulku."""
    title_lower = title.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in title_lower:
                return category
    return None


def is_swiss(location: str) -> bool:
    """Kontroluje zda je lokace ve Švýcarsku."""
    loc = location.lower()
    return any(city in loc for city in SWISS_LOCATIONS)


def parse_salary(text: str) -> tuple:
    """Parsuje plat z textu, vrací (min, max, text)."""
    if not text:
        return None, None, None
    # Hledej čísla jako 80000, 80'000, 80.000 atd.
    numbers = re.findall(r"[\d'.,]+", text.replace("'", ""))
    cleaned = []
    for n in numbers:
        n = n.replace(",", "").replace(".", "")
        if n.isdigit() and int(n) > 1000:
            cleaned.append(int(n))
    if len(cleaned) >= 2:
        return min(cleaned), max(cleaned), text
    elif len(cleaned) == 1:
        return cleaned[0], None, text
    return None, None, text if text else None


def clean_html(text: str) -> str:
    """Odstraní HTML tagy z textu."""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean[:2000]  # Max 2000 znaků


def fetch_arbeitnow() -> list[dict]:
    """Stáhne nabídky z arbeitnow.com API."""
    print("📡 Stahuji z arbeitnow.com...")
    try:
        response = requests.get("https://arbeitnow.com/api/job-board-api", timeout=30)
        response.raise_for_status()
        all_jobs = response.json().get("data", [])
    except Exception as e:
        print(f"  ❌ Chyba: {e}")
        return []

    swiss_jobs = []
    for job in all_jobs:
        location = job.get("location", "")
        if not is_swiss(location):
            continue

        title = job.get("title", "").strip()
        company = job.get("company_name", "").strip()
        if not title or not company:
            continue

        description = clean_html(job.get("description", ""))
        tags = job.get("tags", [])
        remote = job.get("remote", False)
        url = job.get("url", "")
        slug = job.get("slug", "")
        external_id = slug or f"{title}-{company}".lower().replace(" ", "-")[:100]

        posted_at = None
        if job.get("created_at"):
            try:
                posted_at = datetime.fromtimestamp(job["created_at"], tz=timezone.utc).isoformat()
            except (ValueError, TypeError):
                pass

        swiss_jobs.append({
            "external_id": external_id,
            "source": "arbeitnow",
            "title": title,
            "company": company,
            "location": location,
            "canton": detect_canton(location),
            "description": description,
            "salary_min": None,
            "salary_max": None,
            "salary_text": None,
            "job_type": "Full-time",
            "category": detect_category(title),
            "url": url,
            "tags": tags[:10] if tags else None,
            "remote": remote,
            "posted_at": posted_at,
        })

    print(f"  ✅ Nalezeno {len(swiss_jobs)} švýcarských nabídek z {len(all_jobs)} celkem")
    return swiss_jobs


def fetch_jooble() -> list[dict]:
    """Stáhne nabídky z Jooble API (vyžaduje JOOBLE_API_KEY)."""
    api_key = os.environ.get("JOOBLE_API_KEY")
    if not api_key:
        print("⏭️  Jooble přeskočen (JOOBLE_API_KEY není nastavený)")
        return []

    print("📡 Stahuji z Jooble...")

    keywords = ["", "Bauarbeiter", "Koch", "Elektriker", "Fahrer", "Software"]
    all_jobs = []

    for keyword in keywords:
        try:
            response = requests.post(
                f"https://jooble.org/api/{api_key}",
                json={"keywords": keyword, "location": "Switzerland", "page": 1},
                timeout=30,
            )
            response.raise_for_status()
            jobs = response.json().get("jobs", [])
            all_jobs.extend(jobs)
        except Exception as e:
            print(f"  ⚠️ Chyba pro '{keyword}': {e}")
            continue

    # Deduplicate by link
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        link = job.get("link", "")
        if link not in seen:
            seen.add(link)
            unique_jobs.append(job)

    swiss_jobs = []
    for job in unique_jobs:
        title = job.get("title", "").strip()
        company = job.get("company", "").strip()
        location = job.get("location", "").strip()
        if not title or not company:
            continue

        description = clean_html(job.get("snippet", ""))
        salary_text = job.get("salary", "")
        salary_min, salary_max, salary_parsed = parse_salary(salary_text)
        url = job.get("link", "")
        external_id = url.split("/")[-1][:100] if url else f"{title}-{company}".lower().replace(" ", "-")[:100]

        posted_at = None
        if job.get("updated"):
            try:
                posted_at = datetime.fromisoformat(job["updated"].replace("Z", "+00:00")).isoformat()
            except (ValueError, TypeError):
                pass

        job_type = job.get("type", "Full-time")

        swiss_jobs.append({
            "external_id": external_id,
            "source": "jooble",
            "title": title,
            "company": company,
            "location": location,
            "canton": detect_canton(location),
            "description": description,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "salary_text": salary_parsed,
            "job_type": job_type if job_type else "Full-time",
            "category": detect_category(title),
            "url": url,
            "tags": None,
            "remote": False,
            "posted_at": posted_at,
        })

    print(f"  ✅ Nalezeno {len(swiss_jobs)} nabídek z Jooble")
    return swiss_jobs


def save_jobs(jobs: list[dict], dry_run: bool = False) -> tuple[int, int]:
    """Uloží nabídky do Supabase. Vrací (added, skipped)."""
    added = 0
    skipped = 0

    for job in jobs:
        if dry_run:
            canton_str = f" ({job['canton']})" if job['canton'] else ""
            cat_str = f" [{job['category']}]" if job['category'] else ""
            print(f"  📋 {job['title']} — {job['company']}{canton_str}{cat_str}")
            added += 1
            continue

        try:
            supabase.table("jobs").upsert(
                job,
                on_conflict="source,external_id"
            ).execute()
            added += 1
        except Exception as e:
            if "duplicate" in str(e).lower() or "conflict" in str(e).lower():
                skipped += 1
            else:
                print(f"  ❌ Chyba u '{job['title']}': {e}")
                skipped += 1

    return added, skipped


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    source_filter = None
    for i, arg in enumerate(args):
        if arg == "--source" and i + 1 < len(args):
            source_filter = args[i + 1]

    print("🚀 Woker Job Scraper")
    print(f"   Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    if source_filter:
        print(f"   Source: {source_filter}")
    print()

    all_jobs = []

    # Arbeitnow
    if not source_filter or source_filter == "arbeitnow":
        all_jobs.extend(fetch_arbeitnow())

    # Jooble
    if not source_filter or source_filter == "jooble":
        all_jobs.extend(fetch_jooble())

    if not all_jobs:
        print("\n⚠️  Žádné nabídky k uložení")
        return

    print(f"\n💾 Ukládám {len(all_jobs)} nabídek...")
    added, skipped = save_jobs(all_jobs, dry_run)

    # Statistiky
    cantons = {}
    categories = {}
    for job in all_jobs:
        c = job.get("canton") or "Neznámý"
        cantons[c] = cantons.get(c, 0) + 1
        cat = job.get("category") or "Ostatní"
        categories[cat] = categories.get(cat, 0) + 1

    print(f"\n✅ Hotovo! Přidáno/aktualizováno: {added}, Přeskočeno: {skipped}")
    print(f"\n📊 Podle kantonů:")
    for canton, count in sorted(cantons.items(), key=lambda x: -x[1])[:10]:
        print(f"   {canton}: {count}")
    print(f"\n📊 Podle kategorií:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count}")


if __name__ == "__main__":
    main()
