export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "platy-svycarsko",
    title: "Platy ve Švýcarsku 2026 — kompletní přehled podle oborů",
    description: "Kolik se skutečně vydělává ve Švýcarsku? Přehled hrubých i čistých platů podle profesí, srovnání s Českem a co vám zůstane po odečtení nákladů na život.",
    date: "2026-02-15",
    readingTime: "7 min čtení",
    tags: ["Platy", "Švýcarsko", "Finance"],
    content: `
<p>Švýcarsko patří mezi země s nejvyššími platy na světě. Ale jak to vypadá v praxi? Kolik si vydělá elektrikář, kuchař nebo IT specialista? A kolik z výplaty skutečně zůstane po odečtení daní a nákladů na život? V tomto článku najdete kompletní přehled platů ve Švýcarsku pro rok 2026, rozdělený podle oborů.</p>

<h2>Průměrný plat ve Švýcarsku 2026</h2>
<p>Průměrný hrubý plat ve Švýcarsku činí přibližně <strong>6 700 CHF měsíčně</strong> (cca 175 000 Kč). Medián je o něco nižší — kolem 6 200 CHF. To je zhruba <strong>čtyřnásobek</strong> průměrné české mzdy. Platy se ale výrazně liší podle kantonu, oboru i zkušeností.</p>

<h2>Přehled platů podle profesí (hrubý měsíční plat)</h2>

<table>
<thead>
<tr><th>Profese</th><th>Hrubý plat (CHF/měsíc)</th><th>V přepočtu (Kč)</th></tr>
</thead>
<tbody>
<tr><td>Elektrikář</td><td>5 400 – 6 800</td><td>140 000 – 177 000</td></tr>
<tr><td>Kuchař</td><td>4 200 – 5 500</td><td>109 000 – 143 000</td></tr>
<tr><td>Stavební dělník</td><td>5 000 – 6 200</td><td>130 000 – 161 000</td></tr>
<tr><td>Zdravotní sestra</td><td>5 800 – 7 200</td><td>151 000 – 187 000</td></tr>
<tr><td>IT specialista</td><td>7 500 – 11 000</td><td>195 000 – 286 000</td></tr>
<tr><td>Účetní</td><td>6 000 – 8 500</td><td>156 000 – 221 000</td></tr>
<tr><td>Řidič (kamion/dodávka)</td><td>4 800 – 6 000</td><td>125 000 – 156 000</td></tr>
<tr><td>Logistika / skladník</td><td>4 500 – 5 800</td><td>117 000 – 151 000</td></tr>
</tbody>
</table>

<div class="info-box">
<strong>Tip:</strong> Platy v kantonu Zürich a Ženeva jsou typicky o 10–20 % vyšší než v ostatních regionech. Naopak v Ticinu (italská část) jsou platy nejnižší.
</div>

<h2>Hrubý vs. čistý plat — co vám zůstane?</h2>
<p>Ve Švýcarsku se z hrubého platu odvádí:</p>
<ul>
<li><strong>AHV/IV/EO</strong> (důchodové a invalidní pojištění): 5,3 %</li>
<li><strong>Nezaměstnanecké pojištění (ALV)</strong>: 1,1 %</li>
<li><strong>Penzijní fond (BVG)</strong>: 5–8 % (podle věku)</li>
<li><strong>Úrazové pojištění (NBU)</strong>: cca 1–2 %</li>
<li><strong>Quellensteuer</strong> (srážková daň pro cizince): 5–15 % podle kantonu a příjmu</li>
</ul>
<p>Celkově odvedete zhruba <strong>20–30 % z hrubého platu</strong>. Příklad: při hrubém platu 6 000 CHF vám čistý zůstane přibližně <strong>4 500–4 800 CHF</strong>.</p>

<div class="info-box">
<strong>Pozor:</strong> Zdravotní pojištění (Krankenkasse) si ve Švýcarsku platíte sami — stojí 300–450 CHF měsíčně a není součástí odvodů z výplaty.
</div>

<h2>Srovnání s Českou republikou</h2>

<table>
<thead>
<tr><th>Ukazatel</th><th>Česko</th><th>Švýcarsko</th></tr>
</thead>
<tbody>
<tr><td>Průměrný hrubý plat</td><td>45 000 Kč</td><td>175 000 Kč (6 700 CHF)</td></tr>
<tr><td>Medián čistého platu</td><td>34 000 Kč</td><td>125 000 Kč (4 800 CHF)</td></tr>
<tr><td>Nájemné (2+1, město)</td><td>15 000 Kč</td><td>39 000 Kč (1 500 CHF)</td></tr>
<tr><td>Nákup potravin (měsíc)</td><td>5 000 Kč</td><td>15 600 Kč (600 CHF)</td></tr>
</tbody>
</table>

<p>I po odečtení vyšších nákladů na život vám ve Švýcarsku zůstane výrazně více. Typický český pracovník ve Švýcarsku ušetří <strong>2–3× více</strong> než doma, zvlášť pokud sdílí bydlení nebo bydlí v levnějším kantonu.</p>

<h2>Náklady na život ve Švýcarsku</h2>
<p>Největší položky v měsíčním rozpočtu:</p>
<ul>
<li><strong>Nájemné:</strong> 1 200–2 000 CHF (malý byt ve městě)</li>
<li><strong>Zdravotní pojištění:</strong> 300–450 CHF</li>
<li><strong>Potraviny:</strong> 400–700 CHF</li>
<li><strong>Doprava:</strong> 80–200 CHF (Halbtax karta doporučena)</li>
<li><strong>Telefon + internet:</strong> 80–120 CHF</li>
</ul>
<p>Celkové měsíční náklady pro jednu osobu se pohybují kolem <strong>2 500–3 500 CHF</strong>. Pokud vyděláváte 5 500 CHF čistého, můžete reálně ušetřit 2 000–3 000 CHF měsíčně.</p>

<h2>Jak najít nejlépe placenou pozici?</h2>
<p>Klíčem je oslovit správné firmy a agentury přímo. Švýcarský trh práce je hodně o osobních kontaktech a přímém oslovení — nestačí jen odpovídat na inzeráty na portálech.</p>

<div class="info-box">
<strong>Woker vám pomůže:</strong> V naší databázi najdete <strong>1 007 kontaktů</strong> na švýcarské firmy a personální agentury. AI vám napíše životopis, motivační dopis i email v němčině. Začněte hledat práci chytřeji — <a href="/login">vyzkoušejte Woker</a>.
</div>
`
  },
  {
    slug: "pracovni-povoleni-svycarsko",
    title: "Jak získat pracovní povolení ve Švýcarsku — průvodce 2026",
    description: "Kompletní průvodce pracovními povoleními ve Švýcarsku: typy L, B, C, G, postup krok za krokem, potřebné dokumenty a časový harmonogram.",
    date: "2026-02-28",
    readingTime: "8 min čtení",
    tags: ["Povolení", "Švýcarsko", "Legislativa"],
    content: `
<p>Chcete pracovat ve Švýcarsku? Pak potřebujete pracovní povolení. Pro občany EU (a tedy i Česka) je proces jednodušší díky bilaterálním dohodám, ale stále má svá pravidla. Tento průvodce vám vysvětlí vše, co potřebujete vědět o typech povolení, postupu a dokumentech pro rok 2026.</p>

<h2>Typy pracovních povolení ve Švýcarsku</h2>

<h3>Povolení L — krátkodobý pobyt</h3>
<ul>
<li><strong>Pro koho:</strong> pracovní smlouva kratší než 12 měsíců</li>
<li><strong>Platnost:</strong> na dobu trvání smlouvy (max. 364 dní)</li>
<li><strong>Prodloužení:</strong> možné, pokud se smlouva prodlouží</li>
<li><strong>Vhodné pro:</strong> sezónní práce, stáže, krátkodobé projekty</li>
</ul>

<h3>Povolení B — dlouhodobý pobyt</h3>
<ul>
<li><strong>Pro koho:</strong> pracovní smlouva na 12 měsíců a více (nebo na dobu neurčitou)</li>
<li><strong>Platnost:</strong> 5 let (automaticky prodloužitelné)</li>
<li><strong>Výhody:</strong> můžete volně měnit zaměstnavatele i kanton</li>
<li><strong>Nejčastější typ:</strong> většina Čechů ve Švýcarsku má právě povolení B</li>
</ul>

<h3>Povolení C — trvalý pobyt</h3>
<ul>
<li><strong>Pro koho:</strong> po 5–10 letech nepřetržitého pobytu ve Švýcarsku</li>
<li><strong>Platnost:</strong> neomezená</li>
<li><strong>Výhody:</strong> plná volnost pohybu, práce, podnikání</li>
<li><strong>Podmínka:</strong> občané EU typicky po 5 letech legálního pobytu</li>
</ul>

<h3>Povolení G — přeshraniční pracovník (Grenzgänger)</h3>
<ul>
<li><strong>Pro koho:</strong> bydlíte v sousední zemi a dojíždíte do Švýcarska za prací</li>
<li><strong>Podmínka:</strong> musíte se vracet domů alespoň 1× týdně</li>
<li><strong>Platnost:</strong> 5 let</li>
<li><strong>Relevantní pro:</strong> Čechy bydlící v Německu nebo Rakousku blízko hranic</li>
</ul>

<div class="info-box">
<strong>Důležité:</strong> Jako občan EU nepotřebujete pracovní víza. Stačí platný cestovní pas nebo občanský průkaz. Pracovní povolení vyřizuje zaměstnavatel po nástupu.
</div>

<h2>Občané EU vs. občané třetích zemí</h2>
<p>Jako <strong>občan České republiky</strong> (členský stát EU) máte výrazně jednodušší pozici:</p>
<ul>
<li>Volný přístup na švýcarský trh práce díky dohodě o volném pohybu osob</li>
<li>Žádné kvóty ani limity na počet povolení</li>
<li>Zaměstnavatel nemusí dokazovat, že nenašel švýcarského kandidáta</li>
<li>Můžete přicestovat a hledat práci až 3 měsíce bez povolení</li>
</ul>
<p>Pro občany <strong>třetích zemí</strong> (mimo EU/EFTA) je proces výrazně složitější — platí kvóty, zaměstnavatel musí dokázat, že pozici nemůže obsadit místním kandidátem, a proces trvá déle.</p>

<h2>Postup krok za krokem pro občany EU</h2>

<h3>Krok 1: Najděte zaměstnavatele</h3>
<p>Prvním krokem je získat pracovní nabídku nebo smlouvu od švýcarského zaměstnavatele. Můžete pracovat i přes personální agenturu (Temporärbüro) — to je ve Švýcarsku velmi běžné a legitimní cesta.</p>

<h3>Krok 2: Zaměstnavatel ohlásí vaše zaměstnání</h3>
<p>Zaměstnavatel nahlásí váš nástup na kantonální migrační úřad (Migrationsamt). Vy nemusíte dělat nic — vše zařídí firma.</p>

<h3>Krok 3: Registrace na obci (Gemeinde)</h3>
<p>Do 14 dnů po příjezdu se musíte zaregistrovat na obecním úřadě (Einwohnerkontrolle) v místě bydliště. Budete potřebovat:</p>
<ul>
<li>Platný pas nebo občanský průkaz</li>
<li>Pracovní smlouvu</li>
<li>Nájemní smlouvu</li>
<li>Biometrické fotografie (2 ks)</li>
</ul>

<h3>Krok 4: Obdržíte povolení</h3>
<p>Migrační úřad vám zašle povolení k pobytu (Ausländerausweis) poštou. Obvykle to trvá 2–4 týdny. Mezitím můžete pracovat — potvrzení o podané žádosti stačí.</p>

<h3>Krok 5: Zdravotní pojištění</h3>
<p>Do 3 měsíců po příjezdu se musíte povinně přihlásit ke švýcarskému zdravotnímu pojištění. Doporučujeme porovnat nabídky na portálech jako comparis.ch nebo priminfo.admin.ch.</p>

<h2>Potřebné dokumenty — checklist</h2>
<ul>
<li>Platný cestovní pas nebo občanský průkaz</li>
<li>Biometrické fotografie (2 ks)</li>
<li>Pracovní smlouva (Arbeitsvertrag)</li>
<li>Nájemní smlouva (Mietvertrag)</li>
<li>Výpis z rejstříku trestů (někdy požadováno zaměstnavatelem)</li>
<li>Doklady o kvalifikaci (diplomy, certifikáty) — přeložené do němčiny/francouzštiny</li>
<li>Formulář pro registraci na Gemeinde (obdržíte na místě)</li>
</ul>

<h2>Časový harmonogram</h2>

<table>
<thead>
<tr><th>Krok</th><th>Časový rámec</th></tr>
</thead>
<tbody>
<tr><td>Hledání práce</td><td>2–8 týdnů (záleží na oboru)</td></tr>
<tr><td>Podpis smlouvy</td><td>1–2 týdny</td></tr>
<tr><td>Přestěhování</td><td>1–2 týdny</td></tr>
<tr><td>Registrace na obci</td><td>Do 14 dnů po příjezdu</td></tr>
<tr><td>Obdržení povolení</td><td>2–4 týdny po registraci</td></tr>
<tr><td>Zdravotní pojištění</td><td>Do 3 měsíců po příjezdu</td></tr>
</tbody>
</table>

<div class="info-box">
<strong>Tip:</strong> Celý proces od nalezení práce po obdržení povolení typicky trvá <strong>6–12 týdnů</strong>. Pokud jedete přes agenturu, může to být ještě rychlejší — agentura často zařídí vše za vás.
</div>

<h2>Jak začít hledat práci ve Švýcarsku?</h2>
<p>Nejrychlejší cesta je oslovit přímo švýcarské firmy a personální agentury. Klasické portály jako jobs.ch jsou přeplněné konkurencí — přímé oslovení má mnohem vyšší úspěšnost.</p>

<div class="info-box">
<strong>Woker vám to usnadní:</strong> Máme databázi <strong>1 007 kontaktů</strong> na švýcarské zaměstnavatele a agentury. AI vám pomůže napsat životopis, motivační dopis i oslovení v němčině — vše přizpůsobené švýcarskému trhu. <a href="/login">Začněte s Wokerem</a> a mějte povolení B v kapse do pár týdnů.
</div>
`
  },
  {
    slug: "prace-bez-nemciny",
    title: "Práce ve Švýcarsku bez němčiny — kde a jak to jde",
    description: "Kde ve Švýcarsku najdete práci bez znalosti němčiny? Přehled frankofonních regionů, anglicky mluvících pozic a oborů, kde jazyk není bariéra.",
    date: "2026-03-05",
    readingTime: "6 min čtení",
    tags: ["Jazyky", "Švýcarsko", "Tipy"],
    content: `
<p>Němčina je nejrozšířenějším jazykem ve Švýcarsku — mluví jí přes 60 % obyvatel. Ale Švýcarsko je vícejazyčná země a existuje řada regionů a oborů, kde se uplatníte i bez znalosti němčiny. Pojďme se podívat na vaše možnosti.</p>

<h2>Jazyková mapa Švýcarska</h2>
<p>Švýcarsko má <strong>4 úřední jazyky</strong>:</p>
<ul>
<li><strong>Němčina</strong> (Deutsch / Schweizerdeutsch): 63 % — Zürich, Bern, Basilej, Lucern, St. Gallen</li>
<li><strong>Francouzština</strong> (Français): 23 % — Ženeva, Lausanne, Neuchâtel, Fribourg</li>
<li><strong>Italština</strong> (Italiano): 8 % — Ticino, jižní Graubünden</li>
<li><strong>Rétorománština</strong>: méně než 1 % — části Graubündenu</li>
</ul>
<p>Pro Čechy bez němčiny jsou nejzajímavější <strong>frankofonní kantony</strong> (Romandie) a města s vysokým podílem mezinárodních firem.</p>

<h2>Kde pracovat bez němčiny?</h2>

<h3>Frankofonní Švýcarsko (Romandie)</h3>
<p>Ve francouzsky mluvící části Švýcarska němčinu nepotřebujete. Hlavní města a regiony:</p>
<ul>
<li><strong>Ženeva (Genève)</strong> — mezinárodní hub, OSN, WHO, sídla nadnárodních firem. Velmi kosmopolitní, angličtina běžná.</li>
<li><strong>Lausanne</strong> — univerzitní město, sídlo Mezinárodního olympijského výboru, technologické firmy.</li>
<li><strong>Neuchâtel</strong> — hodinářský průmysl, výroba, menší město s nižšími náklady.</li>
<li><strong>Fribourg</strong> — dvojjazyčné město (FR/DE), průmysl i služby.</li>
<li><strong>Sion, Montreux, Yverdon</strong> — menší města s pracovními příležitostmi v turismu a průmyslu.</li>
</ul>

<div class="info-box">
<strong>Výhoda:</strong> Francouzština je pro Čechy často jednodušší na naučení než švýcarská němčina (Schweizerdeutsch), která se výrazně liší od standardní němčiny.
</div>

<h3>Mezinárodní firmy (angličtina stačí)</h3>
<p>Ve velkých městech sídlí tisíce mezinárodních firem, kde je pracovním jazykem angličtina:</p>
<ul>
<li><strong>Zürich</strong> — Google, UBS, Credit Suisse, Swiss Re, desítky tech startupů</li>
<li><strong>Ženeva</strong> — OSN, CERN, Procter &amp; Gamble, bankovní sektor</li>
<li><strong>Basilej (Basel)</strong> — Novartis, Roche, farmaceutický průmysl</li>
<li><strong>Zug</strong> — kryptoměny, fintech, mezinárodní holdingové společnosti</li>
</ul>
<p>V těchto firmách je angličtina na denním pořádku a znalost němčiny je „nice to have", nikoliv podmínka.</p>

<h3>Italské Švýcarsko (Ticino)</h3>
<p>Kanton Ticino mluví italsky. Platy jsou sice o 15–20 % nižší než v německé části, ale náklady na život jsou také nižší. Ticino je zajímavé pro:</p>
<ul>
<li>Gastronomii a hotelnictví</li>
<li>Stavebnictví</li>
<li>Výrobu a logistiku</li>
</ul>

<h2>Obory, kde jazyk není hlavní bariéra</h2>
<p>V některých profesích je důležitější vaše odbornost než jazykové znalosti:</p>
<ul>
<li><strong>IT a software development</strong> — většina týmů komunikuje anglicky</li>
<li><strong>Stavebnictví</strong> — na stavbách se často mluví jazyky pracovníků (srbština, portugalština, polština...)</li>
<li><strong>Skladová logistika</strong> — práce s minimem verbální komunikace</li>
<li><strong>Kuchyně / pomocné práce v gastronomii</strong> — komunikace je omezená, naučíte se za pochod</li>
<li><strong>Úklid a facility management</strong> — jednoduché instrukce</li>
<li><strong>Výroba a montáž</strong> — práce na lince, základní pokyny</li>
<li><strong>Řemesla (elektrikář, instalatér, malíř)</strong> — kvalita práce mluví za vás, jazyk přijde</li>
</ul>

<div class="info-box">
<strong>Realita:</strong> I v oborech, kde jazyk „není nutný", vám základy němčiny výrazně pomohou — při jednání s šéfem, kolegama, na úřadech. Investice do jazykového kurzu se vždy vyplatí.
</div>

<h2>Tipy pro start bez němčiny</h2>

<h3>1. Začněte přes agenturu</h3>
<p>Personální agentury (Temporärbüros) jsou zvyklé na zahraniční pracovníky. Mnoho z nich má česky nebo anglicky mluvící konzultanty a pomohou vám se vším — od povolení po první výplatu.</p>

<h3>2. Naučte se základní fráze</h3>
<p>I 50 německých frází vám otevře dveře. Základní pozdravy, čísla, „Ich verstehe nicht" (Nerozumím) a „Können Sie langsamer sprechen?" (Můžete mluvit pomaleji?) — to stačí pro začátek.</p>

<h3>3. Využijte bezplatné jazykové kurzy</h3>
<p>Mnoho kantonů nabízí bezplatné nebo dotované jazykové kurzy pro nové přistěhovalce. Zeptejte se na Gemeinde po příjezdu.</p>

<h3>4. Zaměřte se na správný region</h3>
<p>Pokud umíte alespoň trochu francouzsky, Romandie je logická volba. Pokud jen anglicky, zaměřte se na mezinárodní firmy v Zürichu, Ženevě nebo Basileji.</p>

<h3>5. Nebojte se začít na nižší pozici</h3>
<p>Mnoho Čechů začne ve Švýcarsku na pozici pod svou kvalifikací, aby získali místní zkušenosti a jazyk. Po roce se posouvají výš — a i ta „nižší" švýcarská pozice má plat srovnatelný s manažerskou pozicí v Česku.</p>

<h2>Začněte hledat práci ještě dnes</h2>
<p>Neznalost němčiny není důvod čekat. Tisíce Čechů pracují ve Švýcarsku úspěšně i bez perfektní němčiny. Klíčem je oslovit správné firmy ve správných regionech.</p>

<div class="info-box">
<strong>Woker vám pomůže:</strong> Naše databáze obsahuje <strong>1 007 kontaktů</strong> na firmy a agentury po celém Švýcarsku — včetně frankofonních regionů a mezinárodních firem. AI vám připraví životopis, motivační dopis i email v jazyce, který potřebujete. <a href="/login">Vyzkoušejte Woker</a> a začněte hledat práci ve Švýcarsku ještě dnes.
</div>
`
  }
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(a => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogArticles.map(a => a.slug);
}
