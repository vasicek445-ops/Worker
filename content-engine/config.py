"""
Woker Content Engine - Configuration
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# === API Keys ===
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# === Brand ===
BRAND_NAME = "Woker"
BRAND_URL = "www.gowoker.com"
BRAND_IG = "@woker_com"
BRAND_TAGLINE = "AI průvodce prací a životem ve Švýcarsku"
BRAND_PRICE = "€9.99/měsíc"
BRAND_FOUNDER = "Václav"

# === Content Pillars (sorted by impact) ===
CONTENT_PILLARS = [
    {
        "id": "salary",
        "name": "Porovnání platů CZ vs CH",
        "weight": 30,  # % of content
        "description": "Virální obsah porovnávající platy, životní náklady, úspory. Konkrétní čísla.",
        "formats": ["carousel", "reel_script", "single_image"],
        "hooks": [
            "Kolik si vydělá {profese} ve Švýcarsku? 🇨🇭",
            "Plat {profese}: Česko vs Švýcarsko 💰",
            "{cislo} CHF měsíčně? Takhle vypadá realita ve Švýcarsku",
            "Za rok ve Švýcarsku jsem ušetřil víc než za 5 let v Česku",
            "TOP 5 nejlépe placených profesí ve Švýcarsku 2026",
        ],
        "cta": f"Chceš najít práci ve Švýcarsku? Link v bio 👆 {BRAND_IG}",
    },
    {
        "id": "tips",
        "name": "Tipy a rady pro život v CH",
        "weight": 25,
        "description": "Praktické rady - bydlení, daně, pojištění, jazyk, kultura. Hodnota zdarma.",
        "formats": ["carousel", "reel_script", "single_image"],
        "hooks": [
            "5 věcí co jsem si přál vědět PŘED stěhováním do Švýcarska",
            "Největší chyba Čechů ve Švýcarsku ❌",
            "Jak najít bydlení ve Švýcarsku (krok za krokem)",
            "Švýcarské daně vysvětlené za 60 sekund",
            "Co tě NIKDO neřekne o životě ve Švýcarsku",
        ],
        "cta": f"Více tipů a AI nástroje na hledání práce → link v bio {BRAND_IG}",
    },
    {
        "id": "myths",
        "name": "Mýty a FAQ",
        "weight": 20,
        "description": "Vyvracení mýtů o práci v zahraničí. Kontroverzní = engagement.",
        "formats": ["reel_script", "carousel", "single_image"],
        "hooks": [
            "\"Ve Švýcarsku je všechno drahé\" — PRAVDA nebo MÝT? 🤔",
            "3 mýty o práci ve Švýcarsku co lidi stojí tisíce",
            "\"Bez němčiny nemáš šanci\" — Je to pravda?",
            "Proč se 80% Čechů BOJÍ odejít do zahraničí",
            "\"Švýcarsko je jen pro bohaté\" — tady jsou fakta",
        ],
        "cta": f"Woker ti pomůže s celým procesem → link v bio {BRAND_IG}",
    },
    {
        "id": "product",
        "name": "Woker product showcase",
        "weight": 15,
        "description": "Ukázky funkcí, AI nástrojů, úspěšné příběhy uživatelů. Soft sell.",
        "formats": ["reel_script", "single_image", "carousel"],
        "hooks": [
            "Takhle AI najde práci ve Švýcarsku za tebe 🤖",
            "1007 švýcarských kontaktů na jednom místě",
            "Napsal jsem životopis za 30 sekund (pomocí AI)",
            "Proč 10 AI nástrojů změní tvoje hledání práce",
            "Od registrace po pohovor — jak Woker funguje",
        ],
        "cta": f"Vyzkoušej zdarma na {BRAND_URL} 🚀",
    },
    {
        "id": "lifestyle",
        "name": "Lifestyle ve Švýcarsku",
        "weight": 10,
        "description": "Aspirační obsah - příroda, kvalita života, cestování. Eye-candy.",
        "formats": ["reel_script", "single_image"],
        "hooks": [
            "Pondělí ráno ve Švýcarsku vypadá takhle 🏔️",
            "Proč Švýcarsko změnilo můj pohled na work-life balance",
            "Výplata přišla a jdu na oběd s výhledem na Alpy",
            "24 hodin v životě Čecha ve Švýcarsku",
            "Toto je důvod proč žiju ve Švýcarsku 🇨🇭",
        ],
        "cta": f"Začni svůj příběh ve Švýcarsku → {BRAND_IG}",
    },
]

# === Hashtag Sets ===
HASHTAGS = {
    "core": [
        "#pracevsvicarsku", "#svycarsko", "#pracevzahranici",
        "#woker", "#zivotvsvicarsku",
    ],
    "salary": [
        "#platy", "#plat", "#vydelek", "#finance", "#penize",
        "#prumernymzda", "#mzda",
    ],
    "tips": [
        "#tipy", "#rady", "#expat", "#stehovani", "#emigrace",
        "#zivotsvych", "#expalife",
    ],
    "myths": [
        "#myty", "#fakta", "#pravda", "#zahranici", "#ceskovszahranici",
    ],
    "product": [
        "#ai", "#umelaintegence", "#hledaniprace", "#jobsearch",
        "#startup", "#tech",
    ],
    "lifestyle": [
        "#alpy", "#switzerland", "#schweiz", "#suisse",
        "#cestovani", "#travel", "#nature",
    ],
    "reach": [
        "#czech", "#cesko", "#cesi", "#ceskarepublika",
        "#motivace", "#uspech", "#podnikani",
    ],
}

# === Output Settings ===
POSTS_PER_BATCH = 7  # one week of content
OUTPUT_DIR = "generated_content"
