const projectAnswers = {
  project_overview: {
    reply: "EcoShare AI is a food-rescue coordination platform. It helps donors publish surplus food, verified NGOs discover suitable donations, and authorized participants coordinate claims, pickups, and delivery records. The aim is to reduce avoidable food waste and improve redistribution; the application does not independently verify real-world environmental impact.",
    suggestions: ["Explain the project architecture", "How does AI matching work?", "What are the project limitations?"],
    quickActions: [{ label: "Browse donations", action: "/donations" }]
  },
  project_objectives: {
    reply: "The project objectives are to make surplus-food listings easier to discover, prioritize eligible donor–NGO matches with understandable reasons, coordinate authorized claims and rescue operations, and keep a traceable record of status changes. These are software objectives, not measured impact claims.",
    suggestions: ["Explain the rescue lifecycle", "Explain the methodology", "What are the project limitations?"],
    quickActions: [{ label: "Open operations", action: "/operations" }]
  },
  project_architecture: {
    reply: "The verified application stack is a React and Vite frontend, a Node.js and Express REST API, MongoDB accessed through Mongoose, JWT-based authentication with role checks, and Socket.IO for real-time features. The matching logic runs in the backend; a separate Python scikit-learn service provides claim-probability predictions when its model can run. EcoBot uses backend intent classification and project answers plus authorized database queries; it is not an LLM.",
    suggestions: ["Which machine-learning model is used?", "Explain authentication and roles", "How does AI matching work?"],
    quickActions: [{ label: "Open integrations", action: "/integrations" }]
  },
  project_existing_proposed: {
    reply: "For a presentation, describe the existing-system limitation as fragmented donation discovery and manual coordination; do not claim that every organization currently uses a particular external system. The proposed EcoShare workflow brings listings, eligibility checks, explainable matching, role-authorized claims, and rescue tracking into one platform. The implemented project is a prototype and its effectiveness should be evaluated with real operational data before making outcome claims.",
    suggestions: ["Explain the methodology", "What data trains the model?", "What are the project limitations?"]
  },
  project_methodology: {
    reply: "In simple terms: (1) a donor records food, quantity, location, and expiry; (2) the backend checks listing and organization eligibility; (3) eligible organizations are scored using explicit logistics and compatibility factors; (4) the system stores recommendations and a separate model may estimate claim probability; (5) an authorized NGO can claim, and the permitted participants record pickup and delivery progress. Food-safety and authorization rules remain independent of a score.",
    suggestions: ["Explain the rescue lifecycle", "How does AI matching work?", "Which machine-learning model is used?"],
    quickActions: [{ label: "Open donations", action: "/donations" }, { label: "Open operations", action: "/operations" }]
  },
  project_matching: {
    reply: "The backend first limits matching candidates to active, verified or approved NGOs. Its explainable rules score food compatibility, refrigeration needs, distance or estimated route time, pickup radius, remaining capacity, expiry urgency, operating hours, emergency-pickup capability, and recorded reliability. It ranks eligible candidates and stores a recommendation with factor-level reasons. The rules score is distinct from the Random Forest claim-probability estimate; neither guarantees a claim or safe food.",
    suggestions: ["Which machine-learning model is used?", "What data trains the model?", "Explain the rescue lifecycle?"],
    quickActions: [{ label: "Browse organizations", action: "/organizations" }]
  },
  project_model: {
    reply: "The repository contains a separate scikit-learn RandomForestClassifier claim-success predictor (100 trees, maximum depth 7). Its inputs include distance, quantity, remaining shelf life, NGO capacity and capacity ratio, food category, emergency status, and refrigeration requirement. It estimates a claim probability; it does not make the NGO match by itself and does not guarantee a claim.",
    suggestions: ["What data trains the model?", "What does the model predict?", "What are the project limitations?"]
  },
  project_dataset: {
    reply: "The checked-in training script generates 3,000 synthetic examples. It assigns labels by sampling from a hand-written logistic probability formula based on logistics features; these are not historical donor, NGO, claim, or delivery records. The saved model's holdout metrics therefore describe a synthetic train/test split only, not validated real-world performance. A representative, consented, outcome-labeled operational dataset is needed for meaningful deployment evaluation.",
    suggestions: ["Which machine-learning model is used?", "What are the project limitations?", "Explain the methodology"]
  },
  project_references: {
    reply: "Verified sources you can cite include: UNEP, Food Waste Index Report 2024 (official report: https://www.unep.org/resources/publication/food-waste-index-report-2024); Zhu et al., “Cradle-to-grave emissions from food loss and waste represent half of total greenhouse gas emissions from food systems,” Nature Food 4, 247–256 (2023), https://doi.org/10.1038/s43016-023-00710-3; and Barredo Arrieta et al., “Explainable Artificial Intelligence (XAI): Concepts, taxonomies, opportunities and challenges toward responsible AI,” Information Fusion 58, 82–115 (2020), https://doi.org/10.1016/j.inffus.2019.12.012. These support the problem context and explainability discussion; they are not evidence that EcoShare's model is accurate.",
    suggestions: ["Explain the project methodology", "What are the project limitations?", "Which machine-learning model is used?"]
  },
  project_auth: {
    reply: "The application uses JWT authentication and server-side role checks for Donor, NGO, Volunteer, and Admin workflows. The backend scopes record queries to the authenticated user or linked organization; EcoBot uses those same backend scopes for live account data. NGO verification is an administrative workflow, and an AI recommendation does not grant permission to claim food.",
    suggestions: ["Explain the rescue lifecycle", "How are NGOs verified?", "Explain the project architecture"],
    quickActions: [{ label: "Open organizations", action: "/organizations" }]
  },
  project_lifecycle: {
    reply: "The implemented rescue flow is: donor publishes a food listing; the backend stores it and calculates eligible recommendations; an authorized, eligible NGO claims it; the backend records claim/operation state; assigned participants update permitted pickup and delivery statuses; completed records can appear in history and account-scoped impact summaries. Exact transitions depend on the backend status and authorization rules. A status is not considered complete just because a recommendation exists.",
    suggestions: ["How does AI matching work?", "How do I track a rescue?", "Show my operations"],
    quickActions: [{ label: "Open operations", action: "/operations" }]
  },
  project_safety: {
    reply: "EcoShare stores coordination details such as preparation and expiry times, storage conditions, packaging, and allergens. It does not inspect food, certify food safety, or replace local food-handling requirements. Follow applicable regulations and organizational procedures; matching scores must never override safety decisions.",
    suggestions: ["Explain the rescue lifecycle", "How does AI matching work?", "What are the project limitations?"]
  },
  project_limitations: {
    reply: "Important limitations: the claim model is trained on synthetic, formula-generated labels rather than real outcomes; its stored metrics are not evidence of production accuracy; deterministic fallback scores are not ML predictions; route estimates can fall back to straight-line distance; optional email/SMS/WhatsApp providers need credentials; and the platform cannot certify food safety or independently verify impact. Future work should collect governed real outcomes, evaluate calibration and fairness, validate routing/integrations, and test the full workflow with partner organizations.",
    suggestions: ["What data trains the model?", "Explain the project architecture", "Which machine-learning model is used?"]
  },
  project_testing: {
    reply: "Testing evidence should be reported only for commands actually run. The repository includes Node.js backend tests and frontend build/lint scripts, plus a Python training and inference pipeline. Automated unit tests and a successful build do not by themselves prove live MongoDB, external providers, model quality, or end-to-end field performance; report those separately.",
    suggestions: ["What are the project limitations?", "Explain the methodology", "Which machine-learning model is used?"]
  },
  project_deployment: {
    reply: "The repository documents Vercel as the frontend target, Render as the backend target, and MongoDB Atlas for persistence. Deployment still requires correctly configured environment variables, database access, and any optional provider credentials. Check the Integrations page and deployment logs rather than assuming that a documented target is already live.",
    suggestions: ["Explain the project architecture", "What are the project limitations?", "Open integrations"],
    quickActions: [{ label: "Open integrations", action: "/integrations" }]
  },
  project_presentation: {
    reply: "A concise examiner explanation: “EcoShare AI is a role-based food-rescue coordination prototype. Donors publish surplus food; the backend filters and ranks eligible NGOs with explainable rules; a separate Random Forest estimates claim probability; and authorized users track the rescue lifecycle. The current model uses synthetic, formula-generated labels, so its metrics are not real-world evidence. The next research step is evaluation on governed operational outcomes.” Replace this with your own internship evidence and results.",
    suggestions: ["Explain the methodology", "What are the project limitations?", "Explain the project architecture"]
  }
};

const getProjectAnswer = (intent) => projectAnswers[intent] || null;

module.exports = { getProjectAnswer, projectAnswers };
