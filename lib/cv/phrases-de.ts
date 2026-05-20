// CV phrase library: 5 oborů × ~15 frází per obor = 75 real-world worker phrases.
// Pro každou frázi: český překlad (porozumění) + německá fráze (CV).
// Mix task / achievement (s metrikami) / soft-skill ~ 60/25/15.

export interface Phrase {
  id: string
  cs: string
  de: string
  category: 'task' | 'achievement' | 'soft-skill'
}

export const PHRASES_DE: Record<string, Phrase[]> = {
  stavebnictvi: [
    { id: 's1', cs: 'Hrubé stavby rodinných domů', de: 'Rohbau von Einfamilienhäusern', category: 'task' },
    { id: 's2', cs: 'Obsluha věžového jeřábu, certifikát', de: 'Bedienung Turmdrehkran, mit Zertifikat', category: 'task' },
    { id: 's3', cs: 'Bednění a betonáž základových desek', de: 'Schalungs- und Betonarbeiten an Bodenplatten', category: 'task' },
    { id: 's4', cs: 'Zdění z cihel Ytong / Porotherm', de: 'Mauerarbeiten mit Ytong / Porotherm', category: 'task' },
    { id: 's5', cs: 'Sádrokartonové konstrukce a zateplení', de: 'Trockenbau und Wärmedämmung (Knauf, Rigips)', category: 'task' },
    { id: 's6', cs: 'Sváření MIG/MAG a TIG, certifikát', de: 'Schweissen MIG/MAG und WIG, mit Zertifikat', category: 'task' },
    { id: 's7', cs: 'Práce ve výškách, certifikát BOZP', de: 'Höhenarbeit mit Sicherungsschein (SUVA)', category: 'task' },
    { id: 's8', cs: 'Čtení technických výkresů', de: 'Lesen technischer Bau- und Konstruktionspläne', category: 'task' },
    { id: 's9', cs: 'Pokládka dlažby a obkladů', de: 'Verlegen von Bodenfliesen und Wandplatten', category: 'task' },
    { id: 's10', cs: 'Obsluha minibagru a vibračního pěchu', de: 'Bedienung Minibagger und Vibrationsstampfer', category: 'task' },
    { id: 's11', cs: 'Dokončení 4 rodinných domů v termínu', de: '4 Einfamilienhäuser termingerecht fertiggestellt', category: 'achievement' },
    { id: 's12', cs: 'Vedení party 3-5 dělníků', de: 'Leitung einer Kolonne von 3-5 Bauarbeitern', category: 'achievement' },
    { id: 's13', cs: 'Bez pracovního úrazu po 5 let', de: 'Unfallfreies Arbeiten über 5 Jahre', category: 'achievement' },
    { id: 's14', cs: 'Spolehlivost a přesnost při dodržování termínů', de: 'Zuverlässigkeit und Termintreue', category: 'soft-skill' },
    { id: 's15', cs: 'Týmová spolupráce na rozsáhlých stavbách', de: 'Teamfähigkeit auf Grossbaustellen', category: 'soft-skill' },
  ],

  gastronomie: [
    { id: 'g1', cs: 'Příprava studené i teplé kuchyně', de: 'Zubereitung kalter und warmer Küche', category: 'task' },
    { id: 'g2', cs: 'Mise en place pro až 150 pokrytí/den', de: 'Mise en place für bis zu 150 Couverts pro Tag', category: 'task' },
    { id: 'g3', cs: 'Dodržování HACCP standardů', de: 'Einhaltung der HACCP-Hygienevorschriften', category: 'task' },
    { id: 'g4', cs: 'Příprava à la carte i banketových menu', de: 'Zubereitung von à la carte und Bankettmenüs', category: 'task' },
    { id: 'g5', cs: 'Práce na grill / sauté / garde manger postu', de: 'Arbeit am Grill-, Sauté- und Garde Manger-Posten', category: 'task' },
    { id: 'g6', cs: 'Pečení a cukrářské práce', de: 'Backwaren- und Patisserie-Zubereitung', category: 'task' },
    { id: 'g7', cs: 'Obsluha kávovaru a baru', de: 'Bedienung der Kaffeemaschine und Barservice', category: 'task' },
    { id: 'g8', cs: 'Servis hostů, znalost menu', de: 'Service am Gast mit Menükenntnis', category: 'task' },
    { id: 'g9', cs: 'Skladové hospodářství a inventury', de: 'Lagerbewirtschaftung und Inventur', category: 'task' },
    { id: 'g10', cs: 'Práce s kasovním systémem (Lightspeed, Gastrofix)', de: 'Arbeit mit Kassensystemen (Lightspeed, Gastrofix)', category: 'task' },
    { id: 'g11', cs: 'Snížení food waste o 20 %', de: 'Reduktion Food Waste um 20 %', category: 'achievement' },
    { id: 'g12', cs: 'Vedení kuchyně během odpolední směny (chef de partie)', de: 'Leitung der Küche während der Spätschicht (Chef de Partie)', category: 'achievement' },
    { id: 'g13', cs: 'Zaškolení 3 nových pomocných sil', de: 'Einarbeitung von 3 neuen Hilfskräften', category: 'achievement' },
    { id: 'g14', cs: 'Práce pod tlakem, rychlé tempo', de: 'Belastbarkeit und schnelles Arbeitstempo', category: 'soft-skill' },
    { id: 'g15', cs: 'Čistota a smysl pro detail', de: 'Sauberkeit und Detailbewusstsein', category: 'soft-skill' },
  ],

  logistika: [
    { id: 'l1', cs: 'Obsluha vysokozdvižného vozíku (Stapler)', de: 'Bedienung Gabelstapler (Stapler) mit Fahrausweis', category: 'task' },
    { id: 'l2', cs: 'Příjem a expedice až 80 palet/den', de: 'Wareneingang und Versand bis zu 80 Paletten/Tag', category: 'task' },
    { id: 'l3', cs: 'Komisionování pomocí scanneru (Pick by Scan)', de: 'Kommissionierung mit Handscanner (Pick by Scan)', category: 'task' },
    { id: 'l4', cs: 'Práce s ERP systémem SAP / Navision', de: 'Arbeit mit ERP-Systemen SAP / Navision', category: 'task' },
    { id: 'l5', cs: 'Balení a štítkování zboží', de: 'Verpackung und Etikettierung der Ware', category: 'task' },
    { id: 'l6', cs: 'Kontrola kvality a množství při příjmu', de: 'Qualitäts- und Mengenkontrolle beim Wareneingang', category: 'task' },
    { id: 'l7', cs: 'Obsluha retraku a paletového vozíku', de: 'Bedienung Schubmaststapler und Hubwagen', category: 'task' },
    { id: 'l8', cs: 'Naskladnění a vyskladnění regálových systémů', de: 'Ein- und Auslagerung in Hochregallager', category: 'task' },
    { id: 'l9', cs: 'Vedení skladové evidence', de: 'Führen der Lagerbestandslisten', category: 'task' },
    { id: 'l10', cs: 'Práce ve směnách (2/3 směny, noční)', de: 'Schichtarbeit (2/3-Schicht, inkl. Nachtschicht)', category: 'task' },
    { id: 'l11', cs: 'Přesnost komisionování 99,5 %', de: 'Kommissionier-Genauigkeit von 99,5 %', category: 'achievement' },
    { id: 'l12', cs: 'Zkrácení doby expedice o 15 %', de: 'Verkürzung der Versandzeit um 15 %', category: 'achievement' },
    { id: 'l13', cs: 'Bez pracovního úrazu po 4 roky', de: 'Unfallfreies Arbeiten über 4 Jahre', category: 'achievement' },
    { id: 'l14', cs: 'Pečlivost a spolehlivost', de: 'Sorgfalt und Zuverlässigkeit', category: 'soft-skill' },
    { id: 'l15', cs: 'Fyzická odolnost a týmová práce', de: 'Körperliche Belastbarkeit und Teamfähigkeit', category: 'soft-skill' },
  ],

  uklid: [
    { id: 'u1', cs: 'Úklid kancelářských prostor a zasedaček', de: 'Reinigung von Büroräumen und Sitzungszimmern', category: 'task' },
    { id: 'u2', cs: 'Úklid hotelových pokojů (Housekeeping)', de: 'Housekeeping in Hotelzimmern', category: 'task' },
    { id: 'u3', cs: 'Úklid nemocnic dle hygienických norem', de: 'Spitalreinigung nach Hygienevorschriften', category: 'task' },
    { id: 'u4', cs: 'Strojní čištění podlah (Scheuersaugmaschine)', de: 'Maschinelle Bodenreinigung (Scheuersaugmaschine)', category: 'task' },
    { id: 'u5', cs: 'Mytí oken a fasád, certifikát výškové práce', de: 'Fenster- und Fassadenreinigung mit Höhenschein', category: 'task' },
    { id: 'u6', cs: 'Hloubkové čištění koberců a čalounění', de: 'Tiefenreinigung von Teppichen und Polstern', category: 'task' },
    { id: 'u7', cs: 'Údržba sanitárních zařízení', de: 'Reinigung und Pflege von Sanitäranlagen', category: 'task' },
    { id: 'u8', cs: 'Bezpečné nakládání s chemií (CHV-Schein)', de: 'Sicherer Umgang mit Reinigungschemikalien', category: 'task' },
    { id: 'u9', cs: 'Závěrečné úklidy po stavebních pracích (Bauendreinigung)', de: 'Bauendreinigung nach Bauarbeiten', category: 'task' },
    { id: 'u10', cs: 'Údržba zelených ploch a sněhový úklid', de: 'Grünpflege und Schneeräumung', category: 'task' },
    { id: 'u11', cs: 'Úklid 15 kanceláří denně samostatně', de: 'Eigenständige Reinigung von 15 Büros pro Tag', category: 'achievement' },
    { id: 'u12', cs: 'Spokojenost klientů: 4,8/5 v auditu', de: 'Kundenzufriedenheit von 4,8/5 im Audit', category: 'achievement' },
    { id: 'u13', cs: 'Žádné stížnosti za 3 roky', de: 'Keine Reklamationen über 3 Jahre', category: 'achievement' },
    { id: 'u14', cs: 'Spolehlivost a diskrétnost', de: 'Zuverlässigkeit und Diskretion', category: 'soft-skill' },
    { id: 'u15', cs: 'Smysl pro detail a samostatnost', de: 'Detailgenauigkeit und selbständiges Arbeiten', category: 'soft-skill' },
  ],

  zdravotnictvi: [
    { id: 'z1', cs: 'Pomoc s denními činnostmi (oblékání, hygiena, jídlo)', de: 'Unterstützung bei Aktivitäten des täglichen Lebens (ATL)', category: 'task' },
    { id: 'z2', cs: 'Polohování a mobilizace pacientů', de: 'Lagerung und Mobilisation von Patienten', category: 'task' },
    { id: 'z3', cs: 'Práce v domově seniorů (Alters- und Pflegeheim)', de: 'Tätigkeit im Alters- und Pflegeheim', category: 'task' },
    { id: 'z4', cs: 'Asistence ve Spitex (domácí péče)', de: 'Spitex-Assistenz in der häuslichen Pflege', category: 'task' },
    { id: 'z5', cs: 'Měření vitálních funkcí (TK, puls, teplota)', de: 'Messen von Vitalzeichen (Blutdruck, Puls, Temperatur)', category: 'task' },
    { id: 'z6', cs: 'Dokumentace péče v elektronickém systému', de: 'Pflegedokumentation im elektronischen System', category: 'task' },
    { id: 'z7', cs: 'Dodržování hygienických norem (Händedesinfektion)', de: 'Einhaltung der Hygienevorschriften (Händedesinfektion)', category: 'task' },
    { id: 'z8', cs: 'Podávání léků dle pokynů sestry', de: 'Medikamentenabgabe nach Anweisung der DiplPflege', category: 'task' },
    { id: 'z9', cs: 'Práce ve směnách včetně nočních a víkendů', de: 'Schichtarbeit inkl. Nacht- und Wochenenddienst', category: 'task' },
    { id: 'z10', cs: 'Doprovod pacientů na vyšetření', de: 'Begleitung der Patienten zu Untersuchungen', category: 'task' },
    { id: 'z11', cs: 'Péče o 12-15 klientů na směnu', de: 'Betreuung von 12-15 Klienten pro Schicht', category: 'achievement' },
    { id: 'z12', cs: 'Absolvovaný kurz Pflegehelfer SRK', de: 'Abgeschlossener Kurs Pflegehelfer/in SRK', category: 'achievement' },
    { id: 'z13', cs: 'Pozitivní zpětná vazba od rodin klientů', de: 'Positive Rückmeldungen von Angehörigen', category: 'achievement' },
    { id: 'z14', cs: 'Empatie a trpělivost', de: 'Empathie und Geduld', category: 'soft-skill' },
    { id: 'z15', cs: 'Psychická odolnost a diskrétnost', de: 'Psychische Belastbarkeit und Diskretion', category: 'soft-skill' },
  ],
}

// Mapování field → klíč v PHRASES_DE (matchuje FIELD_OPTIONS.fields)
export const FIELD_TO_PHRASE_KEY: Record<string, string> = {
  'Stavebnictví': 'stavebnictvi',
  'Gastronomie / Hotelnictví': 'gastronomie',
  'Logistika / Sklad': 'logistika',
  'Zdravotnictví': 'zdravotnictvi',
  'Úklid / Údržba': 'uklid',
}

export function getPhrasesForField(field?: string): Phrase[] {
  if (!field) return []
  const key = FIELD_TO_PHRASE_KEY[field]
  if (!key) return []
  return PHRASES_DE[key] || []
}
