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

def main():
    print("Spouštím scraping...")
    response = requests.get("https://arbeitnow.com/api/job-board-api")
    jobs = response.json()["data"][:10]
    print(f"Nalezeno {len(jobs)} nabídek")
    
    for job in jobs:
        data = {
            "title": job["title"],
            "company": job["company_name"],
            "location": job.get("location", "Evropa"),
            "match": calculate_match(job["title"]),
            "salary": "Dle dohody",
            "lang": "🇬🇧 B1+",
            "type": "Full-time",
            "email": "info@company.com",
            "description": job.get("description", "")[:200],
        }
        supabase.table("Nabídky").insert(data).execute()
        print(f"✅ {data['title']} ({data['match']}% match)")
    
    print("Hotovo!")

if __name__ == "__main__":
    main()