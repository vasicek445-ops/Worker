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
