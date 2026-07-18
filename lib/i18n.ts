import type { Lang } from "./types";

export interface QuickPrompt {
  label: string;
  /** The message actually sent to the agent. */
  prompt: string;
}

interface Strings {
  appName: string;
  wordmarkSub: string;
  tagline: string;
  intro: string;
  inputPlaceholder: string;
  send: string;
  stop: string;
  micStart: string;
  micListening: string;
  micUnsupported: string;
  micDenied: string;
  micError: string;
  newChat: string;
  addPhoto: string;
  removePhoto: string;
  photoHint: string;
  photoTooBig: string;
  quickTitle: string;
  quickPrompts: QuickPrompt[];
  thinking: string;
  sources: string;
  langName: string;
  switchTo: string;
  // tools
  tools: string;
  wageTool: string;
  complaintTool: string;
  resourcesTool: string;
  close: string;
  // wage card
  wageTitle: string;
  wageIntro: string;
  wageCategory: string;
  wageMonthly: string;
  wageDaily: string;
  wagePaidQ: string;
  wagePaidPlaceholder: string;
  wageShortfall: string;
  wageOk: string;
  wageAskAgent: string;
  wageAsOf: string;
  categories: { key: string; label: string }[];
  // complaint
  complaintTitle: string;
  complaintIntro: string;
  cIssue: string;
  cName: string;
  cNamePh: string;
  cEmployer: string;
  cEmployerPh: string;
  cDetails: string;
  cDetailsPh: string;
  cGenerate: string;
  cGenerating: string;
  cCopy: string;
  cCopied: string;
  cDownload: string;
  cDocs: string;
  cSubmit: string;
  cHelpline: string;
  issues: { key: string; label: string }[];
  // resources
  resTitle: string;
  resHelplines: string;
  resOffices: string;
  resSchemes: string;
  resVisit: string;
  // trust
  disclaimer: string;
  urgentHelp: string;
  footer: string;
  errorGeneric: string;
  errorNoKey: string;
}

const en: Strings = {
  appName: "Haq",
  wordmarkSub: "हक़",
  tagline: "Know your rights. In your language.",
  intro:
    "Ask about wages, e-Shram, welfare schemes, or an unfair employer. I explain your rights in plain language, point to the law, and tell you exactly where to go.",
  inputPlaceholder: "Ask about your rights, wages, or a problem at work…",
  send: "Send",
  stop: "Stop",
  micStart: "Speak",
  micListening: "Listening…",
  micUnsupported: "Voice input isn't supported in this browser.",
  micDenied: "Microphone blocked. Allow mic access in your browser, or just type.",
  micError: "Voice input didn't work — please type instead.",
  newChat: "New chat",
  addPhoto: "Add a photo",
  removePhoto: "Remove photo",
  photoHint: "Photo of a wage slip, contract or labour card? Send it — I'll read it for you.",
  photoTooBig: "That file couldn't be read. Try another photo.",
  quickTitle: "Try asking",
  quickPrompts: [
    {
      label: "I'm not paid minimum wage",
      prompt:
        "I am a worker in Delhi and my employer is paying me less than the minimum wage. What are my rights and what should I do?",
    },
    {
      label: "How to register on e-Shram",
      prompt:
        "How do I register on the e-Shram portal, am I eligible, and what benefits will I get?",
    },
    {
      label: "I was injured at work",
      prompt:
        "I was injured while working at a construction site in Delhi. What compensation am I entitled to and who do I contact?",
    },
    {
      label: "Employer is holding my wages",
      prompt:
        "My contractor has not paid my wages for two months. How do I file a complaint and get my money?",
    },
  ],
  thinking: "Finding the law and current facts…",
  sources: "Sources",
  langName: "English",
  switchTo: "हिंदी",
  tools: "Tools",
  wageTool: "Check minimum wage",
  complaintTool: "Draft a complaint",
  resourcesTool: "Helplines & offices",
  close: "Close",
  wageTitle: "Delhi Minimum Wage Check",
  wageIntro:
    "Select your type of work to see the wage the law guarantees you in Delhi.",
  wageCategory: "Type of work",
  wageMonthly: "Monthly minimum",
  wageDaily: "Per day",
  wagePaidQ: "What are you actually paid per month? (optional)",
  wagePaidPlaceholder: "e.g. 14000",
  wageShortfall: "You may be underpaid by about",
  wageOk: "You are at or above the legal minimum. Good.",
  wageAskAgent: "Ask the assistant what to do",
  wageAsOf: "Rates effective",
  categories: [
    { key: "unskilled", label: "Unskilled (helper, loader, cleaner)" },
    { key: "semiskilled", label: "Semi-skilled (mason helper, machine operator)" },
    { key: "skilled", label: "Skilled (mason, electrician, carpenter)" },
    { key: "clerical", label: "Clerical / graduate / supervisor" },
  ],
  complaintTitle: "Draft a Complaint",
  complaintIntro:
    "Fill what you can. I'll write a formal complaint you can print, sign, and submit. Nothing is stored.",
  cIssue: "What is the problem?",
  cName: "Your name (optional)",
  cNamePh: "e.g. Ravi Kumar",
  cEmployer: "Employer / contractor (optional)",
  cEmployerPh: "e.g. XYZ Constructions",
  cDetails: "What happened? (in your words)",
  cDetailsPh: "Dates, amount owed, site, anything you remember…",
  cGenerate: "Generate complaint",
  cGenerating: "Writing your complaint…",
  cCopy: "Copy",
  cCopied: "Copied",
  cDownload: "Download",
  cDocs: "Documents to attach",
  cSubmit: "How to submit",
  cHelpline: "Helpline",
  issues: [
    { key: "unpaid_wages", label: "Unpaid or delayed wages" },
    { key: "below_minimum", label: "Paid below minimum wage" },
    { key: "termination", label: "Unfair dismissal / termination" },
    { key: "injury", label: "Workplace injury / no compensation" },
    { key: "no_pf_esi", label: "PF / ESI not deposited" },
    { key: "other", label: "Other" },
  ],
  resTitle: "Helplines & Offices",
  resHelplines: "Helplines",
  resOffices: "Where to go",
  resSchemes: "Schemes & boards",
  resVisit: "Visit",
  disclaimer:
    "Information, not legal advice. Wage figures change — always confirm current rates with the source shown.",
  urgentHelp: "Urgent? Shramik Helpline 155214",
  footer:
    "Haq is an independent assistant for Delhi workers. It stores no personal data. Built for the GDG Cloud × Elastic Build-With-AI Buildathon.",
  errorGeneric: "Something went wrong. Please try again.",
  errorNoKey:
    "The assistant is not configured yet. Add a Gemini API key to run it (see README).",
};

const hi: Strings = {
  appName: "Haq",
  wordmarkSub: "हक़",
  tagline: "अपने हक़ जानिए. अपनी भाषा में.",
  intro:
    "मज़दूरी, e-Shram, कल्याण योजनाओं या किसी अन्यायी मालिक के बारे में पूछिए. मैं आपके हक़ आसान भाषा में समझाता हूँ, कानून बताता हूँ, और यह भी कि कहाँ जाना है.",
  inputPlaceholder: "अपने हक़, मज़दूरी या काम की समस्या के बारे में पूछिए…",
  send: "भेजें",
  stop: "रोकें",
  micStart: "बोलिए",
  micListening: "सुन रहा हूँ…",
  micUnsupported: "इस ब्राउज़र में आवाज़ से पूछना उपलब्ध नहीं है.",
  micDenied: "माइक की अनुमति नहीं मिली. ब्राउज़र में अनुमति दें, या टाइप करें.",
  micError: "आवाज़ काम नहीं कर पाई — कृपया टाइप करें.",
  newChat: "नई बातचीत",
  addPhoto: "फ़ोटो भेजें",
  removePhoto: "फ़ोटो हटाएँ",
  photoHint: "पर्ची, ठेका या लेबर कार्ड की फ़ोटो भेजिए — मैं पढ़कर बताऊँगा.",
  photoTooBig: "यह फ़ाइल पढ़ी नहीं जा सकी. दूसरी फ़ोटो आज़माइए.",
  quickTitle: "यह पूछ कर देखिए",
  quickPrompts: [
    {
      label: "मुझे न्यूनतम मज़दूरी नहीं मिल रही",
      prompt:
        "मैं दिल्ली में मज़दूर हूँ और मेरा मालिक मुझे न्यूनतम मज़दूरी से कम दे रहा है. मेरे क्या हक़ हैं और मुझे क्या करना चाहिए?",
    },
    {
      label: "e-Shram पर रजिस्टर कैसे करें",
      prompt:
        "मैं e-Shram पोर्टल पर रजिस्टर कैसे करूँ, क्या मैं पात्र हूँ, और मुझे क्या लाभ मिलेंगे?",
    },
    {
      label: "काम पर चोट लग गई",
      prompt:
        "दिल्ली में निर्माण स्थल पर काम करते समय मुझे चोट लग गई. मुझे कितना मुआवज़ा मिल सकता है और किससे संपर्क करूँ?",
    },
    {
      label: "ठेकेदार पैसे रोक रहा है",
      prompt:
        "मेरे ठेकेदार ने दो महीने से मेरी मज़दूरी नहीं दी. मैं शिकायत कैसे दर्ज करूँ और अपने पैसे कैसे पाऊँ?",
    },
  ],
  thinking: "कानून और ताज़ा जानकारी ढूँढ रहा हूँ…",
  sources: "स्रोत",
  langName: "हिंदी",
  switchTo: "English",
  tools: "सुविधाएँ",
  wageTool: "न्यूनतम मज़दूरी जाँचें",
  complaintTool: "शिकायत तैयार करें",
  resourcesTool: "हेल्पलाइन और दफ़्तर",
  close: "बंद करें",
  wageTitle: "दिल्ली न्यूनतम मज़दूरी जाँच",
  wageIntro:
    "अपने काम का प्रकार चुनिए और देखिए कि कानून दिल्ली में आपको कितनी मज़दूरी की गारंटी देता है.",
  wageCategory: "काम का प्रकार",
  wageMonthly: "मासिक न्यूनतम",
  wageDaily: "प्रति दिन",
  wagePaidQ: "आपको असल में महीने का कितना मिलता है? (वैकल्पिक)",
  wagePaidPlaceholder: "जैसे 14000",
  wageShortfall: "आपको लगभग इतना कम मिल रहा है",
  wageOk: "आप कानूनी न्यूनतम पर या उससे ऊपर हैं. अच्छा है.",
  wageAskAgent: "सहायक से पूछें कि क्या करें",
  wageAsOf: "दरें लागू",
  categories: [
    { key: "unskilled", label: "अकुशल (हेल्पर, लोडर, सफ़ाई)" },
    { key: "semiskilled", label: "अर्ध-कुशल (राजमिस्त्री हेल्पर, मशीन ऑपरेटर)" },
    { key: "skilled", label: "कुशल (राजमिस्त्री, बिजली मिस्त्री, बढ़ई)" },
    { key: "clerical", label: "क्लर्क / स्नातक / सुपरवाइज़र" },
  ],
  complaintTitle: "शिकायत तैयार करें",
  complaintIntro:
    "जो भर सकें भरिए. मैं एक औपचारिक शिकायत लिख दूँगा जिसे आप प्रिंट कर, हस्ताक्षर कर, जमा कर सकते हैं. कुछ भी सेव नहीं होता.",
  cIssue: "समस्या क्या है?",
  cName: "आपका नाम (वैकल्पिक)",
  cNamePh: "जैसे रवि कुमार",
  cEmployer: "मालिक / ठेकेदार (वैकल्पिक)",
  cEmployerPh: "जैसे XYZ कंस्ट्रक्शन",
  cDetails: "क्या हुआ? (अपने शब्दों में)",
  cDetailsPh: "तारीख़ें, बकाया रकम, साइट, जो भी याद हो…",
  cGenerate: "शिकायत बनाएँ",
  cGenerating: "आपकी शिकायत लिखी जा रही है…",
  cCopy: "कॉपी",
  cCopied: "कॉपी हो गया",
  cDownload: "डाउनलोड",
  cDocs: "साथ लगाने वाले दस्तावेज़",
  cSubmit: "कैसे जमा करें",
  cHelpline: "हेल्पलाइन",
  issues: [
    { key: "unpaid_wages", label: "मज़दूरी नहीं मिली / देर से मिली" },
    { key: "below_minimum", label: "न्यूनतम से कम मज़दूरी" },
    { key: "termination", label: "अनुचित तरीके से काम से निकाला" },
    { key: "injury", label: "काम पर चोट / मुआवज़ा नहीं मिला" },
    { key: "no_pf_esi", label: "PF / ESI जमा नहीं हुआ" },
    { key: "other", label: "अन्य" },
  ],
  resTitle: "हेल्पलाइन और दफ़्तर",
  resHelplines: "हेल्पलाइन",
  resOffices: "कहाँ जाएँ",
  resSchemes: "योजनाएँ और बोर्ड",
  resVisit: "देखें",
  disclaimer:
    "यह जानकारी है, कानूनी सलाह नहीं. मज़दूरी की दरें बदलती रहती हैं — दिखाए गए स्रोत से मौजूदा दर ज़रूर जाँचें.",
  urgentHelp: "ज़रूरी? श्रमिक हेल्पलाइन 155214",
  footer:
    "Haq दिल्ली के मज़दूरों के लिए एक स्वतंत्र सहायक है. यह कोई निजी जानकारी सेव नहीं करता. GDG Cloud × Elastic बिल्ड-विद-AI बिल्डाथॉन के लिए बनाया गया.",
  errorGeneric: "कुछ गड़बड़ हो गई. कृपया फिर कोशिश करें.",
  errorNoKey:
    "सहायक अभी तैयार नहीं है. इसे चलाने के लिए Gemini API key जोड़ें (README देखें).",
};

export const STRINGS: Record<Lang, Strings> = { en, hi };

export function t(lang: Lang): Strings {
  return STRINGS[lang];
}
