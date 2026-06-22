// i18n.js — language state + UI chrome strings + taxonomy label helper.
export const LANGS = ['en', 'hi', 'ta'];
export const NATIVE = { en: 'English', hi: 'हिन्दी', ta: 'தமிழ்' };

const UI = {
  en: {
    brand: 'ALLEN Resource Hub', brandSub: 'The right official ALLEN resource, in seconds',
    metaTitle: 'ALLEN Resource Hub — Official Courses, Apps, Study Materials & Support',
    metaDesc: 'A curated, multilingual guide to important official ALLEN resources for courses, admissions, apps, study materials, scholarships, centres and support.',
    chooseLang: 'Choose your language', share: 'Share', searchPh: 'Search: JEE, NEET, app, fees, results, contact…',
    heroPrompt: 'What do you need help with today?',
    heroSub: 'Find the right official ALLEN resource for courses, admissions, apps, study material, scholarships, centres and support — in English, हिन्दी and தமிழ்.',
    guided: 'Help me decide', guidedSub: 'Answer a few quick questions',
    tasksHeading: 'Common things people look for',
    browseFeatured: 'Featured official resources', browseByExam: 'By exam', browseByUser: 'By who you are', browsePurpose: 'By what you want to do', channels: 'Official channels',
    results: 'resources', noResults: 'Nothing matches that yet', noResultsHint: 'Try a different word or clear the filters.', clear: 'Clear all', filters: 'Filters', verifiedOnly: 'Verified only', activeOnly: 'Active only', sort: 'Sort', sortRelevance: 'Best match', sortName: 'A–Z',
    forLabel: 'For', purposeLabel: 'Use', examLabel: 'Exam', modeLabel: 'Mode', regionLabel: 'Region', checked: 'Checked', session: 'Session',
    open: 'Open official page', openShort: 'Open', copy: 'Copy link', copied: 'Link copied!', save: 'Save', saved: 'Saved', report: 'Report issue', back: 'Back', home: 'Home',
    savedHeading: 'Saved resources', recently: 'Recently viewed', emptySaved: 'No saved resources yet. Tap “Save” on any card.',
    finderTitle: 'Find the right resource', finderStep: 'Step', finderOf: 'of', next: 'Next', finish: 'Show my resources', restart: 'Start over',
    q_who: 'Who are you?', q_class: 'Which class or stage?', q_goal: 'What is the goal?', q_mode: 'Preferred mode?', q_region: 'Where are you?', q_do: 'What do you want to do?',
    recoTitle: 'Here’s where to go', recoPrimary: 'Best place to start', recoAlt: 'Also useful', recoNone: 'No exact match — here are the closest official resources.',
    trustTitle: 'About verification', trustNote: 'This is a curated, regularly reviewed directory of important official ALLEN resources — not a complete index. Each link shows when it was last checked. “Verified” means the page opened on that date; some official social pages block automated checks and show “Official — not auto-verified”.',
    disclaimer: 'Independent, community-made guide. Every link points to ALLEN Career Institute’s own official websites and channels. “ALLEN” and related names are trademarks of ALLEN Career Institute; this page is not the official ALLEN site and is not affiliated with or endorsed by ALLEN.',
    reviewed: 'Catalogue last reviewed', loading: 'Loading resources…',
    badge: { verified: 'Verified', 'verified-legacy': 'Official · legacy page', 'verified-regional': 'Regional official', redirected: 'Official · redirects', 'registration-required': 'Registration required', 'temporarily-unavailable': 'Temporarily unavailable', historical: 'Historical', unverified: 'Official · not auto-verified', broken: 'Currently unavailable' },
    tasks: {
      'course-discovery': 'Choose a course', login: 'Student login', 'centre-location': 'Find a centre', 'app-download': 'Download the app',
      'study-material': 'Free study material', 'scholarship-registration': 'Scholarship tests', results: 'Check results', support: 'Contact support',
    },
    who: { student: 'Student', parent: 'Parent', teacher: 'Teacher / Counsellor', 'enrolled-student': 'Current ALLEN student', 'prospective-student': 'Thinking of joining' },
    cls: { '6-8': 'Class 6–8', '9-10': 'Class 9–10', '11': 'Class 11', '12': 'Class 12', dropper: 'Dropper', 'college-other': 'College / Other' },
    goal: { 'jee-main': 'JEE Main', 'jee-advanced': 'JEE Advanced', neet: 'NEET', foundation: 'Foundation', olympiad: 'Olympiad', board: 'Board prep', scholarship: 'Scholarship test', abroad: 'Study abroad', general: 'General enquiry' },
    mode: { classroom: 'Classroom', online: 'Online', either: 'Either' },
    doing: { 'course-discovery': 'Explore courses', admission: 'Apply / admission', login: 'Log in', 'app-download': 'Download app', 'study-material': 'Find study material', support: 'Contact support' },
  },
  hi: {
    brand: 'ALLEN रिसोर्स हब', brandSub: 'सही आधिकारिक ALLEN संसाधन, सेकंडों में',
    metaTitle: 'ALLEN रिसोर्स हब — आधिकारिक कोर्स, ऐप, अध्ययन सामग्री और सहायता',
    metaDesc: 'कोर्स, प्रवेश, ऐप, अध्ययन सामग्री, छात्रवृत्ति, केंद्र और सहायता के लिए महत्वपूर्ण आधिकारिक ALLEN संसाधनों की एक चुनी हुई बहुभाषी गाइड।',
    chooseLang: 'अपनी भाषा चुनें', share: 'साझा करें', searchPh: 'खोजें: JEE, NEET, ऐप, फीस, रिजल्ट, संपर्क…',
    heroPrompt: 'आज आपको किसमें मदद चाहिए?',
    heroSub: 'कोर्स, प्रवेश, ऐप, अध्ययन सामग्री, छात्रवृत्ति, केंद्र और सहायता के लिए सही आधिकारिक ALLEN संसाधन खोजें — English, हिन्दी और தமிழ் में।',
    guided: 'मुझे चुनने में मदद करें', guidedSub: 'कुछ आसान सवालों के जवाब दें',
    tasksHeading: 'लोग आमतौर पर क्या खोजते हैं',
    browseFeatured: 'चुनिंदा आधिकारिक संसाधन', browseByExam: 'परीक्षा अनुसार', browseByUser: 'आप कौन हैं', browsePurpose: 'आप क्या करना चाहते हैं', channels: 'आधिकारिक चैनल',
    results: 'संसाधन', noResults: 'अभी कुछ मेल नहीं खाया', noResultsHint: 'कोई दूसरा शब्द आज़माएँ या फ़िल्टर हटाएँ।', clear: 'सब हटाएँ', filters: 'फ़िल्टर', verifiedOnly: 'केवल सत्यापित', activeOnly: 'केवल सक्रिय', sort: 'क्रम', sortRelevance: 'सबसे मेल', sortName: 'अ–ज्ञ',
    forLabel: 'किसके लिए', purposeLabel: 'उपयोग', examLabel: 'परीक्षा', modeLabel: 'माध्यम', regionLabel: 'क्षेत्र', checked: 'जाँचा', session: 'सत्र',
    open: 'आधिकारिक पेज खोलें', openShort: 'खोलें', copy: 'लिंक कॉपी', copied: 'लिंक कॉपी हो गया!', save: 'सेव', saved: 'सेव किया', report: 'समस्या बताएँ', back: 'वापस', home: 'होम',
    savedHeading: 'सेव किए संसाधन', recently: 'हाल में देखे', emptySaved: 'अभी कोई सेव नहीं। किसी कार्ड पर “सेव” दबाएँ।',
    finderTitle: 'सही संसाधन खोजें', finderStep: 'चरण', finderOf: '/', next: 'आगे', finish: 'मेरे संसाधन दिखाएँ', restart: 'फिर से',
    q_who: 'आप कौन हैं?', q_class: 'कौन सी कक्षा या स्तर?', q_goal: 'लक्ष्य क्या है?', q_mode: 'पसंदीदा माध्यम?', q_region: 'आप कहाँ हैं?', q_do: 'आप क्या करना चाहते हैं?',
    recoTitle: 'यहाँ जाएँ', recoPrimary: 'शुरू करने की सबसे अच्छी जगह', recoAlt: 'यह भी उपयोगी', recoNone: 'सटीक मेल नहीं — ये सबसे करीबी आधिकारिक संसाधन हैं।',
    trustTitle: 'सत्यापन के बारे में', trustNote: 'यह महत्वपूर्ण आधिकारिक ALLEN संसाधनों की एक चुनी हुई, नियमित समीक्षित डायरेक्टरी है — पूरी सूची नहीं। हर लिंक दिखाता है कि उसे आख़िरी बार कब जाँचा गया। “सत्यापित” का मतलब उस तारीख को पेज खुला; कुछ आधिकारिक सोशल पेज स्वचालित जाँच रोकते हैं और “आधिकारिक — स्वतः सत्यापित नहीं” दिखाते हैं।',
    disclaimer: 'स्वतंत्र, समुदाय द्वारा बनी गाइड। हर लिंक ALLEN करियर इंस्टिट्यूट की अपनी आधिकारिक वेबसाइट और चैनलों पर जाता है। “ALLEN” व संबंधित नाम ALLEN करियर इंस्टिट्यूट के ट्रेडमार्क हैं; यह आधिकारिक ALLEN साइट नहीं है और ALLEN से संबद्ध/अनुमोदित नहीं है।',
    reviewed: 'कैटलॉग अंतिम समीक्षा', loading: 'संसाधन लोड हो रहे हैं…',
    badge: { verified: 'सत्यापित', 'verified-legacy': 'आधिकारिक · लीगेसी पेज', 'verified-regional': 'क्षेत्रीय आधिकारिक', redirected: 'आधिकारिक · रीडायरेक्ट', 'registration-required': 'पंजीकरण आवश्यक', 'temporarily-unavailable': 'अस्थायी रूप से अनुपलब्ध', historical: 'ऐतिहासिक', unverified: 'आधिकारिक · स्वतः सत्यापित नहीं', broken: 'फ़िलहाल अनुपलब्ध' },
    tasks: { 'course-discovery': 'कोर्स चुनें', login: 'छात्र लॉगिन', 'centre-location': 'केंद्र खोजें', 'app-download': 'ऐप डाउनलोड', 'study-material': 'मुफ़्त सामग्री', 'scholarship-registration': 'छात्रवृत्ति परीक्षा', results: 'रिजल्ट देखें', support: 'सहायता संपर्क' },
    who: { student: 'छात्र', parent: 'अभिभावक', teacher: 'शिक्षक / काउंसलर', 'enrolled-student': 'मौजूदा ALLEN छात्र', 'prospective-student': 'जुड़ने की सोच रहे' },
    cls: { '6-8': 'कक्षा 6–8', '9-10': 'कक्षा 9–10', '11': 'कक्षा 11', '12': 'कक्षा 12', dropper: 'ड्रॉपर', 'college-other': 'कॉलेज / अन्य' },
    goal: { 'jee-main': 'JEE Main', 'jee-advanced': 'JEE Advanced', neet: 'NEET', foundation: 'फाउंडेशन', olympiad: 'ओलंपियाड', board: 'बोर्ड तैयारी', scholarship: 'छात्रवृत्ति परीक्षा', abroad: 'विदेश में पढ़ाई', general: 'सामान्य पूछताछ' },
    mode: { classroom: 'क्लासरूम', online: 'ऑनलाइन', either: 'कोई भी' },
    doing: { 'course-discovery': 'कोर्स देखें', admission: 'आवेदन / प्रवेश', login: 'लॉगिन', 'app-download': 'ऐप डाउनलोड', 'study-material': 'अध्ययन सामग्री', support: 'सहायता संपर्क' },
  },
  ta: {
    brand: 'ALLEN ரிசோர்ஸ் ஹப்', brandSub: 'சரியான அதிகாரப்பூர்வ ALLEN வளம், நொடிகளில்',
    metaTitle: 'ALLEN ரிசோர்ஸ் ஹப் — அதிகாரப்பூர்வ பாடத்திட்டங்கள், ஆப்ஸ், படிப்புப் பொருட்கள் & ஆதரவு',
    metaDesc: 'பாடத்திட்டம், சேர்க்கை, ஆப்ஸ், படிப்புப் பொருட்கள், உதவித்தொகை, மையங்கள் மற்றும் ஆதரவுக்கான முக்கிய அதிகாரப்பூர்வ ALLEN வளங்களின் தேர்ந்தெடுத்த பன்மொழி வழிகாட்டி.',
    chooseLang: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', share: 'பகிர்', searchPh: 'தேடுங்கள்: JEE, NEET, ஆப், கட்டணம், முடிவு, தொடர்பு…',
    heroPrompt: 'இன்று உங்களுக்கு எதில் உதவி வேண்டும்?',
    heroSub: 'பாடத்திட்டம், சேர்க்கை, ஆப், படிப்புப் பொருட்கள், உதவித்தொகை, மையம், ஆதரவுக்கான சரியான அதிகாரப்பூர்வ ALLEN வளத்தைக் கண்டறியுங்கள் — English, हिन्दी மற்றும் தமிழில்.',
    guided: 'தேர்ந்தெடுக்க உதவுங்கள்', guidedSub: 'சில எளிய கேள்விகளுக்குப் பதில் சொல்லுங்கள்',
    tasksHeading: 'மக்கள் பொதுவாகத் தேடுபவை',
    browseFeatured: 'சிறப்பு அதிகாரப்பூர்வ வளங்கள்', browseByExam: 'தேர்வு வாரியாக', browseByUser: 'நீங்கள் யார்', browsePurpose: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்', channels: 'அதிகாரப்பூர்வ சேனல்கள்',
    results: 'வளங்கள்', noResults: 'இதற்கு எதுவும் பொருந்தவில்லை', noResultsHint: 'வேறு வார்த்தை முயற்சிக்கவும் அல்லது வடிகட்டிகளை அழிக்கவும்.', clear: 'அனைத்தையும் அழி', filters: 'வடிகட்டிகள்', verifiedOnly: 'சரிபார்க்கப்பட்டவை மட்டும்', activeOnly: 'செயலில் உள்ளவை மட்டும்', sort: 'வரிசை', sortRelevance: 'சிறந்த பொருத்தம்', sortName: 'அ–ஃ',
    forLabel: 'யாருக்கு', purposeLabel: 'பயன்', examLabel: 'தேர்வு', modeLabel: 'முறை', regionLabel: 'பகுதி', checked: 'சரிபார்க்கப்பட்டது', session: 'பருவம்',
    open: 'அதிகாரப்பூர்வ பக்கம் திற', openShort: 'திற', copy: 'லிங்க் காப்பி', copied: 'லிங்க் காப்பி ஆனது!', save: 'சேமி', saved: 'சேமிக்கப்பட்டது', report: 'சிக்கலைத் தெரிவி', back: 'பின்', home: 'முகப்பு',
    savedHeading: 'சேமித்த வளங்கள்', recently: 'சமீபத்தில் பார்த்தவை', emptySaved: 'இன்னும் சேமிப்பு இல்லை. எந்த கார்டிலும் “சேமி” தட்டவும்.',
    finderTitle: 'சரியான வளத்தைக் கண்டறி', finderStep: 'படி', finderOf: '/', next: 'அடுத்து', finish: 'என் வளங்களைக் காட்டு', restart: 'மீண்டும்',
    q_who: 'நீங்கள் யார்?', q_class: 'எந்த வகுப்பு அல்லது நிலை?', q_goal: 'இலக்கு என்ன?', q_mode: 'விருப்பமான முறை?', q_region: 'நீங்கள் எங்கே?', q_do: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
    recoTitle: 'எங்கே செல்வது', recoPrimary: 'தொடங்க சிறந்த இடம்', recoAlt: 'இதுவும் பயனுள்ளது', recoNone: 'சரியான பொருத்தம் இல்லை — அருகிலுள்ள அதிகாரப்பூர்வ வளங்கள்.',
    trustTitle: 'சரிபார்ப்பு பற்றி', trustNote: 'இது முக்கிய அதிகாரப்பூர்வ ALLEN வளங்களின் தேர்ந்தெடுத்த, தொடர்ந்து மறுஆய்வு செய்யப்படும் வழிகாட்டி — முழுமையான பட்டியல் அல்ல. ஒவ்வொரு லிங்கும் கடைசியாக எப்போது சரிபார்க்கப்பட்டது எனக் காட்டுகிறது. “சரிபார்க்கப்பட்டது” என்றால் அந்தத் தேதியில் பக்கம் திறந்தது; சில அதிகாரப்பூர்வ சமூகப் பக்கங்கள் தானியங்கி சரிபார்ப்பைத் தடுக்கின்றன, அவை “அதிகாரப்பூர்வ — தானாக சரிபார்க்கப்படவில்லை” எனக் காட்டும்.',
    disclaimer: 'சுயாதீன, சமூகத்தால் உருவாக்கப்பட்ட வழிகாட்டி. ஒவ்வொரு லிங்கும் ALLEN Career Institute-இன் சொந்த அதிகாரப்பூர்வ வலைதளங்கள்/சேனல்களுக்கே செல்கிறது. “ALLEN” மற்றும் தொடர்புடைய பெயர்கள் ALLEN Career Institute-இன் வர்த்தக முத்திரைகள்; இது அதிகாரப்பூர்வ ALLEN தளம் அல்ல, தொடர்போ அங்கீகாரமோ இல்லை.',
    reviewed: 'பட்டியல் கடைசி மறுஆய்வு', loading: 'வளங்கள் ஏற்றப்படுகின்றன…',
    badge: { verified: 'சரிபார்க்கப்பட்டது', 'verified-legacy': 'அதிகாரப்பூர்வ · பழைய பக்கம்', 'verified-regional': 'பிராந்திய அதிகாரப்பூர்வ', redirected: 'அதிகாரப்பூர்வ · திருப்புகிறது', 'registration-required': 'பதிவு தேவை', 'temporarily-unavailable': 'தற்காலிகமாக இல்லை', historical: 'வரலாற்று', unverified: 'அதிகாரப்பூர்வ · தானாக சரிபார்க்கப்படவில்லை', broken: 'தற்போது கிடைக்கவில்லை' },
    tasks: { 'course-discovery': 'பாடத்திட்டம் தேர்', login: 'மாணவர் உள்நுழைவு', 'centre-location': 'மையம் கண்டறி', 'app-download': 'ஆப் பதிவிறக்கம்', 'study-material': 'இலவசப் பொருட்கள்', 'scholarship-registration': 'உதவித்தொகைத் தேர்வு', results: 'முடிவு பார்', support: 'ஆதரவைத் தொடர்பு' },
    who: { student: 'மாணவர்', parent: 'பெற்றோர்', teacher: 'ஆசிரியர் / ஆலோசகர்', 'enrolled-student': 'தற்போதைய ALLEN மாணவர்', 'prospective-student': 'சேர நினைப்பவர்' },
    cls: { '6-8': 'வகுப்பு 6–8', '9-10': 'வகுப்பு 9–10', '11': 'வகுப்பு 11', '12': 'வகுப்பு 12', dropper: 'டிராப்பர்', 'college-other': 'கல்லூரி / பிற' },
    goal: { 'jee-main': 'JEE Main', 'jee-advanced': 'JEE Advanced', neet: 'NEET', foundation: 'Foundation', olympiad: 'Olympiad', board: 'போர்டு தயாரிப்பு', scholarship: 'உதவித்தொகைத் தேர்வு', abroad: 'வெளிநாட்டுப் படிப்பு', general: 'பொது விசாரணை' },
    mode: { classroom: 'வகுப்பறை', online: 'ஆன்லைன்', either: 'ஏதேனும்' },
    doing: { 'course-discovery': 'பாடத்திட்டம் பார்', admission: 'விண்ணப்பம் / சேர்க்கை', login: 'உள்நுழை', 'app-download': 'ஆப் பதிவிறக்கம்', 'study-material': 'படிப்புப் பொருட்கள்', support: 'ஆதரவைத் தொடர்பு' },
  },
};

let _lang = 'en';
let _tax = null;
const subs = new Set();

export function initLang() {
  const url = new URLSearchParams(location.search).get('lang');
  let saved = null; try { saved = localStorage.getItem('arh_lang'); } catch {}
  _lang = LANGS.includes(url) ? url : (LANGS.includes(saved) ? saved : 'en');
  return _lang;
}
export function getLang() { return _lang; }
export function isFirstVisit() { try { return !localStorage.getItem('arh_lang'); } catch { return true; } }
export function setLang(l) {
  if (!LANGS.includes(l)) return;
  _lang = l;
  try { localStorage.setItem('arh_lang', l); } catch {}
  document.documentElement.lang = l;
  document.title = t('metaTitle');
  const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('metaDesc'));
  subs.forEach(fn => fn(l));
}
export function onLang(fn) { subs.add(fn); }
export function setTaxonomies(tax) { _tax = tax; }

export function t(key) {
  const parts = key.split('.');
  let v = UI[_lang]; for (const p of parts) v = v && v[p];
  if (v == null) { v = UI.en; for (const p of parts) v = v && v[p]; }
  return v == null ? key : v;
}
// pick a translated content string ({en,hi,ta}) with fallback
export function pick(obj) { return obj ? (obj[_lang] || obj.en || '') : ''; }
// taxonomy label from data/taxonomies.json
export function label(dim, val) {
  const m = _tax && _tax.labels && _tax.labels[dim] && _tax.labels[dim][val];
  if (m) return m[_lang] || m.en || val;
  return t(`goal.${val}`) !== `goal.${val}` ? t(`goal.${val}`) : val;
}
