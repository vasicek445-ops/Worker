#!/bin/bash
echo "🌍 Deploying permits guide translations (10 languages)..."

# ============================================
# 1. Create content directory structure
# ============================================
mkdir -p content/permits

# ============================================
# 2. Types definition
# ============================================
cat > content/permits/types.ts << 'TYPES_EOF'
export interface PermitsContent {
  pageTag: string;
  pageTitle: string;
  pageDesc: string;
  introTitle: string;
  introText1: string;
  introText1Bold: string;
  introText2: string;
  euTitle: string;
  euText: string;
  euAgreement: string;
  permitTypesTitle: string;
  permits: { type: string; name: string; subtitle: string; color: string; duration: string; details: string[]; }[];
  deadlineTitle: string;
  deadlineItems: string[];
  deadlineTip: string;
  docsTitle: string;
  docs: { icon: string; name: string }[];
  consequencesTitle: string;
  consequences: { icon: string; text: string; severity: string }[];
  renewalTitle: string;
  renewalText: string;
  renewalOffice: string;
  renewalEarliest: string;
  renewalEarliestBold: string;
  renewalLatest: string;
  renewalLatestBold: string;
  renewalDocsLabel: string;
  renewalDocs: string[];
  lostTitle: string;
  lostSteps: { step: string; text: string; icon: string }[];
  divorceTitle: string;
  divorceIntro: string;
  euCitizensTitle: string;
  euCitizensText: string;
  euCitizensConditions: string[];
  thirdCountryTitle: string;
  thirdCountryText: string;
  thirdCountryConditions: string[];
  keyRuleTitle: string;
  keyRuleText: string;
  keyRuleBold: string;
  officialTitle: string;
  officialDesc: string;
  officialLink: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
}
TYPES_EOF
echo "✅ types.ts"

# ============================================
# 3. Czech (original)
# ============================================
cat > content/permits/cs.ts << 'EOF'
import { PermitsContent } from "./types";
const cs: PermitsContent = {
  pageTag: "Důležité", pageTitle: "Pobytová povolení ve Švýcarsku",
  pageDesc: "Co musíš vědět, než začneš pracovat – typy povolení, jak je získat a co potřebuješ.",
  introTitle: "🛃 Proč potřebuješ povolení?",
  introText1: "Ve Švýcarsku nestačí jen přijet a začít pracovat. Každý cizinec –",
  introText1Bold: "včetně občanů EU",
  introText2: "– musí mít tzv. pobytové povolení (Ausweis). Díky němu můžeš legálně pracovat, být pojištěný a získat spoustu benefitů – třeba i rekvalifikace zdarma nebo podporu v nezaměstnanosti.",
  euTitle: "🇪🇺 Dobrá zpráva pro občany EU/EFTA",
  euText: "Díky dohodě o volném pohybu", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Typy povolení",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Krátkodobé povolení", color: "yellow", duration: "3–12 měsíců",
      details: ["Smlouva na méně než 12 měsíců", "Nejčastější u práce přes agenturu (temporär)", "Možnost prodloužení", "Vhodné, když ve Švýcarsku začínáš"] },
    { type: "B", name: "Ausweis B", subtitle: "Dlouhodobé povolení", color: "green", duration: "5 let",
      details: ["Smlouva na 12+ měsíců nebo na dobu neurčitou", "Větší svoboda (změna kantonu, ubytování, práce)", "Lepší benefity (rekvalifikace, stabilita, pojištění)", "Nejlepší volba pro dlouhodobý pobyt"] },
    { type: "C", name: "Ausweis C", subtitle: "Trvalý pobyt", color: "blue", duration: "Neomezený",
      details: ["Po 5–10 letech pobytu (záleží na zemi původu)", "Prakticky stejná práva jako Švýcaři", "Volný přístup na trh práce bez omezení", "Nejsilnější forma povolení"] },
    { type: "G", name: "Ausweis G", subtitle: "Přeshraniční pracovník", color: "purple", duration: "5 let",
      details: ["Bydlíš v jiné zemi (Německo, Francie, Itálie...)", "Denně nebo týdně dojíždíš do Švýcarska", "Nehodí se pro ty, kdo se chtějí usadit", "Min. 1× týdně návrat do země bydliště"] },
  ],
  deadlineTitle: "⏰ Kdy to musíš zařídit?",
  deadlineItems: ["📅 Do 14 dnů od příjezdu do Švýcarska", "⚠️ Než začneš oficiálně pracovat", "🏛️ Registrace přes obec (Einwohnerkontrolle) nebo Migrationsamt"],
  deadlineTip: "💡 Některé agentury tě zaregistrují samy, ale vždy si to ověř!",
  docsTitle: "👜 Co budeš potřebovat?",
  docs: [{ icon: "🪪", name: "Pas nebo občanku" }, { icon: "📝", name: "Pracovní smlouvu" }, { icon: "🏠", name: "Potvrzení o ubytování" }, { icon: "📸", name: "Pasovou fotku" }, { icon: "💰", name: "Poplatek (cca 40–60 CHF)" }],
  consequencesTitle: "⚠️ Co se stane, když to nevyřídíš?",
  consequences: [{ icon: "💸", text: "Pokuta", severity: "high" }, { icon: "🚫", text: "Zákaz pobytu", severity: "high" }, { icon: "❌", text: "Ztráta nároků na podporu, pojištění a rekvalifikace", severity: "high" }, { icon: "⚡", text: "Problémy s agenturou nebo zaměstnavatelem", severity: "medium" }],
  renewalTitle: "🔄 Prodloužení povolení", renewalText: "O prodloužení žádáš na", renewalOffice: "obecním úřadě",
  renewalEarliest: "Žádost podej", renewalEarliestBold: "nejdříve 3 měsíce", renewalLatest: "před koncem platnosti", renewalLatestBold: "Nejpozději 2 týdny",
  renewalDocsLabel: "Přílohy k žádosti:", renewalDocs: ["Stávající Ausweis", "Pas nebo občanka", "Potvrzení z úřadu o blížícím se konci platnosti"],
  lostTitle: "❗ Ztráta nebo krádež povolení",
  lostSteps: [{ step: "1", text: "Nahlásíš na policii → dostaneš potvrzení o ztrátě", icon: "🚔" }, { step: "2", text: "S potvrzením, fotkou a pasem jdeš na obec (nebo kanton)", icon: "🏛️" }, { step: "3", text: "Zaplatíš poplatek a vystaví ti nový doklad", icon: "📄" }],
  divorceTitle: "❤️ Rozvod, úmrtí partnera – co dál?",
  divorceIntro: "Pokud jsi ve Švýcarsku díky rodinnému sloučení a partner tě opustí, zemře nebo se rozvedete:",
  euCitizensTitle: "🇪🇺 EU/EFTA občané", euCitizensText: "Můžeš si zažádat o nový Ausweis, pokud:", euCitizensConditions: ["Pracuješ", "Máš dost vlastních financí"],
  thirdCountryTitle: "🌍 Třetizemci", thirdCountryText: "Povolení si můžeš prodloužit, pokud:", thirdCountryConditions: ["Min. 3 roky spolu", "Dobrá integrace (práce, jazyk, bez problémů)", "Osobní důvody (násilí, nemožnost návratu)"],
  keyRuleTitle: "🔒 Nejdůležitější pravidlo", keyRuleText: "Ve Švýcarsku není nic důležitějšího než mít", keyRuleBold: "správné papíry",
  officialTitle: "Oficiální informace", officialDesc: "ch.ch – přehled pobytových povolení", officialLink: "Navštívit →",
  ctaTitle: "Najdi agenturu, která ti vyřídí povolení", ctaDesc: "1 000+ švýcarských personálních agentur s kontakty", ctaButton: "Zobrazit agentury →",
};
export default cs;
EOF
echo "✅ cs.ts"

# ============================================
# 4. English
# ============================================
cat > content/permits/en.ts << 'EOF'
import { PermitsContent } from "./types";
const en: PermitsContent = {
  pageTag: "Important", pageTitle: "Residence Permits in Switzerland",
  pageDesc: "Everything you need to know before you start working – permit types, how to get them, and what you need.",
  introTitle: "🛃 Why do you need a permit?",
  introText1: "In Switzerland, you can't just arrive and start working. Every foreigner –",
  introText1Bold: "including EU citizens",
  introText2: "– must have a so-called residence permit (Ausweis). With it, you can legally work, be insured, and access many benefits – including free retraining or unemployment support.",
  euTitle: "🇪🇺 Good news for EU/EFTA citizens",
  euText: "Thanks to the freedom of movement agreement", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Permit Types",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Short-term permit", color: "yellow", duration: "3–12 months",
      details: ["Contract for less than 12 months", "Most common for agency work (temporär)", "Can be extended", "Ideal when you're just starting in Switzerland"] },
    { type: "B", name: "Ausweis B", subtitle: "Long-term permit", color: "green", duration: "5 years",
      details: ["Contract for 12+ months or indefinite", "More freedom (change canton, housing, job)", "Better benefits (retraining, stability, insurance)", "Best choice for long-term stay"] },
    { type: "C", name: "Ausweis C", subtitle: "Permanent residence", color: "blue", duration: "Unlimited",
      details: ["After 5–10 years of residence (depends on country of origin)", "Practically the same rights as Swiss citizens", "Unrestricted access to the job market", "Strongest form of permit"] },
    { type: "G", name: "Ausweis G", subtitle: "Cross-border commuter", color: "purple", duration: "5 years",
      details: ["You live in another country (Germany, France, Italy...)", "Daily or weekly commute to Switzerland", "Not suitable if you want to settle", "Must return to country of residence at least once a week"] },
  ],
  deadlineTitle: "⏰ When must you arrange it?",
  deadlineItems: ["📅 Within 14 days of arrival in Switzerland", "⚠️ Before you officially start working", "🏛️ Register at the municipality (Einwohnerkontrolle) or Migration Office"],
  deadlineTip: "💡 Some agencies will register you themselves, but always verify!",
  docsTitle: "👜 What will you need?",
  docs: [{ icon: "🪪", name: "Passport or ID card" }, { icon: "📝", name: "Employment contract" }, { icon: "🏠", name: "Proof of accommodation" }, { icon: "📸", name: "Passport photo" }, { icon: "💰", name: "Fee (approx. 40–60 CHF)" }],
  consequencesTitle: "⚠️ What happens if you don't?",
  consequences: [{ icon: "💸", text: "Fine", severity: "high" }, { icon: "🚫", text: "Residence ban", severity: "high" }, { icon: "❌", text: "Loss of benefits, insurance and retraining rights", severity: "high" }, { icon: "⚡", text: "Problems with agency or employer", severity: "medium" }],
  renewalTitle: "🔄 Permit Renewal", renewalText: "Apply for renewal at your", renewalOffice: "local municipality office",
  renewalEarliest: "Submit the application", renewalEarliestBold: "no earlier than 3 months", renewalLatest: "before expiry", renewalLatestBold: "No later than 2 weeks",
  renewalDocsLabel: "Required documents:", renewalDocs: ["Current Ausweis", "Passport or ID card", "Office confirmation of approaching expiry date"],
  lostTitle: "❗ Lost or stolen permit",
  lostSteps: [{ step: "1", text: "Report to police → get a loss confirmation", icon: "🚔" }, { step: "2", text: "Take confirmation, photo and passport to municipality (or canton)", icon: "🏛️" }, { step: "3", text: "Pay the fee and receive a new document", icon: "📄" }],
  divorceTitle: "❤️ Divorce, death of partner – what next?",
  divorceIntro: "If you're in Switzerland through family reunification and your partner leaves, dies, or you divorce:",
  euCitizensTitle: "🇪🇺 EU/EFTA citizens", euCitizensText: "You can apply for a new Ausweis if:", euCitizensConditions: ["You are employed", "You have sufficient personal finances"],
  thirdCountryTitle: "🌍 Third-country nationals", thirdCountryText: "You can extend your permit if:", thirdCountryConditions: ["Min. 3 years together", "Good integration (work, language, no issues)", "Personal reasons (domestic violence, inability to return)"],
  keyRuleTitle: "🔒 The most important rule", keyRuleText: "Nothing in Switzerland is more important than having the", keyRuleBold: "right papers",
  officialTitle: "Official information", officialDesc: "ch.ch – overview of residence permits", officialLink: "Visit →",
  ctaTitle: "Find an agency that handles your permit", ctaDesc: "1,000+ Swiss staffing agencies with contacts", ctaButton: "Show agencies →",
};
export default en;
EOF
echo "✅ en.ts"

# ============================================
# 5. Polish
# ============================================
cat > content/permits/pl.ts << 'EOF'
import { PermitsContent } from "./types";
const pl: PermitsContent = {
  pageTag: "Ważne", pageTitle: "Pozwolenia pobytowe w Szwajcarii",
  pageDesc: "Wszystko, co musisz wiedzieć przed rozpoczęciem pracy – rodzaje pozwoleń, jak je uzyskać i co jest potrzebne.",
  introTitle: "🛃 Dlaczego potrzebujesz pozwolenia?",
  introText1: "W Szwajcarii nie wystarczy po prostu przyjechać i zacząć pracować. Każdy obcokrajowiec –",
  introText1Bold: "łącznie z obywatelami UE",
  introText2: "– musi posiadać tzw. pozwolenie pobytowe (Ausweis). Dzięki niemu możesz legalnie pracować, mieć ubezpieczenie i korzystać z wielu świadczeń – np. darmowych przekwalifikowań czy zasiłku dla bezrobotnych.",
  euTitle: "🇪🇺 Dobra wiadomość dla obywateli UE/EFTA",
  euText: "Dzięki umowie o swobodnym przepływie osób", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Rodzaje pozwoleń",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Pozwolenie krótkoterminowe", color: "yellow", duration: "3–12 miesięcy",
      details: ["Umowa na mniej niż 12 miesięcy", "Najczęstsze przy pracy przez agencję (temporär)", "Możliwość przedłużenia", "Idealne na początek w Szwajcarii"] },
    { type: "B", name: "Ausweis B", subtitle: "Pozwolenie długoterminowe", color: "green", duration: "5 lat",
      details: ["Umowa na 12+ miesięcy lub na czas nieokreślony", "Większa swoboda (zmiana kantonu, mieszkania, pracy)", "Lepsze świadczenia (przekwalifikowanie, stabilność, ubezpieczenie)", "Najlepszy wybór na dłuższy pobyt"] },
    { type: "C", name: "Ausweis C", subtitle: "Pobyt stały", color: "blue", duration: "Bez ograniczeń",
      details: ["Po 5–10 latach pobytu (zależy od kraju pochodzenia)", "Praktycznie takie same prawa jak Szwajcarzy", "Swobodny dostęp do rynku pracy", "Najsilniejsza forma pozwolenia"] },
    { type: "G", name: "Ausweis G", subtitle: "Pracownik transgraniczny", color: "purple", duration: "5 lat",
      details: ["Mieszkasz w innym kraju (Niemcy, Francja, Włochy...)", "Codziennie lub tygodniowo dojeżdżasz do Szwajcarii", "Nie nadaje się, jeśli chcesz się osiedlić", "Min. 1× tygodniowo powrót do kraju zamieszkania"] },
  ],
  deadlineTitle: "⏰ Kiedy musisz to załatwić?",
  deadlineItems: ["📅 W ciągu 14 dni od przyjazdu do Szwajcarii", "⚠️ Zanim oficjalnie zaczniesz pracować", "🏛️ Rejestracja w gminie (Einwohnerkontrolle) lub Urzędzie Migracyjnym"],
  deadlineTip: "💡 Niektóre agencje zarejestrują cię same, ale zawsze to sprawdź!",
  docsTitle: "👜 Co będziesz potrzebować?",
  docs: [{ icon: "🪪", name: "Paszport lub dowód osobisty" }, { icon: "📝", name: "Umowę o pracę" }, { icon: "🏠", name: "Potwierdzenie zakwaterowania" }, { icon: "📸", name: "Zdjęcie paszportowe" }, { icon: "💰", name: "Opłata (ok. 40–60 CHF)" }],
  consequencesTitle: "⚠️ Co się stanie, jeśli tego nie załatwisz?",
  consequences: [{ icon: "💸", text: "Grzywna", severity: "high" }, { icon: "🚫", text: "Zakaz pobytu", severity: "high" }, { icon: "❌", text: "Utrata praw do świadczeń, ubezpieczenia i przekwalifikowania", severity: "high" }, { icon: "⚡", text: "Problemy z agencją lub pracodawcą", severity: "medium" }],
  renewalTitle: "🔄 Przedłużenie pozwolenia", renewalText: "O przedłużenie wnioskujesz w", renewalOffice: "urzędzie gminy",
  renewalEarliest: "Złóż wniosek", renewalEarliestBold: "najwcześniej 3 miesiące", renewalLatest: "przed końcem ważności", renewalLatestBold: "Najpóźniej 2 tygodnie",
  renewalDocsLabel: "Wymagane dokumenty:", renewalDocs: ["Aktualny Ausweis", "Paszport lub dowód osobisty", "Potwierdzenie z urzędu o zbliżającym się końcu ważności"],
  lostTitle: "❗ Utrata lub kradzież pozwolenia",
  lostSteps: [{ step: "1", text: "Zgłoś na policji → otrzymasz potwierdzenie utraty", icon: "🚔" }, { step: "2", text: "Z potwierdzeniem, zdjęciem i paszportem idź do gminy (lub kantonu)", icon: "🏛️" }, { step: "3", text: "Zapłać opłatę i otrzymaj nowy dokument", icon: "📄" }],
  divorceTitle: "❤️ Rozwód, śmierć partnera – co dalej?",
  divorceIntro: "Jeśli jesteś w Szwajcarii dzięki łączeniu rodzin i partner cię opuści, umrze lub się rozwiedziesz:",
  euCitizensTitle: "🇪🇺 Obywatele UE/EFTA", euCitizensText: "Możesz złożyć wniosek o nowy Ausweis, jeśli:", euCitizensConditions: ["Pracujesz", "Masz wystarczające środki finansowe"],
  thirdCountryTitle: "🌍 Obywatele krajów trzecich", thirdCountryText: "Możesz przedłużyć pozwolenie, jeśli:", thirdCountryConditions: ["Min. 3 lata razem", "Dobra integracja (praca, język, brak problemów)", "Powody osobiste (przemoc, brak możliwości powrotu)"],
  keyRuleTitle: "🔒 Najważniejsza zasada", keyRuleText: "Nic w Szwajcarii nie jest ważniejsze niż posiadanie", keyRuleBold: "odpowiednich dokumentów",
  officialTitle: "Oficjalne informacje", officialDesc: "ch.ch – przegląd pozwoleń pobytowych", officialLink: "Odwiedź →",
  ctaTitle: "Znajdź agencję, która załatwi ci pozwolenie", ctaDesc: "Ponad 1000 szwajcarskich agencji personalnych z kontaktami", ctaButton: "Pokaż agencje →",
};
export default pl;
EOF
echo "✅ pl.ts"

# ============================================
# 6. Ukrainian
# ============================================
cat > content/permits/uk.ts << 'EOF'
import { PermitsContent } from "./types";
const uk: PermitsContent = {
  pageTag: "Важливо", pageTitle: "Дозволи на проживання у Швейцарії",
  pageDesc: "Все, що потрібно знати перед початком роботи – типи дозволів, як їх отримати і що потрібно.",
  introTitle: "🛃 Навіщо потрібен дозвіл?",
  introText1: "У Швейцарії не можна просто приїхати і почати працювати. Кожен іноземець –",
  introText1Bold: "включно з громадянами ЄС",
  introText2: "– повинен мати дозвіл на проживання (Ausweis). З ним ви можете легально працювати, мати страховку та отримувати багато пільг – наприклад, безкоштовне перекваліфікування або допомогу по безробіттю.",
  euTitle: "🇪🇺 Гарна новина для громадян ЄС/ЄАВТ",
  euText: "Завдяки угоді про вільне пересування", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Типи дозволів",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Короткостроковий дозвіл", color: "yellow", duration: "3–12 місяців",
      details: ["Контракт менше 12 місяців", "Найпоширеніший при роботі через агенцію (temporär)", "Можливість продовження", "Ідеально для початку у Швейцарії"] },
    { type: "B", name: "Ausweis B", subtitle: "Довгостроковий дозвіл", color: "green", duration: "5 років",
      details: ["Контракт на 12+ місяців або безстроковий", "Більше свободи (зміна кантону, житла, роботи)", "Кращі пільги (перекваліфікування, стабільність, страхування)", "Найкращий вибір для тривалого перебування"] },
    { type: "C", name: "Ausweis C", subtitle: "Постійне проживання", color: "blue", duration: "Безстроковий",
      details: ["Після 5–10 років проживання (залежить від країни походження)", "Практично такі ж права, як у швейцарців", "Вільний доступ на ринок праці", "Найсильніша форма дозволу"] },
    { type: "G", name: "Ausweis G", subtitle: "Транскордонний працівник", color: "purple", duration: "5 років",
      details: ["Ви живете в іншій країні (Німеччина, Франція, Італія...)", "Щоденно або щотижнево їздите до Швейцарії", "Не підходить, якщо хочете оселитися", "Мін. 1× на тиждень повернення до країни проживання"] },
  ],
  deadlineTitle: "⏰ Коли це потрібно оформити?",
  deadlineItems: ["📅 Протягом 14 днів після приїзду до Швейцарії", "⚠️ До початку офіційної роботи", "🏛️ Реєстрація в громаді (Einwohnerkontrolle) або Міграційному відомстві"],
  deadlineTip: "💡 Деякі агенції зареєструють вас самі, але завжди перевіряйте!",
  docsTitle: "👜 Що вам знадобиться?",
  docs: [{ icon: "🪪", name: "Паспорт або ID-картка" }, { icon: "📝", name: "Трудовий договір" }, { icon: "🏠", name: "Підтвердження проживання" }, { icon: "📸", name: "Фото на паспорт" }, { icon: "💰", name: "Збір (прибл. 40–60 CHF)" }],
  consequencesTitle: "⚠️ Що буде, якщо не оформите?",
  consequences: [{ icon: "💸", text: "Штраф", severity: "high" }, { icon: "🚫", text: "Заборона на проживання", severity: "high" }, { icon: "❌", text: "Втрата права на допомогу, страховку та перекваліфікування", severity: "high" }, { icon: "⚡", text: "Проблеми з агенцією або роботодавцем", severity: "medium" }],
  renewalTitle: "🔄 Продовження дозволу", renewalText: "Заяву на продовження подаєте в", renewalOffice: "місцевій громаді",
  renewalEarliest: "Подайте заяву", renewalEarliestBold: "не раніше ніж за 3 місяці", renewalLatest: "до закінчення терміну", renewalLatestBold: "Не пізніше ніж за 2 тижні",
  renewalDocsLabel: "Необхідні документи:", renewalDocs: ["Діючий Ausweis", "Паспорт або ID-картка", "Підтвердження з відомства про наближення закінчення терміну"],
  lostTitle: "❗ Втрата або крадіжка дозволу",
  lostSteps: [{ step: "1", text: "Заявіть у поліцію → отримаєте підтвердження втрати", icon: "🚔" }, { step: "2", text: "З підтвердженням, фото та паспортом йдете до громади (або кантону)", icon: "🏛️" }, { step: "3", text: "Сплатіть збір та отримаєте новий документ", icon: "📄" }],
  divorceTitle: "❤️ Розлучення, смерть партнера – що далі?",
  divorceIntro: "Якщо ви в Швейцарії завдяки возз'єднанню сім'ї і партнер вас покинув, помер або ви розлучилися:",
  euCitizensTitle: "🇪🇺 Громадяни ЄС/ЄАВТ", euCitizensText: "Ви можете подати заяву на новий Ausweis, якщо:", euCitizensConditions: ["Ви працюєте", "Маєте достатні фінансові кошти"],
  thirdCountryTitle: "🌍 Громадяни третіх країн", thirdCountryText: "Ви можете продовжити дозвіл, якщо:", thirdCountryConditions: ["Мін. 3 роки разом", "Хороша інтеграція (робота, мова, без проблем)", "Особисті причини (насильство, неможливість повернення)"],
  keyRuleTitle: "🔒 Найважливіше правило", keyRuleText: "У Швейцарії немає нічого важливішого, ніж мати", keyRuleBold: "правильні документи",
  officialTitle: "Офіційна інформація", officialDesc: "ch.ch – огляд дозволів на проживання", officialLink: "Відвідати →",
  ctaTitle: "Знайдіть агенцію, яка оформить вам дозвіл", ctaDesc: "Понад 1 000 швейцарських кадрових агенцій з контактами", ctaButton: "Показати агенції →",
};
export default uk;
EOF
echo "✅ uk.ts"

# ============================================
# 7. Romanian
# ============================================
cat > content/permits/ro.ts << 'EOF'
import { PermitsContent } from "./types";
const ro: PermitsContent = {
  pageTag: "Important", pageTitle: "Permise de ședere în Elveția",
  pageDesc: "Tot ce trebuie să știi înainte de a începe munca – tipuri de permise, cum le obții și ce ai nevoie.",
  introTitle: "🛃 De ce ai nevoie de un permis?",
  introText1: "În Elveția nu poți pur și simplu să vii și să începi să lucrezi. Fiecare străin –",
  introText1Bold: "inclusiv cetățenii UE",
  introText2: "– trebuie să aibă un permis de ședere (Ausweis). Cu el poți lucra legal, ai asigurare și beneficiezi de multe avantaje – de exemplu, recalificare gratuită sau ajutor de șomaj.",
  euTitle: "🇪🇺 Veste bună pentru cetățenii UE/AELS", euText: "Datorită acordului privind libera circulație", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Tipuri de permise",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Permis pe termen scurt", color: "yellow", duration: "3–12 luni", details: ["Contract pe mai puțin de 12 luni", "Cel mai frecvent la munca prin agenție (temporär)", "Poate fi prelungit", "Ideal când abia începi în Elveția"] },
    { type: "B", name: "Ausweis B", subtitle: "Permis pe termen lung", color: "green", duration: "5 ani", details: ["Contract pe 12+ luni sau pe perioadă nedeterminată", "Mai multă libertate (schimbare canton, locuință, muncă)", "Beneficii mai bune (recalificare, stabilitate, asigurare)", "Cea mai bună alegere pentru ședere pe termen lung"] },
    { type: "C", name: "Ausweis C", subtitle: "Reședință permanentă", color: "blue", duration: "Nelimitat", details: ["După 5–10 ani de ședere (depinde de țara de origine)", "Practic aceleași drepturi ca elvețienii", "Acces liber pe piața muncii", "Cea mai puternică formă de permis"] },
    { type: "G", name: "Ausweis G", subtitle: "Lucrător transfrontalier", color: "purple", duration: "5 ani", details: ["Locuiești în altă țară (Germania, Franța, Italia...)", "Faci naveta zilnic sau săptămânal în Elveția", "Nu e potrivit dacă vrei să te stabilești", "Min. 1× pe săptămână întoarcere în țara de reședință"] },
  ],
  deadlineTitle: "⏰ Când trebuie să te ocupi de asta?",
  deadlineItems: ["📅 În termen de 14 zile de la sosirea în Elveția", "⚠️ Înainte de a începe oficial munca", "🏛️ Înregistrare la primărie (Einwohnerkontrolle) sau Oficiul de Migrație"],
  deadlineTip: "💡 Unele agenții te înregistrează singure, dar verifică întotdeauna!",
  docsTitle: "👜 Ce vei avea nevoie?",
  docs: [{ icon: "🪪", name: "Pașaport sau carte de identitate" }, { icon: "📝", name: "Contract de muncă" }, { icon: "🏠", name: "Dovada cazării" }, { icon: "📸", name: "Fotografie de pașaport" }, { icon: "💰", name: "Taxă (aprox. 40–60 CHF)" }],
  consequencesTitle: "⚠️ Ce se întâmplă dacă nu te ocupi?",
  consequences: [{ icon: "💸", text: "Amendă", severity: "high" }, { icon: "🚫", text: "Interdicție de ședere", severity: "high" }, { icon: "❌", text: "Pierderea drepturilor la ajutoare, asigurare și recalificare", severity: "high" }, { icon: "⚡", text: "Probleme cu agenția sau angajatorul", severity: "medium" }],
  renewalTitle: "🔄 Prelungirea permisului", renewalText: "Cererea de prelungire se depune la", renewalOffice: "primăria locală",
  renewalEarliest: "Depune cererea", renewalEarliestBold: "cel mai devreme cu 3 luni", renewalLatest: "înainte de expirare", renewalLatestBold: "Cel mai târziu cu 2 săptămâni",
  renewalDocsLabel: "Documente necesare:", renewalDocs: ["Ausweis-ul curent", "Pașaport sau carte de identitate", "Confirmare de la birou privind expirarea apropiată"],
  lostTitle: "❗ Pierderea sau furtul permisului",
  lostSteps: [{ step: "1", text: "Raportezi la poliție → primești confirmare de pierdere", icon: "🚔" }, { step: "2", text: "Cu confirmarea, fotografia și pașaportul mergi la primărie (sau canton)", icon: "🏛️" }, { step: "3", text: "Plătești taxa și primești un document nou", icon: "📄" }],
  divorceTitle: "❤️ Divorț, decesul partenerului – ce urmează?",
  divorceIntro: "Dacă ești în Elveția prin reunificarea familiei și partenerul te părăsește, moare sau divorțați:",
  euCitizensTitle: "🇪🇺 Cetățeni UE/AELS", euCitizensText: "Poți solicita un Ausweis nou dacă:", euCitizensConditions: ["Lucrezi", "Ai suficiente resurse financiare proprii"],
  thirdCountryTitle: "🌍 Cetățeni din țări terțe", thirdCountryText: "Poți prelungi permisul dacă:", thirdCountryConditions: ["Min. 3 ani împreună", "Bună integrare (muncă, limbă, fără probleme)", "Motive personale (violență, imposibilitate de întoarcere)"],
  keyRuleTitle: "🔒 Cea mai importantă regulă", keyRuleText: "Nimic în Elveția nu este mai important decât a avea", keyRuleBold: "actele în regulă",
  officialTitle: "Informații oficiale", officialDesc: "ch.ch – prezentare generală a permiselor de ședere", officialLink: "Vizitează →",
  ctaTitle: "Găsește o agenție care îți rezolvă permisul", ctaDesc: "Peste 1.000 de agenții de personal elvețiene cu date de contact", ctaButton: "Arată agențiile →",
};
export default ro;
EOF
echo "✅ ro.ts"

# ============================================
# 8. Italian
# ============================================
cat > content/permits/it.ts << 'EOF'
import { PermitsContent } from "./types";
const it: PermitsContent = {
  pageTag: "Importante", pageTitle: "Permessi di soggiorno in Svizzera",
  pageDesc: "Tutto quello che devi sapere prima di iniziare a lavorare – tipi di permesso, come ottenerli e cosa ti serve.",
  introTitle: "🛃 Perché hai bisogno di un permesso?",
  introText1: "In Svizzera non basta arrivare e iniziare a lavorare. Ogni straniero –",
  introText1Bold: "compresi i cittadini UE",
  introText2: "– deve avere un permesso di soggiorno (Ausweis). Con esso puoi lavorare legalmente, avere un'assicurazione e accedere a molti vantaggi – come la riqualificazione gratuita o l'indennità di disoccupazione.",
  euTitle: "🇪🇺 Buone notizie per i cittadini UE/AELS", euText: "Grazie all'accordo sulla libera circolazione", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Tipi di permesso",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Permesso a breve termine", color: "yellow", duration: "3–12 mesi", details: ["Contratto inferiore a 12 mesi", "Il più comune per il lavoro tramite agenzia (temporär)", "Può essere prolungato", "Ideale per chi inizia in Svizzera"] },
    { type: "B", name: "Ausweis B", subtitle: "Permesso a lungo termine", color: "green", duration: "5 anni", details: ["Contratto di 12+ mesi o a tempo indeterminato", "Maggiore libertà (cambio cantone, alloggio, lavoro)", "Migliori benefici (riqualificazione, stabilità, assicurazione)", "La scelta migliore per un soggiorno lungo"] },
    { type: "C", name: "Ausweis C", subtitle: "Residenza permanente", color: "blue", duration: "Illimitato", details: ["Dopo 5–10 anni di residenza (dipende dal paese di origine)", "Praticamente gli stessi diritti degli svizzeri", "Accesso libero al mercato del lavoro", "La forma più forte di permesso"] },
    { type: "G", name: "Ausweis G", subtitle: "Lavoratore frontaliero", color: "purple", duration: "5 anni", details: ["Vivi in un altro paese (Germania, Francia, Italia...)", "Fai il pendolare giornalmente o settimanalmente in Svizzera", "Non adatto se vuoi stabilirti", "Min. 1× a settimana ritorno nel paese di residenza"] },
  ],
  deadlineTitle: "⏰ Quando devi occupartene?",
  deadlineItems: ["📅 Entro 14 giorni dall'arrivo in Svizzera", "⚠️ Prima di iniziare ufficialmente a lavorare", "🏛️ Registrazione al comune (Einwohnerkontrolle) o all'Ufficio Migrazione"],
  deadlineTip: "💡 Alcune agenzie ti registrano da sole, ma verifica sempre!",
  docsTitle: "👜 Cosa ti servirà?",
  docs: [{ icon: "🪪", name: "Passaporto o carta d'identità" }, { icon: "📝", name: "Contratto di lavoro" }, { icon: "🏠", name: "Prova di alloggio" }, { icon: "📸", name: "Fototessera" }, { icon: "💰", name: "Tassa (ca. 40–60 CHF)" }],
  consequencesTitle: "⚠️ Cosa succede se non lo fai?",
  consequences: [{ icon: "💸", text: "Multa", severity: "high" }, { icon: "🚫", text: "Divieto di soggiorno", severity: "high" }, { icon: "❌", text: "Perdita dei diritti a prestazioni, assicurazione e riqualificazione", severity: "high" }, { icon: "⚡", text: "Problemi con l'agenzia o il datore di lavoro", severity: "medium" }],
  renewalTitle: "🔄 Rinnovo del permesso", renewalText: "La domanda di rinnovo si presenta al", renewalOffice: "comune di residenza",
  renewalEarliest: "Presenta la domanda", renewalEarliestBold: "al più presto 3 mesi", renewalLatest: "prima della scadenza", renewalLatestBold: "Al più tardi 2 settimane",
  renewalDocsLabel: "Documenti necessari:", renewalDocs: ["Ausweis attuale", "Passaporto o carta d'identità", "Conferma dell'ufficio sull'imminente scadenza"],
  lostTitle: "❗ Perdita o furto del permesso",
  lostSteps: [{ step: "1", text: "Denuncia alla polizia → ottieni conferma della perdita", icon: "🚔" }, { step: "2", text: "Con la conferma, la foto e il passaporto vai al comune (o cantone)", icon: "🏛️" }, { step: "3", text: "Paga la tassa e ricevi un nuovo documento", icon: "📄" }],
  divorceTitle: "❤️ Divorzio, morte del partner – e poi?",
  divorceIntro: "Se sei in Svizzera per ricongiungimento familiare e il tuo partner ti lascia, muore o divorziate:",
  euCitizensTitle: "🇪🇺 Cittadini UE/AELS", euCitizensText: "Puoi richiedere un nuovo Ausweis se:", euCitizensConditions: ["Lavori", "Hai risorse finanziarie sufficienti"],
  thirdCountryTitle: "🌍 Cittadini di paesi terzi", thirdCountryText: "Puoi prolungare il permesso se:", thirdCountryConditions: ["Min. 3 anni insieme", "Buona integrazione (lavoro, lingua, nessun problema)", "Motivi personali (violenza, impossibilità di ritorno)"],
  keyRuleTitle: "🔒 La regola più importante", keyRuleText: "In Svizzera niente è più importante di avere i", keyRuleBold: "documenti in regola",
  officialTitle: "Informazioni ufficiali", officialDesc: "ch.ch – panoramica dei permessi di soggiorno", officialLink: "Visita →",
  ctaTitle: "Trova un'agenzia che ti gestisca il permesso", ctaDesc: "Oltre 1.000 agenzie di lavoro svizzere con contatti", ctaButton: "Mostra agenzie →",
};
export default it;
EOF
echo "✅ it.ts"

# ============================================
# 9. Portuguese
# ============================================
cat > content/permits/pt.ts << 'EOF'
import { PermitsContent } from "./types";
const pt: PermitsContent = {
  pageTag: "Importante", pageTitle: "Autorizações de residência na Suíça",
  pageDesc: "Tudo o que precisas de saber antes de começar a trabalhar – tipos de autorização, como obtê-las e o que precisas.",
  introTitle: "🛃 Porque precisas de uma autorização?",
  introText1: "Na Suíça não basta chegar e começar a trabalhar. Cada estrangeiro –",
  introText1Bold: "incluindo cidadãos da UE",
  introText2: "– deve ter uma autorização de residência (Ausweis). Com ela podes trabalhar legalmente, ter seguro e aceder a muitos benefícios – como requalificação gratuita ou subsídio de desemprego.",
  euTitle: "🇪🇺 Boas notícias para cidadãos UE/EFTA", euText: "Graças ao acordo de livre circulação", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Tipos de autorização",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Autorização de curta duração", color: "yellow", duration: "3–12 meses", details: ["Contrato inferior a 12 meses", "Mais comum no trabalho por agência (temporär)", "Pode ser prolongada", "Ideal para quem está a começar na Suíça"] },
    { type: "B", name: "Ausweis B", subtitle: "Autorização de longa duração", color: "green", duration: "5 anos", details: ["Contrato de 12+ meses ou por tempo indeterminado", "Mais liberdade (mudança de cantão, alojamento, trabalho)", "Melhores benefícios (requalificação, estabilidade, seguro)", "Melhor escolha para estadia prolongada"] },
    { type: "C", name: "Ausweis C", subtitle: "Residência permanente", color: "blue", duration: "Ilimitada", details: ["Após 5–10 anos de residência (depende do país de origem)", "Praticamente os mesmos direitos que os suíços", "Acesso livre ao mercado de trabalho", "A forma mais forte de autorização"] },
    { type: "G", name: "Ausweis G", subtitle: "Trabalhador transfronteiriço", color: "purple", duration: "5 anos", details: ["Vives noutro país (Alemanha, França, Itália...)", "Deslocas-te diária ou semanalmente para a Suíça", "Não adequado se queres estabelecer-te", "Mín. 1× por semana regresso ao país de residência"] },
  ],
  deadlineTitle: "⏰ Quando tens de tratar disto?",
  deadlineItems: ["📅 Até 14 dias após a chegada à Suíça", "⚠️ Antes de começar oficialmente a trabalhar", "🏛️ Registo na junta de freguesia (Einwohnerkontrolle) ou Serviço de Migração"],
  deadlineTip: "💡 Algumas agências registam-te elas próprias, mas verifica sempre!",
  docsTitle: "👜 O que vais precisar?",
  docs: [{ icon: "🪪", name: "Passaporte ou cartão de cidadão" }, { icon: "📝", name: "Contrato de trabalho" }, { icon: "🏠", name: "Comprovativo de alojamento" }, { icon: "📸", name: "Fotografia tipo passe" }, { icon: "💰", name: "Taxa (aprox. 40–60 CHF)" }],
  consequencesTitle: "⚠️ O que acontece se não tratares?",
  consequences: [{ icon: "💸", text: "Multa", severity: "high" }, { icon: "🚫", text: "Proibição de residência", severity: "high" }, { icon: "❌", text: "Perda de direitos a apoios, seguro e requalificação", severity: "high" }, { icon: "⚡", text: "Problemas com a agência ou empregador", severity: "medium" }],
  renewalTitle: "🔄 Renovação da autorização", renewalText: "O pedido de renovação faz-se na", renewalOffice: "junta de freguesia local",
  renewalEarliest: "Submete o pedido", renewalEarliestBold: "no máximo 3 meses antes", renewalLatest: "do fim da validade", renewalLatestBold: "No mínimo 2 semanas antes",
  renewalDocsLabel: "Documentos necessários:", renewalDocs: ["Ausweis atual", "Passaporte ou cartão de cidadão", "Confirmação do serviço sobre a aproximação do fim da validade"],
  lostTitle: "❗ Perda ou roubo da autorização",
  lostSteps: [{ step: "1", text: "Reporta à polícia → recebes confirmação da perda", icon: "🚔" }, { step: "2", text: "Com a confirmação, foto e passaporte vai à junta (ou cantão)", icon: "🏛️" }, { step: "3", text: "Paga a taxa e recebes um novo documento", icon: "📄" }],
  divorceTitle: "❤️ Divórcio, morte do parceiro – e agora?",
  divorceIntro: "Se estás na Suíça por reunificação familiar e o teu parceiro te deixa, morre ou vocês divorciam-se:",
  euCitizensTitle: "🇪🇺 Cidadãos UE/EFTA", euCitizensText: "Podes pedir um novo Ausweis se:", euCitizensConditions: ["Trabalhas", "Tens recursos financeiros suficientes"],
  thirdCountryTitle: "🌍 Cidadãos de países terceiros", thirdCountryText: "Podes prolongar a autorização se:", thirdCountryConditions: ["Mín. 3 anos juntos", "Boa integração (trabalho, língua, sem problemas)", "Motivos pessoais (violência, impossibilidade de regresso)"],
  keyRuleTitle: "🔒 A regra mais importante", keyRuleText: "Na Suíça nada é mais importante do que ter os", keyRuleBold: "documentos em ordem",
  officialTitle: "Informações oficiais", officialDesc: "ch.ch – visão geral das autorizações de residência", officialLink: "Visitar →",
  ctaTitle: "Encontra uma agência que trate da tua autorização", ctaDesc: "Mais de 1.000 agências de trabalho suíças com contactos", ctaButton: "Mostrar agências →",
};
export default pt;
EOF
echo "✅ pt.ts"

# ============================================
# 10. Spanish
# ============================================
cat > content/permits/es.ts << 'EOF'
import { PermitsContent } from "./types";
const es: PermitsContent = {
  pageTag: "Importante", pageTitle: "Permisos de residencia en Suiza",
  pageDesc: "Todo lo que necesitas saber antes de empezar a trabajar – tipos de permiso, cómo obtenerlos y qué necesitas.",
  introTitle: "🛃 ¿Por qué necesitas un permiso?",
  introText1: "En Suiza no basta con llegar y ponerse a trabajar. Cada extranjero –",
  introText1Bold: "incluidos los ciudadanos de la UE",
  introText2: "– debe tener un permiso de residencia (Ausweis). Con él puedes trabajar legalmente, tener seguro y acceder a muchos beneficios – como recualificación gratuita o prestación por desempleo.",
  euTitle: "🇪🇺 Buenas noticias para ciudadanos UE/AELC", euText: "Gracias al acuerdo de libre circulación", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Tipos de permiso",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Permiso de corta duración", color: "yellow", duration: "3–12 meses", details: ["Contrato de menos de 12 meses", "El más común en trabajo por agencia (temporär)", "Puede prorrogarse", "Ideal para quienes empiezan en Suiza"] },
    { type: "B", name: "Ausweis B", subtitle: "Permiso de larga duración", color: "green", duration: "5 años", details: ["Contrato de 12+ meses o indefinido", "Mayor libertad (cambio de cantón, vivienda, trabajo)", "Mejores prestaciones (recualificación, estabilidad, seguro)", "La mejor opción para estancia prolongada"] },
    { type: "C", name: "Ausweis C", subtitle: "Residencia permanente", color: "blue", duration: "Ilimitado", details: ["Tras 5–10 años de residencia (depende del país de origen)", "Prácticamente los mismos derechos que los suizos", "Acceso libre al mercado laboral", "La forma más sólida de permiso"] },
    { type: "G", name: "Ausweis G", subtitle: "Trabajador transfronterizo", color: "purple", duration: "5 años", details: ["Vives en otro país (Alemania, Francia, Italia...)", "Te desplazas diaria o semanalmente a Suiza", "No apto si quieres establecerte", "Mín. 1× por semana regreso al país de residencia"] },
  ],
  deadlineTitle: "⏰ ¿Cuándo debes gestionarlo?",
  deadlineItems: ["📅 En un plazo de 14 días desde la llegada a Suiza", "⚠️ Antes de empezar a trabajar oficialmente", "🏛️ Registro en el ayuntamiento (Einwohnerkontrolle) o en la Oficina de Migración"],
  deadlineTip: "💡 Algunas agencias te registran ellas mismas, ¡pero compruébalo siempre!",
  docsTitle: "👜 ¿Qué necesitarás?",
  docs: [{ icon: "🪪", name: "Pasaporte o DNI" }, { icon: "📝", name: "Contrato de trabajo" }, { icon: "🏠", name: "Comprobante de alojamiento" }, { icon: "📸", name: "Fotografía de pasaporte" }, { icon: "💰", name: "Tasa (aprox. 40–60 CHF)" }],
  consequencesTitle: "⚠️ ¿Qué pasa si no lo gestionas?",
  consequences: [{ icon: "💸", text: "Multa", severity: "high" }, { icon: "🚫", text: "Prohibición de residencia", severity: "high" }, { icon: "❌", text: "Pérdida de derechos a prestaciones, seguro y recualificación", severity: "high" }, { icon: "⚡", text: "Problemas con la agencia o el empleador", severity: "medium" }],
  renewalTitle: "🔄 Renovación del permiso", renewalText: "La solicitud de renovación se presenta en el", renewalOffice: "ayuntamiento local",
  renewalEarliest: "Presenta la solicitud", renewalEarliestBold: "como máximo 3 meses antes", renewalLatest: "del vencimiento", renewalLatestBold: "Como mínimo 2 semanas antes",
  renewalDocsLabel: "Documentos necesarios:", renewalDocs: ["Ausweis actual", "Pasaporte o DNI", "Confirmación de la oficina sobre el próximo vencimiento"],
  lostTitle: "❗ Pérdida o robo del permiso",
  lostSteps: [{ step: "1", text: "Denuncia en la policía → recibes confirmación de pérdida", icon: "🚔" }, { step: "2", text: "Con la confirmación, foto y pasaporte acude al ayuntamiento (o cantón)", icon: "🏛️" }, { step: "3", text: "Paga la tasa y recibe un nuevo documento", icon: "📄" }],
  divorceTitle: "❤️ Divorcio, fallecimiento del cónyuge – ¿y ahora qué?",
  divorceIntro: "Si estás en Suiza por reagrupación familiar y tu pareja te deja, fallece o os divorciáis:",
  euCitizensTitle: "🇪🇺 Ciudadanos UE/AELC", euCitizensText: "Puedes solicitar un nuevo Ausweis si:", euCitizensConditions: ["Trabajas", "Tienes recursos económicos suficientes"],
  thirdCountryTitle: "🌍 Ciudadanos de terceros países", thirdCountryText: "Puedes prorrogar el permiso si:", thirdCountryConditions: ["Mín. 3 años juntos", "Buena integración (trabajo, idioma, sin problemas)", "Motivos personales (violencia, imposibilidad de regreso)"],
  keyRuleTitle: "🔒 La regla más importante", keyRuleText: "En Suiza no hay nada más importante que tener los", keyRuleBold: "papeles en regla",
  officialTitle: "Información oficial", officialDesc: "ch.ch – resumen de permisos de residencia", officialLink: "Visitar →",
  ctaTitle: "Encuentra una agencia que te gestione el permiso", ctaDesc: "Más de 1.000 agencias de empleo suizas con contactos", ctaButton: "Mostrar agencias →",
};
export default es;
EOF
echo "✅ es.ts"

# ============================================
# 11. Greek
# ============================================
cat > content/permits/el.ts << 'EOF'
import { PermitsContent } from "./types";
const el: PermitsContent = {
  pageTag: "Σημαντικό", pageTitle: "Άδειες διαμονής στην Ελβετία",
  pageDesc: "Όλα όσα πρέπει να γνωρίζεις πριν αρχίσεις να εργάζεσαι – τύποι αδειών, πώς να τις αποκτήσεις και τι χρειάζεσαι.",
  introTitle: "🛃 Γιατί χρειάζεσαι άδεια;",
  introText1: "Στην Ελβετία δεν αρκεί να έρθεις και να αρχίσεις να δουλεύεις. Κάθε αλλοδαπός –",
  introText1Bold: "συμπεριλαμβανομένων πολιτών ΕΕ",
  introText2: "– πρέπει να διαθέτει άδεια διαμονής (Ausweis). Με αυτήν μπορείς να εργάζεσαι νόμιμα, να έχεις ασφάλεια και να αποκτήσεις πολλά οφέλη – όπως δωρεάν επανακατάρτιση ή επίδομα ανεργίας.",
  euTitle: "🇪🇺 Καλά νέα για πολίτες ΕΕ/ΕΖΕΣ", euText: "Χάρη στη συμφωνία ελεύθερης κυκλοφορίας", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Τύποι αδειών",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Βραχυπρόθεσμη άδεια", color: "yellow", duration: "3–12 μήνες", details: ["Σύμβαση κάτω των 12 μηνών", "Η πιο συνηθισμένη για εργασία μέσω γραφείου (temporär)", "Δυνατότητα παράτασης", "Ιδανική για αρχή στην Ελβετία"] },
    { type: "B", name: "Ausweis B", subtitle: "Μακροπρόθεσμη άδεια", color: "green", duration: "5 χρόνια", details: ["Σύμβαση 12+ μηνών ή αορίστου χρόνου", "Μεγαλύτερη ελευθερία (αλλαγή καντονιού, στέγασης, εργασίας)", "Καλύτερες παροχές (επανακατάρτιση, σταθερότητα, ασφάλιση)", "Η καλύτερη επιλογή για μακροχρόνια παραμονή"] },
    { type: "C", name: "Ausweis C", subtitle: "Μόνιμη διαμονή", color: "blue", duration: "Απεριόριστη", details: ["Μετά από 5–10 χρόνια διαμονής (εξαρτάται από τη χώρα καταγωγής)", "Ουσιαστικά τα ίδια δικαιώματα με τους Ελβετούς", "Ελεύθερη πρόσβαση στην αγορά εργασίας", "Η ισχυρότερη μορφή άδειας"] },
    { type: "G", name: "Ausweis G", subtitle: "Διασυνοριακός εργαζόμενος", color: "purple", duration: "5 χρόνια", details: ["Ζεις σε άλλη χώρα (Γερμανία, Γαλλία, Ιταλία...)", "Μετακινείσαι καθημερινά ή εβδομαδιαία στην Ελβετία", "Δεν ταιριάζει αν θέλεις να εγκατασταθείς", "Ελάχ. 1× την εβδομάδα επιστροφή στη χώρα διαμονής"] },
  ],
  deadlineTitle: "⏰ Πότε πρέπει να το διευθετήσεις;",
  deadlineItems: ["📅 Εντός 14 ημερών από την άφιξη στην Ελβετία", "⚠️ Πριν αρχίσεις επίσημα να εργάζεσαι", "🏛️ Εγγραφή στο δημαρχείο (Einwohnerkontrolle) ή στην Υπηρεσία Μετανάστευσης"],
  deadlineTip: "💡 Ορισμένα γραφεία σε εγγράφουν μόνα τους, αλλά πάντα επιβεβαίωνε!",
  docsTitle: "👜 Τι θα χρειαστείς;",
  docs: [{ icon: "🪪", name: "Διαβατήριο ή ταυτότητα" }, { icon: "📝", name: "Σύμβαση εργασίας" }, { icon: "🏠", name: "Απόδειξη στέγασης" }, { icon: "📸", name: "Φωτογραφία διαβατηρίου" }, { icon: "💰", name: "Τέλος (περ. 40–60 CHF)" }],
  consequencesTitle: "⚠️ Τι συμβαίνει αν δεν το φροντίσεις;",
  consequences: [{ icon: "💸", text: "Πρόστιμο", severity: "high" }, { icon: "🚫", text: "Απαγόρευση διαμονής", severity: "high" }, { icon: "❌", text: "Απώλεια δικαιωμάτων σε παροχές, ασφάλιση και επανακατάρτιση", severity: "high" }, { icon: "⚡", text: "Προβλήματα με το γραφείο ή τον εργοδότη", severity: "medium" }],
  renewalTitle: "🔄 Ανανέωση άδειας", renewalText: "Η αίτηση ανανέωσης υποβάλλεται στο", renewalOffice: "τοπικό δημαρχείο",
  renewalEarliest: "Υπόβαλε την αίτηση", renewalEarliestBold: "το νωρίτερο 3 μήνες", renewalLatest: "πριν τη λήξη", renewalLatestBold: "Το αργότερο 2 εβδομάδες",
  renewalDocsLabel: "Απαιτούμενα έγγραφα:", renewalDocs: ["Τρέχον Ausweis", "Διαβατήριο ή ταυτότητα", "Βεβαίωση υπηρεσίας για την επικείμενη λήξη"],
  lostTitle: "❗ Απώλεια ή κλοπή άδειας",
  lostSteps: [{ step: "1", text: "Δήλωση στην αστυνομία → λαμβάνεις βεβαίωση απώλειας", icon: "🚔" }, { step: "2", text: "Με τη βεβαίωση, τη φωτογραφία και το διαβατήριο πηγαίνεις στο δημαρχείο (ή καντόνι)", icon: "🏛️" }, { step: "3", text: "Πληρώνεις το τέλος και λαμβάνεις νέο έγγραφο", icon: "📄" }],
  divorceTitle: "❤️ Διαζύγιο, θάνατος συντρόφου – τι ακολουθεί;",
  divorceIntro: "Αν βρίσκεσαι στην Ελβετία μέσω οικογενειακής επανένωσης και ο σύντροφός σου σε εγκαταλείπει, πεθαίνει ή χωρίζετε:",
  euCitizensTitle: "🇪🇺 Πολίτες ΕΕ/ΕΖΕΣ", euCitizensText: "Μπορείς να αιτηθείς νέο Ausweis αν:", euCitizensConditions: ["Εργάζεσαι", "Έχεις αρκετούς οικονομικούς πόρους"],
  thirdCountryTitle: "🌍 Πολίτες τρίτων χωρών", thirdCountryText: "Μπορείς να παρατείνεις την άδεια αν:", thirdCountryConditions: ["Ελάχ. 3 χρόνια μαζί", "Καλή ένταξη (εργασία, γλώσσα, χωρίς προβλήματα)", "Προσωπικοί λόγοι (βία, αδυναμία επιστροφής)"],
  keyRuleTitle: "🔒 Ο πιο σημαντικός κανόνας", keyRuleText: "Στην Ελβετία τίποτα δεν είναι πιο σημαντικό από το να έχεις τα", keyRuleBold: "σωστά έγγραφα",
  officialTitle: "Επίσημες πληροφορίες", officialDesc: "ch.ch – επισκόπηση αδειών διαμονής", officialLink: "Επίσκεψη →",
  ctaTitle: "Βρες γραφείο που θα σου εξασφαλίσει την άδεια", ctaDesc: "Πάνω από 1.000 ελβετικά γραφεία προσωπικού με στοιχεία επικοινωνίας", ctaButton: "Εμφάνιση γραφείων →",
};
export default el;
EOF
echo "✅ el.ts"

# ============================================
# 12. Hungarian
# ============================================
cat > content/permits/hu.ts << 'EOF'
import { PermitsContent } from "./types";
const hu: PermitsContent = {
  pageTag: "Fontos", pageTitle: "Tartózkodási engedélyek Svájcban",
  pageDesc: "Minden, amit tudnod kell a munkakezdés előtt – engedélytípusok, hogyan szerezheted meg őket és mire van szükséged.",
  introTitle: "🛃 Miért van szükséged engedélyre?",
  introText1: "Svájcban nem elég egyszerűen megérkezni és elkezdeni dolgozni. Minden külföldi –",
  introText1Bold: "beleértve az EU állampolgárokat is",
  introText2: "– rendelkeznie kell tartózkodási engedéllyel (Ausweis). Ezzel legálisan dolgozhatsz, biztosítva leszel, és számos kedvezményt kaphatsz – például ingyenes átképzést vagy munkanélküli segélyt.",
  euTitle: "🇪🇺 Jó hír az EU/EFTA állampolgároknak", euText: "A szabad mozgásról szóló megállapodásnak köszönhetően", euAgreement: "(Freizügigkeitsabkommen)",
  permitTypesTitle: "📋 Engedélytípusok",
  permits: [
    { type: "L", name: "Ausweis L", subtitle: "Rövid távú engedély", color: "yellow", duration: "3–12 hónap", details: ["12 hónapnál rövidebb szerződés", "A leggyakoribb ügynökségi munkánál (temporär)", "Meghosszabbítható", "Ideális, ha most kezdesz Svájcban"] },
    { type: "B", name: "Ausweis B", subtitle: "Hosszú távú engedély", color: "green", duration: "5 év", details: ["12+ hónapos vagy határozatlan idejű szerződés", "Több szabadság (kantonváltás, lakás, munka)", "Jobb juttatások (átképzés, stabilitás, biztosítás)", "A legjobb választás hosszú tartózkodáshoz"] },
    { type: "C", name: "Ausweis C", subtitle: "Állandó letelepedési engedély", color: "blue", duration: "Korlátlan", details: ["5–10 év tartózkodás után (származási országtól függ)", "Gyakorlatilag ugyanazok a jogok, mint a svájciaké", "Szabad hozzáférés a munkaerőpiachoz", "Az engedély legerősebb formája"] },
    { type: "G", name: "Ausweis G", subtitle: "Határon átnyúló ingázó", color: "purple", duration: "5 év", details: ["Másik országban laksz (Németország, Franciaország, Olaszország...)", "Napi vagy heti ingázás Svájcba", "Nem alkalmas, ha le akarsz telepedni", "Min. hetente 1× visszatérés a lakóhely országába"] },
  ],
  deadlineTitle: "⏰ Mikor kell elintézned?",
  deadlineItems: ["📅 A Svájcba érkezéstől számított 14 napon belül", "⚠️ Mielőtt hivatalosan elkezdenél dolgozni", "🏛️ Regisztráció az önkormányzatnál (Einwohnerkontrolle) vagy a Migrációs Hivatalnál"],
  deadlineTip: "💡 Egyes ügynökségek maguk regisztrálnak téged, de mindig ellenőrizd!",
  docsTitle: "👜 Mire lesz szükséged?",
  docs: [{ icon: "🪪", name: "Útlevél vagy személyi igazolvány" }, { icon: "📝", name: "Munkaszerződés" }, { icon: "🏠", name: "Lakhatás igazolása" }, { icon: "📸", name: "Igazolványkép" }, { icon: "💰", name: "Illeték (kb. 40–60 CHF)" }],
  consequencesTitle: "⚠️ Mi történik, ha nem intézed el?",
  consequences: [{ icon: "💸", text: "Bírság", severity: "high" }, { icon: "🚫", text: "Tartózkodási tilalom", severity: "high" }, { icon: "❌", text: "A juttatásokhoz, biztosításhoz és átképzéshez való jog elvesztése", severity: "high" }, { icon: "⚡", text: "Problémák az ügynökséggel vagy a munkáltatóval", severity: "medium" }],
  renewalTitle: "🔄 Az engedély meghosszabbítása", renewalText: "A meghosszabbítási kérelmet az", renewalOffice: "önkormányzathoz nyújtod be",
  renewalEarliest: "Nyújtsd be a kérelmet", renewalEarliestBold: "legkorábban 3 hónappal", renewalLatest: "a lejárat előtt", renewalLatestBold: "Legkésőbb 2 héttel",
  renewalDocsLabel: "Szükséges dokumentumok:", renewalDocs: ["Jelenlegi Ausweis", "Útlevél vagy személyi igazolvány", "Hivatal igazolása a közelgő lejáratról"],
  lostTitle: "❗ Az engedély elvesztése vagy ellopása",
  lostSteps: [{ step: "1", text: "Bejelentés a rendőrségen → elvesztési igazolást kapsz", icon: "🚔" }, { step: "2", text: "Az igazolással, fotóval és útlevéllel menj az önkormányzathoz (vagy kantonhoz)", icon: "🏛️" }, { step: "3", text: "Fizesd be az illetéket és megkapod az új dokumentumot", icon: "📄" }],
  divorceTitle: "❤️ Válás, a partner halála – mi a következő lépés?",
  divorceIntro: "Ha családegyesítés révén vagy Svájcban és a partnered elhagy, meghal vagy elváltok:",
  euCitizensTitle: "🇪🇺 EU/EFTA állampolgárok", euCitizensText: "Kérelmezhetsz új Ausweis-t, ha:", euCitizensConditions: ["Dolgozol", "Elegendő saját pénzügyi forrásokkal rendelkezel"],
  thirdCountryTitle: "🌍 Harmadik országbeli állampolgárok", thirdCountryText: "Meghosszabbíthatod az engedélyt, ha:", thirdCountryConditions: ["Min. 3 év együttélés", "Jó integráció (munka, nyelv, problémamentes)", "Személyes okok (erőszak, visszatérés lehetetlensége)"],
  keyRuleTitle: "🔒 A legfontosabb szabály", keyRuleText: "Svájcban semmi sem fontosabb, mint hogy meglegyen a", keyRuleBold: "megfelelő papírod",
  officialTitle: "Hivatalos információk", officialDesc: "ch.ch – tartózkodási engedélyek áttekintése", officialLink: "Meglátogatás →",
  ctaTitle: "Találj ügynökséget, amely elintézi az engedélyedet", ctaDesc: "Több mint 1000 svájci munkaerő-közvetítő elérhetőségekkel", ctaButton: "Ügynökségek megjelenítése →",
};
export default hu;
EOF
echo "✅ hu.ts"

# ============================================
# 13. Translation index
# ============================================
cat > content/permits/index.ts << 'EOF'
import { PermitsContent } from "./types";
import { Locale } from "../../../lib/i18n/types";
import cs from "./cs";
import en from "./en";
import pl from "./pl";
import uk from "./uk";
import ro from "./ro";
import it from "./it";
import pt from "./pt";
import es from "./es";
import el from "./el";
import hu from "./hu";

const permitsTranslations: Record<Locale, PermitsContent> = { cs, en, pl, uk, ro, it, pt, es, el, hu };
export function getPermitsContent(locale: Locale): PermitsContent { return permitsTranslations[locale] || permitsTranslations.en; }
export default permitsTranslations;
EOF
echo "✅ index.ts"

# ============================================
# 14. Fix import path (content is at root level)
# ============================================
# The import in index.ts needs correct path to i18n types
sed -i 's|from "../../../lib/i18n/types"|from "../../lib/i18n/types"|' content/permits/index.ts

# ============================================
# 15. Replace permits page with translated version
# ============================================
cat > app/pruvodce/povoleni/page.tsx << 'PAGEOF'
"use client";
import Link from "next/link";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import { getPermitsContent } from "../../../content/permits";

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; light: string }> = {
  yellow: { bg: "bg-yellow-500/[0.06]", border: "border-yellow-500/[0.12]", text: "text-yellow-400", badge: "bg-yellow-500/20", light: "bg-yellow-500/[0.08]" },
  green: { bg: "bg-green-500/[0.06]", border: "border-green-500/[0.12]", text: "text-green-400", badge: "bg-green-500/20", light: "bg-green-500/[0.08]" },
  blue: { bg: "bg-blue-500/[0.06]", border: "border-blue-500/[0.12]", text: "text-blue-400", badge: "bg-blue-500/20", light: "bg-blue-500/[0.08]" },
  purple: { bg: "bg-purple-500/[0.06]", border: "border-purple-500/[0.12]", text: "text-purple-400", badge: "bg-purple-500/20", light: "bg-purple-500/[0.08]" },
};

export default function PovoleniPage() {
  const { locale } = useLanguage();
  const t = getPermitsContent(locale);

  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 px-5 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center text-2xl">📋</div>
          <div><span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-red-400 bg-red-500/10">{t.pageTag}</span></div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">{t.pageTitle}</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t.pageDesc}</p>
      </div>

      <div className="px-5 mt-4 relative z-10">
        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.introTitle}</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">{t.introText1} <span className="text-white font-semibold">{t.introText1Bold}</span> {t.introText2}</p>
          <div className="bg-green-500/[0.06] rounded-xl p-3.5 border border-green-500/[0.1]">
            <p className="text-sm font-bold text-green-400 mb-1">{t.euTitle}</p>
            <p className="text-[12px] text-gray-300 leading-relaxed">{t.euText} <span className="text-white font-medium">{t.euAgreement}</span></p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">{t.permitTypesTitle}</h2>
        <div className="flex flex-col gap-3 mb-8">
          {t.permits.map((permit, i) => {
            const c = colorMap[permit.color];
            return (
              <div key={i} className={`${c.bg} rounded-2xl p-5 border ${c.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${c.badge} flex items-center justify-center`}><span className={`text-lg font-black ${c.text}`}>{permit.type}</span></div>
                    <div><h3 className="text-sm font-bold text-white">{permit.name}</h3><p className="text-[11px] text-gray-500">{permit.subtitle}</p></div>
                  </div>
                  <div className={`${c.light} rounded-lg px-2.5 py-1 border ${c.border}`}><span className={`text-[11px] font-bold ${c.text}`}>{permit.duration}</span></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {permit.details.map((detail, j) => (
                    <div key={j} className="flex items-start gap-2"><div className={`w-1.5 h-1.5 rounded-full ${c.text.replace("text-", "bg-")} mt-1.5 flex-shrink-0`} /><span className="text-[13px] text-gray-300 leading-relaxed">{detail}</span></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-red-500/[0.06] rounded-2xl p-5 border border-red-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.deadlineTitle}</h2>
          <div className="flex flex-col gap-2.5 mb-4">
            {t.deadlineItems.map((item, i) => (<div key={i} className="flex items-center gap-2.5"><span className="text-[13px] text-gray-300">{item}</span></div>))}
          </div>
          <div className="bg-yellow-500/[0.06] rounded-xl p-3 border border-yellow-500/[0.08]"><p className="text-[12px] text-yellow-400 font-medium">{t.deadlineTip}</p></div>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-6">
          <h2 className="text-base font-bold text-white mb-4">{t.docsTitle}</h2>
          <div className="flex flex-col gap-2">
            {t.docs.map((doc, i) => (<div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]"><span className="text-lg">{doc.icon}</span><span className="text-sm font-medium text-white">{doc.name}</span></div>))}
          </div>
        </div>

        <div className="bg-red-500/[0.08] rounded-2xl p-5 border border-red-500/[0.15] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.consequencesTitle}</h2>
          <div className="flex flex-col gap-2.5">
            {t.consequences.map((item, i) => (<div key={i} className="flex items-start gap-2.5"><span className="text-base mt-0.5">{item.icon}</span><span className={`text-[13px] leading-relaxed ${item.severity === "high" ? "text-red-300 font-medium" : "text-gray-300"}`}>{item.text}</span></div>))}
          </div>
        </div>

        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.renewalTitle}</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">{t.renewalText} <span className="text-white font-medium">{t.renewalOffice}</span>.</p>
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] mb-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="text-green-400">✅</span><span className="text-[13px] text-gray-300">{t.renewalEarliest} <span className="text-white font-medium">{t.renewalEarliestBold}</span> {t.renewalLatest}</span></div>
              <div className="flex items-center gap-2"><span className="text-red-400">⚠️</span><span className="text-[13px] text-gray-300"><span className="text-white font-medium">{t.renewalLatestBold}</span> {t.renewalLatest}</span></div>
            </div>
          </div>
          <p className="text-[12px] text-gray-500 mb-2">{t.renewalDocsLabel}</p>
          <div className="flex flex-col gap-1.5">
            {t.renewalDocs.map((item, i) => (<div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" /><span className="text-[13px] text-gray-300">{item}</span></div>))}
          </div>
        </div>

        <div className="bg-yellow-500/[0.06] rounded-2xl p-5 border border-yellow-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.lostTitle}</h2>
          <div className="flex flex-col gap-3">
            {t.lostSteps.map((item, i) => (<div key={i} className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.04]"><div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-400 flex-shrink-0">{item.step}</div><span className="text-[13px] text-gray-300">{item.text}</span></div>))}
          </div>
        </div>

        <div className="bg-purple-500/[0.06] rounded-2xl p-5 border border-purple-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">{t.divorceTitle}</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">{t.divorceIntro}</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-green-500/[0.04] rounded-xl p-4 border border-green-500/[0.08]">
              <p className="text-sm font-bold text-green-400 mb-2">{t.euCitizensTitle}</p>
              <p className="text-[13px] text-gray-300 leading-relaxed">{t.euCitizensText}</p>
              <div className="flex flex-col gap-1 mt-2">{t.euCitizensConditions.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-green-400">✓</span><span className="text-[12px] text-gray-300">{c}</span></div>))}</div>
            </div>
            <div className="bg-orange-500/[0.04] rounded-xl p-4 border border-orange-500/[0.08]">
              <p className="text-sm font-bold text-orange-400 mb-2">{t.thirdCountryTitle}</p>
              <p className="text-[13px] text-gray-300 leading-relaxed">{t.thirdCountryText}</p>
              <div className="flex flex-col gap-1 mt-2">{t.thirdCountryConditions.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-orange-400">✓</span><span className="text-[12px] text-gray-300">{c}</span></div>))}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/[0.1] to-orange-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] mb-6">
          <p className="text-base font-bold text-white mb-2">{t.keyRuleTitle}</p>
          <p className="text-[13px] text-gray-300 leading-relaxed">{t.keyRuleText} <span className="text-white font-semibold">{t.keyRuleBold}</span>.</p>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">📚</span>
            <div className="flex-1"><p className="text-sm font-medium text-white">{t.officialTitle}</p><p className="text-[11px] text-gray-500">{t.officialDesc}</p></div>
            <a href="https://www.ch.ch" target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-400 font-medium hover:text-blue-300 transition-colors">{t.officialLink}</a>
          </div>
        </div>

        <Link href="/kontakty" className="block mb-6">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] text-center hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">{t.ctaTitle}</p>
            <p className="text-[12px] text-gray-400 mb-3">{t.ctaDesc}</p>
            <span className="bg-red-500 text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg shadow-red-500/30 inline-block">{t.ctaButton}</span>
          </div>
        </Link>
      </div>
    </main>
  );
}
PAGEOF
echo "✅ Permits page replaced with translated version"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Permits guide fully translated into 10 languages!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🌍 Languages: CS, EN, PL, UK, RO, IT, PT, ES, EL, HU"
echo ""
echo "📁 Files created:"
echo "  • content/permits/types.ts"
echo "  • content/permits/{cs,en,pl,uk,ro,it,pt,es,el,hu}.ts"
echo "  • content/permits/index.ts"
echo "  • app/pruvodce/povoleni/page.tsx (replaced)"
echo ""
echo "🚀 Run:"
echo "  git add -A && git commit -m 'feat: fully translate permits guide into 10 languages' && git push"
echo ""
