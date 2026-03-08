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


def fetch_michaelpage():
    """Stáhne nabídky z Michael Page Switzerland."""
    print("📡 Stahuji z Michael Page...")
    all_jobs = []
    max_pages = 16  # ~465 jobs / 30 per page

    for page in range(max_pages):
        try:
            response = requests.get(
                f"https://www.michaelpage.ch/jobs?page={page}",
                headers={"User-Agent": "Mozilla/5.0 (compatible; WokerBot/1.0)"},
                timeout=15,
            )
            if response.status_code != 200:
                break
            html = response.text
        except Exception as e:
            print(f"  ⚠️ Strana {page} chyba: {e}")
            break

        # Extract job links: /job-detail/[slug]/ref/jn-MMYYYY-NNNNNNN
        import re as _re
        pattern = r'<a[^>]*href="(\/(?:de|fr|en)?\/?\/?job-detail\/[^"]+\/ref\/(jn-[^"]+))"[^>]*>([^<]+)</a>'
        matches = _re.findall(pattern, html, _re.IGNORECASE)

        seen_refs = set()
        page_jobs = []
        for url, ref_id, title in matches:
            title = title.strip()
            if not title or len(title) < 3 or ref_id in seen_refs:
                continue
            seen_refs.add(ref_id)
            page_jobs.append((url, ref_id, title))

        if not page_jobs:
            break

        for url, ref_id, title in page_jobs:
            # Detect location from HTML context
            location = _detect_mp_location(html, url)
            # Detect job type from ref context
            idx = html.find(ref_id)
            context = html[max(0, idx - 200):idx + 200] if idx >= 0 else ""
            job_type = "Temporary" if "Interim" in context else "Full-time"

            # Extract date from ref: jn-MMYYYY-NNNNNNN
            posted_at = None
            date_match = _re.match(r"jn-(\d{2})(\d{4})-", ref_id)
            if date_match:
                month, year = date_match.groups()
                posted_at = f"{year}-{month}-01T00:00:00Z"

            all_jobs.append({
                "external_id": ref_id,
                "source": "michaelpage",
                "title": title,
                "company": "Michael Page",
                "location": location or "Switzerland",
                "canton": detect_canton(location or ""),
                "description": "",
                "salary_min": None,
                "salary_max": None,
                "salary_text": None,
                "job_type": job_type,
                "category": detect_category(title),
                "url": f"https://www.michaelpage.ch{url}",
                "tags": None,
                "remote": False,
                "posted_at": posted_at,
            })

        print(f"  📄 Strana {page}: {len(page_jobs)} nabídek")

    print(f"  ✅ Celkem {len(all_jobs)} nabídek z Michael Page")
    return all_jobs


def _detect_mp_location(html, job_url):
    """Detekuje lokaci z HTML kontextu kolem job URL."""
    idx = html.find(job_url)
    if idx < 0:
        return None
    context = html[max(0, idx - 500):min(len(html), idx + 1000)]
    cities = [
        ("Geneva", "Geneva"), ("Genève", "Geneva"), ("Zürich", "Zürich"), ("Zurich", "Zürich"),
        ("Lausanne", "Lausanne"), ("Basel", "Basel"), ("Bern", "Bern"), ("Zug", "Zug"),
        ("Lugano", "Lugano"), ("Nyon", "Nyon"), ("Neuchâtel", "Neuchâtel"),
        ("Winterthur", "Winterthur"), ("Vaud", "Vaud"), ("Baar", "Baar"),
        ("Fribourg", "Fribourg"), ("Yverdon", "Yverdon"), ("Vevey", "Vevey"),
        ("Meyrin", "Meyrin"), ("St. Gallen", "St. Gallen"), ("Solothurn", "Solothurn"),
        ("Luzern", "Luzern"), ("Lucerne", "Luzern"),
    ]
    for search, city in cities:
        if search.lower() in context.lower():
            return city
    return None


def fetch_roberthalf():
    """Stáhne nabídky z Robert Half Switzerland."""
    print("📡 Stahuji z Robert Half...")
    try:
        response = requests.get(
            "https://www.roberthalf.com/ch/en/jobs",
            headers={"User-Agent": "Mozilla/5.0 (compatible; WokerBot/1.0)"},
            timeout=20,
        )
        if response.status_code != 200:
            print(f"  ❌ HTTP {response.status_code}")
            return []
        html = response.text
    except Exception as e:
        print(f"  ❌ Chyba: {e}")
        return []

    # Extract embedded JSON from aemSettings
    import json
    jobs = []

    # Extract JSON from: initialResults = JSON.parse('...')
    match = re.search(r"initialResults\s*=\s*JSON\.parse\('(.+?)'\)", html)
    if not match:
        print("  ⚠️ initialResults nenalezeno v HTML")
        print(f"  ✅ Nalezeno {len(jobs)} nabídek z Robert Half")
        return jobs

    try:
        raw = match.group(1)
        # Decode \xNN and \uNNNN escape sequences
        decoded = raw.encode('utf-8').decode('unicode_escape').encode('latin-1').decode('utf-8')
        data = json.loads(decoded)
        job_list = data.get("data", {}).get("jobs", [])
        for j in job_list:
            parsed = _parse_rh_job(j)
            if parsed:
                jobs.append(parsed)
    except (json.JSONDecodeError, UnicodeError) as e:
        print(f"  ❌ Parse chyba: {e}")

    print(f"  ✅ Nalezeno {len(jobs)} nabídek z Robert Half")
    return jobs


def _parse_rh_job(job):
    """Parsuje jednotlivou nabídku z Robert Half JSON."""
    title = (job.get("jobtitle") or job.get("title") or "").strip()
    job_id = job.get("google_job_id") or job.get("unique_job_number") or job.get("job_id") or ""
    if not title or not job_id:
        return None

    city = (job.get("city") or job.get("location") or "").strip()
    emp_type = (job.get("emptype") or "").lower()
    job_type = "Temporary" if ("temp" in emp_type or "contract" in emp_type) else "Full-time"

    posted_at = None
    if job.get("date_posted"):
        try:
            posted_at = datetime.fromisoformat(str(job["date_posted"]).replace("Z", "+00:00")).isoformat()
        except (ValueError, TypeError):
            pass

    salary_min = int(job["payrate_min"]) if job.get("payrate_min") else None
    salary_max = int(job["payrate_max"]) if job.get("payrate_max") else None
    if salary_min and salary_min <= 1000:
        salary_min = None
    if salary_max and salary_max <= 1000:
        salary_max = None

    url = job.get("job_detail_url") or ""
    if url and not url.startswith("http"):
        url = f"https://www.roberthalf.com{url}"

    return {
        "external_id": str(job_id),
        "source": "roberthalf",
        "title": title,
        "company": "Robert Half",
        "location": city or "Switzerland",
        "canton": detect_canton(city or ""),
        "description": clean_html(job.get("description") or ""),
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_text": f"{job.get('salary_currency', 'CHF')} {salary_min or '?'} - {salary_max or '?'}" if (salary_min or salary_max) else None,
        "job_type": job_type,
        "category": detect_category(title),
        "url": url,
        "tags": None,
        "remote": "remote" in (job.get("remote") or "").lower(),
        "posted_at": posted_at,
    }


def fetch_jobsch():
    """Stáhne hospitality/sezónní nabídky z jobs.ch."""
    print("📡 Stahuji z jobs.ch (hospitality & sezónní)...")
    import json

    keywords = [
        "hotel", "Koch Küche", "Restaurant Kellner", "Housekeeping Zimmer",
        "Saison Resort", "Rezeption Empfang Hotel", "Gastro Service",
        "Barkeeper Barista", "Spa Wellness",
    ]

    all_jobs = []
    seen_ids = set()

    for keyword in keywords:
        for page in range(1, 6):  # Max 5 pages per keyword
            try:
                url = f"https://www.jobs.ch/en/vacancies/?term={requests.utils.quote(keyword)}&page={page}"
                response = requests.get(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
                    timeout=15,
                )
                if response.status_code != 200:
                    break
                html = response.text
            except Exception as e:
                print(f"  ⚠️ Chyba {keyword} p{page}: {e}")
                break

            # Extract __INIT__ JSON - find the assignment and parse
            init_idx = html.find('__INIT__ = ')
            if init_idx < 0:
                break
            # Find the end of the JSON object (ends with ;\n)
            json_start = init_idx + 11
            end_idx = html.find(';\n', json_start)
            if end_idx < 0:
                end_idx = html.find(';</script>', json_start)
            if end_idx < 0:
                break

            try:
                data = json.loads(html[json_start:end_idx])
                results = data.get("vacancy", {}).get("results", {}).get("main", {}).get("results", [])
            except json.JSONDecodeError:
                break

            if not results:
                break

            for job in results:
                job_id = job.get("id", "")
                if not job_id or job_id in seen_ids:
                    continue
                seen_ids.add(job_id)

                title = (job.get("title") or "").strip()
                company = (job.get("company", {}).get("name") or "").strip()
                place = (job.get("place") or "").strip()
                if not title:
                    continue

                posted_at = None
                if job.get("publicationDate"):
                    try:
                        posted_at = datetime.fromisoformat(job["publicationDate"]).isoformat()
                    except (ValueError, TypeError):
                        pass

                emp_types = job.get("employmentTypeIds", [])
                job_type = "Full-time"
                if "2" in emp_types or "3" in emp_types:
                    job_type = "Temporary"

                salary_text = None
                salary_min = None
                salary_max = None
                salary_data = job.get("salary")
                if salary_data and salary_data.get("range"):
                    salary_min = salary_data["range"].get("min")
                    salary_max = salary_data["range"].get("max")
                    currency = salary_data.get("currency", "CHF")
                    salary_text = f"{currency} {salary_min or '?'} - {salary_max or '?'}"

                all_jobs.append({
                    "external_id": job_id,
                    "source": "jobsch",
                    "title": title,
                    "company": company or "jobs.ch",
                    "location": place or "Switzerland",
                    "canton": detect_canton(place or ""),
                    "description": "",
                    "salary_min": salary_min,
                    "salary_max": salary_max,
                    "salary_text": salary_text,
                    "job_type": job_type,
                    "category": detect_category(title),
                    "url": f"https://www.jobs.ch/en/vacancies/detail/{job_id}/",
                    "tags": None,
                    "remote": False,
                    "posted_at": posted_at,
                })

        print(f"  🔑 '{keyword}': {len([j for j in all_jobs if j['external_id'] in seen_ids])} celkem")

    # Dedupe
    unique = {j["external_id"]: j for j in all_jobs}
    result = list(unique.values())
    print(f"  ✅ Celkem {len(result)} unikátních nabídek z jobs.ch")
    return result


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

    # Michael Page
    if not source_filter or source_filter == "michaelpage":
        all_jobs.extend(fetch_michaelpage())

    # Robert Half
    if not source_filter or source_filter == "roberthalf":
        all_jobs.extend(fetch_roberthalf())

    # jobs.ch (hospitality & seasonal)
    if not source_filter or source_filter == "jobsch":
        all_jobs.extend(fetch_jobsch())

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
