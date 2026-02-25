import { Translation, Locale } from "../types";
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

const translations: Record<Locale, Translation> = { cs, en, pl, uk, ro, it, pt, es, el, hu };
export default translations;
export function getTranslation(locale: Locale): Translation { return translations[locale] || translations.en; }
