import requests
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)

def calculate_match(title):
    title_lower = title.lower()
    it_keywords = ["software", "developer", "engineer", "it", "python", "javascript", "web", "data"]
    trade_keywords = ["elektrik", "mechanic", "plumber", "construct", "driver", "nurse", "cook", "chef"]
    for kw in it_keywords + trade_keywords:
        if kw in title_lower:
            return 85
    return 60

def job_exists(title, company):
    result = supabase.table("Nabídky").select("id").eq("title", title).eq("company", company).execute()
    return len(result.data) > 0

def main():
    print("Spouštím scraping...")
    response = requests.get("https://arbeitnow.com/api/job-board-api")
    jobs = response.json()["data"]

    # Filtr: jen Švýcarsko
    swiss_cities = ["zurich", "zürich", "bern", "basel", "geneva", "genève", "lausanne", "lucerne", "luzern", "winterthur", "st. gallen", "lugano", "biel", "thun", "zug", "switzerland", "schweiz", "suisse"]
    swiss_jobs = []
    for job in jobs:
        loc = job.get("location", "").lower()
        if any(city in loc for city in swiss_cities):
            swiss_jobs.append(job)

    print(f"Nalezeno {len(swiss_jobs)} švýcarských nabídek z {len(jobs)} celkem")

    added = 0
    skipped = 0
    for job in swiss_jobs:
        title = job["title"]
        company = job["company_name"]

        if job_exists(title, company):
            print(f"⏭️  {title} — už existuje, přeskakuji")
            skipped += 1
            continue

        data = {
            "title": title,
            "company": company,
            "location": job.get("location", "Švýcarsko"),
            "match": calculate_match(title),
            "salary": "Dle dohody",
            "lang": "🇬🇧 B1+",
            "type": "Full-time",
            "email": "info@company.com",
            "description": job.get("description", "")[:200],
        }
        supabase.table("Nabídky").insert(data).execute()
        print(f"✅ {title} ({data['match']}% match)")
        added += 1

    print(f"\nHotovo! Přidáno: {added}, Přeskočeno: {skipped}")

if __name__ == "__main__":
    main()