import type { WookyFieldMeta } from './types'

// Vsechna pole, ktera Wooky umi pomoct vyplnit/upravit.
// Poradi = poradi v field pickeru (groupy podle sekce).
export const WOOKY_FIELDS: WookyFieldMeta[] = [
  // ===== Osobni udaje =====
  {
    key: 'full_name',
    label: 'Jméno a příjmení',
    icon: '👤',
    section: 'osobni-udaje',
    kind: 'simple',
    prompt: 'Začneme jménem — jak ti říkat?',
    example: 'Václav Kočka',
    valuePitch: 'Objeví se na tvém CV, v každém motivačním dopise a v podpisu Smart Apply e-mailů. Nejdůležitější pole celého profilu.',
  },
  {
    key: 'telefon',
    label: 'Telefon',
    icon: '📞',
    section: 'osobni-udaje',
    kind: 'simple',
    prompt: 'Telefonní číslo, na kterém tě může zaměstnavatel zastihnout.',
    example: '+41 79 123 45 67',
    valuePitch: 'Kontakt na CV. Použije se i v žádostech o bydlení a v Smart Apply e-mailech.',
  },
  {
    key: 'email',
    label: 'Kontaktní e-mail',
    icon: '✉️',
    section: 'osobni-udaje',
    kind: 'simple',
    prompt: 'E-mail, který uvedeš na CV (může se lišit od přihlašovacího).',
    example: 'jan.novak@example.com',
    valuePitch: 'Bude na CV jako kontakt. Přihlašovací e-mail (do Wokeru) se tím nemění.',
  },
  {
    key: 'nationality',
    label: 'Národnost',
    icon: '🌍',
    section: 'osobni-udaje',
    kind: 'simple',
    prompt: 'Národnost. Důležitá pro povolení k práci ve Švýcarsku.',
    example: 'Česká',
    valuePitch: 'Zaměstnavatelé to chtějí vědět kvůli povolení k práci. Objeví se v motivačních dopisech.',
  },
  {
    key: 'adresa',
    label: 'Adresa',
    icon: '🏠',
    section: 'osobni-udaje',
    kind: 'simple',
    prompt: 'Aktuální adresa — kde teď bydlíš (CH nebo domov).',
    example: 'Bahnhofstrasse 12, 8001 Curych',
    valuePitch: 'Bude na CV a v žádostech o bydlení. Stačí město a kanton, nemusíš dávat přesnou ulici.',
  },
  {
    key: 'ridicky_prukaz',
    label: 'Řidičský průkaz',
    icon: '🚗',
    section: 'osobni-udaje',
    kind: 'simple',
    prompt: 'Jaké skupiny máš + zda máš vlastní auto?',
    example: 'B, vlastní auto',
    valuePitch: 'Velké plus pro logistiku, stavbu, péči. Objeví se v CV i motivačních dopisech.',
  },

  // ===== Kariera =====
  {
    key: 'obor',
    label: 'Obor',
    icon: '🏭',
    section: 'kariera',
    kind: 'expand',
    prompt: 'V jakém oboru pracuješ nebo chceš pracovat?',
    example: 'Logistika a sklad',
    valuePitch: 'Pomůže nám hledat ti relevantní nabídky. Použijeme to i v záhlaví CV.',
    expansionInstruction: 'Krátký název oboru pro CV (1-4 slova, profesionálně). Žádné fantazírování, jen normalizuj uživatelův vstup do švýcarského standardu.',
  },
  {
    key: 'pozice',
    label: 'Cílová pozice',
    icon: '🎯',
    section: 'kariera',
    kind: 'simple',
    prompt: 'Na jakou pozici se hlásíš nebo jaká tě baví?',
    example: 'Skladník / Logistik',
    valuePitch: 'Bude jako "obor" v záhlaví CV. Podle ní ti hledáme nabídky.',
  },
  {
    key: 'zkusenosti',
    label: 'Pracovní zkušenosti',
    icon: '💼',
    section: 'kariera',
    kind: 'expand',
    prompt: 'Stačí mi to říct rámcově — kde, kdy, co. Já to pak rozšířím do profesionálního jazyka.',
    example: '3 roky logistika ve Zlíně, řízení VZV. Pak rok montáž ve fabrice.',
    valuePitch: 'Tohle je srdce tvého CV. Když mi dáš základ, rozšířím to do bullet pointů, které čekají švýcarské HR. Použije se v každém CV a motivačním dopise.',
    expansionInstruction: `Rozšíř uživatelův vstup do 3-5 profesionálních bullet pointů v češtině pro švýcarské CV.
Použij silná akční slovesa (zajišťoval, koordinoval, obsluhoval, řídil).
KRITICKY DULEŽITÉ: Nikdy nepřidávej fakta která uživatel nezmínil. Pokud řekl "řízení VZV", nepřidávej "skupina B" pokud to nezmínil. Pokud řekl "3 roky logistika", neuváděj konkrétní zaměstnavatele.
Jen profesionálně přeformuluj + doplň běžné kontextové detaily (lokace, povaha práce) které logicky plynou z toho co řekl.`,
  },
  {
    key: 'vzdelani',
    label: 'Vzdělání',
    icon: '🎓',
    section: 'kariera',
    kind: 'expand',
    prompt: 'Nejvyšší dosažené vzdělání + obor. Stačí stručně, doplním.',
    example: 'SOU dopravní, opravář motorových vozidel, 2018',
    valuePitch: 'Objeví se v sekci Vzdělání tvého CV. Důležité pro pozice kde se vyžaduje formální kvalifikace.',
    expansionInstruction: `Rozšíř vzdělání uživatele do CV-friendly formátu pro švýcarský trh. Formát: "Stupeň + obor, instituce (volitelně město), rok ukončení".
Nikdy nedoplňuj jméno školy ani specifický rok pokud uživatel neuvedl. Jen normalizuj jeho vstup do profesionální podoby.`,
  },
  {
    key: 'dovednosti',
    label: 'Dovednosti',
    icon: '⚡',
    section: 'kariera',
    kind: 'expand',
    prompt: 'Co umíš? Stroje, nástroje, jazyky programů, soft skills...',
    example: 'VZV, SAP, MS Office, řidičák B, němčina',
    valuePitch: 'Zaměstnavatelé filtrují podle dovedností. Bude v CV jako seznam i v motivačních dopisech.',
    expansionInstruction: `Rozšíř seznam dovedností do CV-friendly podoby pro švýcarský trh.
Mix hard skills + soft skills + jazyky + certifikáty.
Žádné vymýšlení specifik (verze softwaru, čísla certifikátů, úrovně B2/C1 pokud user neuvedl).
Pokud user napsal "VZV", ponech "obsluha vysokozdvižného vozíku". Pokud "MS Office", expanduj na "MS Office (Word, Excel, Outlook)" — bezpečná expanze.
Vrať jako seznam oddělený čárkami.`,
  },
  {
    key: 'nemcina_uroven',
    label: 'Úroveň němčiny',
    icon: '🇨🇭',
    section: 'kariera',
    kind: 'simple',
    prompt: 'Jak na tom jsi s němčinou?',
    example: 'B1',
    valuePitch: 'Kritické pro Švýcarsko. Použije se v CV a my podle toho vybíráme nabídky.',
  },
  {
    key: 'dalsi_jazyky',
    label: 'Další jazyky',
    icon: '🗣️',
    section: 'kariera',
    kind: 'simple',
    prompt: 'Další jazyky a jejich úroveň.',
    example: 'Angličtina B2, polština rodný',
    valuePitch: 'Plus pro mnoho pozic — hotely, cestovní ruch, mezinárodní firmy.',
  },

  // ===== Cil =====
  {
    key: 'preferovany_kanton',
    label: 'Preferovaný kanton',
    icon: '📍',
    section: 'cil',
    kind: 'simple',
    prompt: 'Ve kterém kantonu chceš pracovat?',
    example: 'Curych',
    valuePitch: 'Podle toho ti hledáme nabídky a bydlení.',
  },
  {
    key: 'income_expected',
    label: 'Očekávaný plat',
    icon: '💰',
    section: 'cil',
    kind: 'simple',
    prompt: 'Kolik CHF si chceš vydělat měsíčně (brutto)?',
    example: '5000',
    valuePitch: 'Použijeme jen interně k filtrování nabídek. Nikam se neposílá.',
  },
  {
    key: 'work_permit_status',
    label: 'Pracovní povolení',
    icon: '🪪',
    section: 'cil',
    kind: 'simple',
    prompt: 'Jaké máš povolení nebo na jakém pracuješ?',
    example: 'EU/EFTA — bez omezení',
    valuePitch: 'Zaměstnavatelé to chtějí vědět hned. Objeví se v motivačních dopisech.',
  },
  {
    key: 'employer_current',
    label: 'Současný zaměstnavatel',
    icon: '🏢',
    section: 'cil',
    kind: 'simple',
    prompt: 'Kde teď pracuješ (pokud někde)?',
    example: 'DHL Logistics, Curych',
    valuePitch: 'Volitelné. Použijeme pro lepší formulaci v motivačním dopise.',
  },
]

export function wookyField(key: string): WookyFieldMeta | undefined {
  return WOOKY_FIELDS.find((f) => f.key === key)
}

export const WOOKY_FIELDS_BY_SECTION = {
  'osobni-udaje': WOOKY_FIELDS.filter((f) => f.section === 'osobni-udaje'),
  'kariera': WOOKY_FIELDS.filter((f) => f.section === 'kariera'),
  'cil': WOOKY_FIELDS.filter((f) => f.section === 'cil'),
}
