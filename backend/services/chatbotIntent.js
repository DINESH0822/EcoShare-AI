const intentPatterns = [
  ["greeting", /^(hi|hello|hey|good morning|good afternoon|good evening)\b/],
  ["project_existing_proposed", /\b(existing|current)\b.*\b(proposed|system)\b|\bproposed\b.*\b(existing|system)\b/],
  ["project_methodology", /\b(methodology|workflow method|project method)\b|\bexplain\b.*\b(approach|steps)\b/],
  ["project_architecture", /\b(project architecture|system architecture|tech stack|technology stack|frontend backend|database architecture)\b|\barchitecture\b/],
  ["project_dataset", /\b(training data|dataset|synthetic data|real data|training labels|training source|what data trains (the )?model|data trains (the )?model)\b/],
  ["project_model", /\b(which|what)\b.*\b(machine learning|ml|model|algorithm)\b|\b(random forest|randomforest|claim prediction|claim probability)\b/],
  ["project_safety", /\b(food safety|safe food|food certify|certif.*food|allergen|temperature guidance|storage safety|handling guidance)\b/],
  ["project_auth", /\b(authentication|authorization|role permissions|role based|jwt|ngo verification|verify ngos?)\b/],
  ["project_lifecycle", /\b(rescue lifecycle|donation lifecycle|end.to.end workflow|claim.*pickup.*deliver)\b/],
  ["project_limitations", /\b(limitations?|future (work|scope|enhancements?)|improvements?|weaknesses)\b/],
  ["project_testing", /\b(project|model|test|evaluation)\b.*\b(tests?|results?|metrics?|performance)\b|\bhow (was|is).*tested\b/],
  ["project_references", /\b(references?|citations?|literature survey|research papers?)\b/],
  ["project_deployment", /\b(deploy|deployment|hosting|vercel|render|environment variables)\b/],
  ["project_objectives", /\b(project objectives?|aims? of (the )?project|problem statement|scope of (the )?project)\b/],
  ["project_presentation", /\b(explain|present|describe)\b.*\b(entire|guide|examiner|internship)\b.*\b(project|ecoshare)\b|\bhow can i explain\b.*\b(guide|examiner|project)\b|\bexplain the entire\b.*\b(project|ecoshare)\b/],
  ["project_overview", /\b(what is ecoshare|about ecoshare|explain (the )?(entire )?(project|ecoshare)|entire ecoshare project|what problem does (the )?project solve)\b/],
  ["project_matching", /\b(ai matching|how does ai|matching algorithm|matching work|match donation|recommendation logic)\b/],
  ["help", /\b(help|what can you do|how can you help|how do i use|how to use|account workflow|platform workflow|navigation|what is ecoshare|about ecoshare)\b/],
  ["workflow", /\b(create|post|register|sign up|track|where do i|how do i)\b.*\b(donation|food|ngo|organization|volunteer|rescue|operations|platform|account)\b/],
  ["food_safety", /\b(food safety|safe food|allergen|temperature guidance|storage safety|handling guidance)\b/],
  ["impact", /\b(impact|sustainability|meals rescued|food rescued|rescued food|completed rescues|waste diverted)\b|\bhow much\b.*\b(rescued|rescue)\b/],
  ["nearest_organizations", /\b(nearest|closest)\b.*\b(ngo|organization|shelter|food bank)\b|\b(ngo|organization|shelter|food bank)\b.*\b(nearest|closest)\b/],
  ["expiring_donations", /\b(expir|expire|expiring|expiry|urgent|urgently|soon)\b.*\b(food|donation|donations|listing)\b|\b(food|donation|donations|listing)\b.*\b(expir|expire|expiring|expiry|urgent|urgently|soon)\b/],
  ["claims", /\b(claim|claims)\b|\bpending claim/],
  ["deliveries", /\b(delivery|deliveries|delivered|completed rescue|handoff)\b/],
  ["operations", /\b(pickup|pickups|assigned operation|my operation|rescue operation|pending pickup|my task)\b/],
  ["my_donations", /\b(my|mine|i have|i posted|my posted)\b.*\b(food|donation|donations|listing|listings)\b|\b(what|show)\b.*\b(donations|food)\b.*\b(i have|mine|my)\b/],
  ["available_donations", /\b(available|browse|nearby)\b.*\b(food|donation|donations)\b|\b(show|list)\b.*\b(food|available donations)\b/],
  ["donation_details", /\b(status|details|trace|tracking)\b.*\b(donation|food)\b|\b(donation|food)\b.*\b(status|details|trace|tracking)\b|\bes-don-\d{4}-\d+\b|\b[a-f\d]{24}\b/],
  ["verification", /\bhow (are|is)\b.*\b(verified|approved)\b|\b(verification process|ngo approval|approve an? (ngo|organization))\b/],
  ["organizations", /\b(show|list|browse|available|verified)\b.*\b(ngo|ngos|organization|organizations|shelter|food bank)\b/],
  ["organization_details", /\b(capacity|verification|verified|organization details|ngo details|tell me about)\b/],
  ["organizations", /\b(ngo|ngos|organization|organizations|shelter|food bank|community kitchen)\b/]
];

const classifyIntent = (message, previousIntent) => {
  const text = String(message || "").toLowerCase().trim()
    .replace(/\b(algoritm|algorthm)\b/g, "algorithm")
    .replace(/\b(architecure|archtecture)\b/g, "architecture")
    .replace(/\b(methodolgy|metodology)\b/g, "methodology")
    .replace(/\b(donatoin|donatons)\b/g, "donation")
    .replace(/\b(orgnization|organisaton)\b/g, "organization")
    .replace(/\b(machine learnng|machne learning)\b/g, "machine learning")
    .replace(/\b(limtation|limitiations)\b/g, "limitations");
  if (!text) return "unknown";

  for (const [intent, pattern] of intentPatterns) {
    if (pattern.test(text)) return intent;
  }

  if (previousIntent === "claims" && /\b(and )?pending\b/.test(text)) return "claims";
  if (previousIntent === "operations" && /\b(and )?(pending|assigned|active)\b/.test(text)) return "operations";
  if (previousIntent === "my_donations" && /\b(and )?(status|latest|most recent)\b/.test(text)) return "donation_details";

  return "unknown";
};

module.exports = { classifyIntent };