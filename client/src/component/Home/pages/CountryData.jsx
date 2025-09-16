// CountryData.js
// CountryData.js
import React from "react";

export const countryFlags = {
  finland: <span className="fi fi-fi w-6 h-6" />,
  estonia: <span className="fi fi-ee w-6 h-6" />,
  denmark: <span className="fi fi-dk w-6 h-6" />,
  sweden: <span className="fi fi-se w-6 h-6" />,
  norway: <span className="fi fi-no w-6 h-6" />,
  hungary: <span className="fi fi-hu w-6 h-6" />,
  usa: <span className="fi fi-us w-6 h-6" />,
  uk: <span className="fi fi-gb w-6 h-6" />,
  australia: <span className="fi fi-au w-6 h-6" />,
  italy: <span className="fi fi-it w-6 h-6" />,
  spain: <span className="fi fi-es w-6 h-6" />,
  portugal: <span className="fi fi-pt w-6 h-6" />,
  greece: <span className="fi fi-gr w-6 h-6" />,
  poland: <span className="fi fi-pl w-6 h-6" />,
  lithuania: <span className="fi fi-lt w-6 h-6" />,
  latvia: <span className="fi fi-lv w-6 h-6" />,
  cyprus: <span className="fi fi-cy w-6 h-6" />,
  malta: <span className="fi fi-mt w-6 h-6" />,
  czechRepublic: <span className="fi fi-cz w-6 h-6" />,
  romania: <span className="fi fi-ro w-6 h-6" />,
  china: <span className="fi fi-cn w-6 h-6" />,
  malaysia: <span className="fi fi-my w-6 h-6" />,
  thailand: <span className="fi fi-th w-6 h-6" />,
};

export const allCountries = [
  {
    id: "finland",
    name: "Finland",
    highlights: [
      "Free education (EU students)",
      "Post-study work visa: 1 year",
      "High quality education system",
      "Safe and clean environment",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €4,000-18,000/year",
        "Living Costs: €700-1,200/month",
      ],
      workOpportunities: [
        "25 hrs/week during studies",
        "Full-time during holidays",
        "1-year job seeker visa after graduation",
        "Strong tech sector",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€6,720/year)",
        "Health insurance",
        "Residence permit application",
        "Processing Time: 1-3 months",
      ],
      scholarships: [
        "Finnish Government Scholarships",
        "University-specific scholarships",
        "Erasmus+",
      ],
      accommodation: [
        "Student housing: €250-500/month",
        "Shared apartments: €400-700/month",
        "Private studios: €600-900/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "estonia",
    name: "Estonia",
    highlights: [
      "Digital society leader",
      "Affordable education",
      "6-month job seeker visa",
      "EU access after studies",
    ],
    details: {
      educationCosts: [
        "EU Students: Free (Estonian programs)",
        "Non-EU: €1,500-7,000/year",
        "Living Costs: €500-900/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "6-month residence permit after graduation",
        "Strong IT and startup ecosystem",
      ],
      visaProcess: [
        "University admission",
        "Proof of funds (€450/month)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Estonian Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €200-400/month",
        "Shared apartments: €300-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "denmark",
    name: "Denmark",
    highlights: [
      "6-month job seeker visa",
      "English-taught programs",
      "Work up to 20 hrs/week",
      "High standard of living",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €6,000-16,000/year",
        "Living Costs: €800-1,400/month",
      ],
      workOpportunities: [
        "20 hrs/week during term",
        "Full-time June-August",
        "6-month post-study residence permit",
        "Strong renewable energy sector",
      ],
      visaProcess: [
        "University admission",
        "Proof of funds (€1,000/month)",
        "Residence permit application",
        "Biometrics registration",
        "Processing Time: 2-3 months",
      ],
      scholarships: [
        "Danish Government Scholarships",
        "Erasmus Mundus",
        "University scholarships",
      ],
      accommodation: [
        "Student dorms: €400-600/month",
        "Shared apartments: €500-800/month",
        "Private studios: €700-1,200/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "sweden",
    name: "Sweden",
    highlights: [
      "6-month job seeker visa",
      "No tuition for EU students",
      "Innovative teaching methods",
      "Strong focus on sustainability",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €8,000-15,000/year",
        "Living Costs: €700-1,200/month",
      ],
      workOpportunities: [
        "No hour limit during studies",
        "6-month residence permit extension after graduation",
        "Strong IT and engineering sectors",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€860/month)",
        "Residence permit application",
        "Processing Time: 1-3 months",
      ],
      scholarships: [
        "Swedish Institute Scholarships",
        "University scholarships",
        "Erasmus+",
      ],
      accommodation: [
        "Student housing: €300-600/month",
        "Shared apartments: €400-700/month",
        "Private studios: €600-1,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "norway",
    name: "Norway",
    highlights: [
      "Free tuition at public universities",
      "Work up to 20 hrs/week",
      "1-year job seeker visa",
      "Stunning natural environment",
    ],
    details: {
      educationCosts: [
        "Public Universities: Free",
        "Private: €7,000-15,000/year",
        "Living Costs: €900-1,400/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "1-year residence permit after graduation",
        "Strong maritime/oil industries",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€12,350/year)",
        "Residence permit application",
        "Processing Time: 1-3 months",
      ],
      scholarships: [
        "Quota Scheme Scholarships",
        "Erasmus Mundus",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €400-700/month",
        "Shared apartments: €500-900/month",
        "Private studios: €700-1,300/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "hungary",
    name: "Hungary",
    highlights: [
      "Affordable education",
      "Central European location",
      "EU degree recognition",
      "Rich cultural heritage",
    ],
    details: {
      educationCosts: [
        "EU Students: Free (Hungarian programs)",
        "Non-EU: €2,000-6,000/year",
        "Living Costs: €400-800/month",
      ],
      workOpportunities: [
        "24 hrs/week during studies",
        "9-month residence permit after graduation",
        "Growing IT and medical sectors",
      ],
      visaProcess: [
        "University admission",
        "Proof of funds (€400/month)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Stipendium Hungaricum",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student dorms: €150-300/month",
        "Shared apartments: €250-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "usa",
    name: "USA",
    highlights: [
      "World-class universities",
      "Optional Practical Training (OPT)",
      "STEM extension available",
      "Diverse cultural experience",
    ],
    details: {
      educationCosts: [
        "Public Universities: $20,000-40,000/year",
        "Private: $30,000-60,000/year",
        "Living Costs: $1,000-2,500/month",
      ],
      workOpportunities: [
        "20 hrs/week on-campus",
        "1-3 years OPT after graduation",
        "Strong tech and business sectors",
      ],
      visaProcess: [
        "University admission",
        "SEVIS fee payment",
        "DS-160 form",
        "Visa interview",
        "Processing Time: 2-4 months",
      ],
      scholarships: [
        "Fulbright Scholarships",
        "University scholarships",
        "Private scholarships",
      ],
      accommodation: [
        "Student housing: $500-1,200/month",
        "Shared apartments: $600-1,500/month",
        "Private studios: $1,000-2,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "uk",
    name: "UK",
    highlights: [
      "Post-study work visa (2 years)",
      "World-renowned universities",
      "English-speaking country",
      "Cultural diversity",
    ],
    details: {
      educationCosts: [
        "Undergraduate: £10,000-38,000/year",
        "Postgraduate: £12,000-45,000/year",
        "Living Costs: £800-1,500/month",
      ],
      workOpportunities: [
        "20 hrs/week during term",
        "Full-time during holidays",
        "2-year Graduate Route visa",
        "Strong finance and tech sectors",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (£1,265/month outside London)",
        "CAS number",
        "Visa application",
        "Processing Time: 3-6 weeks",
      ],
      scholarships: [
        "Chevening Scholarships",
        "Commonwealth Scholarships",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: £400-800/month",
        "Shared apartments: £500-1,000/month",
        "Private studios: £700-1,500/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "australia",
    name: "Australia",
    highlights: [
      "Post-study work visa (2-4 years)",
      "High quality of life",
      "Work rights during studies",
      "Diverse student community",
    ],
    details: {
      educationCosts: [
        "Undergraduate: AUD 20,000-45,000/year",
        "Postgraduate: AUD 22,000-50,000/year",
        "Living Costs: AUD 1,200-2,000/month",
      ],
      workOpportunities: [
        "40 hrs/fortnight during term",
        "Unlimited during holidays",
        "2-4 year post-study work visa",
        "Strong healthcare and engineering sectors",
      ],
      visaProcess: [
        "University admission",
        "Genuine Temporary Entrant requirement",
        "Financial proof (AUD 21,041/year)",
        "Visa application",
        "Processing Time: 1-3 months",
      ],
      scholarships: [
        "Australia Awards",
        "University scholarships",
        "Government scholarships",
      ],
      accommodation: [
        "Student housing: AUD 500-1,200/month",
        "Shared apartments: AUD 600-1,500/month",
        "Private studios: AUD 800-2,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "italy",
    name: "Italy",
    highlights: [
      "Affordable public universities",
      "Rich cultural experience",
      "EU access after studies",
      "World-class design programs",
    ],
    details: {
      educationCosts: [
        "Public Universities: €900-4,000/year",
        "Private: €6,000-20,000/year",
        "Living Costs: €700-1,200/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "1-year residence permit after graduation",
        "Strong fashion and design industries",
      ],
      visaProcess: [
        "University pre-enrollment",
        "Proof of funds (€6,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-3 months",
      ],
      scholarships: [
        "Italian Government Scholarships",
        "EDISU Piemonte",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €300-600/month",
        "Shared apartments: €400-800/month",
        "Private studios: €600-1,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "spain",
    name: "Spain",
    highlights: [
      "Affordable education",
      "Rich cultural heritage",
      "Post-study work opportunities",
      "EU access after studies",
    ],
    details: {
      educationCosts: [
        "EU Students: Free (Spanish programs)",
        "Non-EU: €1,000-10,000/year",
        "Living Costs: €500-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€6,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Spanish Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €250-500/month",
        "Shared apartments: €300-600/month",
        "Private studios: €500-1,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "portugal",
    name: "Portugal",
    highlights: [
      "Affordable education",
      "Rich cultural heritage",
      "Post-study work opportunities",
      "EU access after studies",
    ],
    details: {
      educationCosts: [
        "EU Students: Free (Portuguese programs)",
        "Non-EU: €1,000-7,000/year",
        "Living Costs: €500-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Portuguese Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €250-500/month",
        "Shared apartments: €300-600/month",
        "Private studios: €500-1,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "greece",
    name: "Greece",
    highlights: [
      "Affordable tuition fees",
      "Rich history and culture",
      "Post-study work opportunities",
      "Access to the EU job market",
    ],
    details: {
      educationCosts: [
        "EU Students: Free (Greek programs)",
        "Non-EU: €2,000-6,000/year",
        "Living Costs: €400-700/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Proof of funds (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Greek Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €250-500/month",
        "Shared apartments: €300-600/month",
        "Private studios: €500-1,000/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "poland",
    name: "Poland",
    highlights: [
      "Affordable tuition fees",
      "Strong education system",
      "Post-study work opportunities",
      "Gateway to the EU job market",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €2,000-6,000/year",
        "Living Costs: €400-700/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Polish Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €200-400/month",
        "Shared apartments: €300-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "lithuania",
    name: "Lithuania",
    highlights: [
      "Affordable education",
      "Good quality of life",
      "Growing tech sector",
      "EU access after studies",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €2,000-5,000/year",
        "Living Costs: €500-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Lithuanian Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €150-300/month",
        "Shared apartments: €200-400/month",
        "Private studios: €300-600/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "latvia",
    name: "Latvia",
    highlights: [
      "Affordable education",
      "Good quality of life",
      "Post-study work opportunities",
      "EU access after studies",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €2,000-6,000/year",
        "Living Costs: €400-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€4,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Latvian Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €150-300/month",
        "Shared apartments: €250-500/month",
        "Private studios: €350-600/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "cyprus",
    name: "Cyprus",
    highlights: [
      "Affordable education",
      "English-speaking programs",
      "Post-study work opportunities",
      "Great weather and lifestyle",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €3,000-10,000/year",
        "Living Costs: €500-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Proof of funds (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Cypriot Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €200-400/month",
        "Shared apartments: €300-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "malta",
    name: "Malta",
    highlights: [
      "Affordable education",
      "Rich cultural heritage",
      "English as the main language",
      "Post-study work opportunities",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €5,000-15,000/year",
        "Living Costs: €600-1,000/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€5,500/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Malta Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €250-500/month",
        "Shared apartments: €300-600/month",
        "Private studios: €400-800/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "czechRepublic",
    name: "Czech Republic",
    highlights: [
      "Affordable education",
      "Rich history and culture",
      "Post-study work opportunities",
      "EU access after studies",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €1,500-5,000/year",
        "Living Costs: €500-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€4,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Czech Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €200-400/month",
        "Shared apartments: €300-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "romania",
    name: "Romania",
    highlights: [
      "Affordable education",
      "Rich culture and heritage",
      "Post-study work opportunities",
      "Gateway to the EU job market",
    ],
    details: {
      educationCosts: [
        "EU Students: Free",
        "Non-EU: €2,000-5,000/year",
        "Living Costs: €400-700/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Romanian Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €150-300/month",
        "Shared apartments: €250-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "china",
    name: "China",
    highlights: [
      "Affordable tuition fees",
      "Rich cultural heritage",
      "Growing job opportunities",
      "Study in a dynamic country",
    ],
    details: {
      educationCosts: [
        "EU Students: €2,000-8,000/year",
        "Non-EU: €2,000-8,000/year",
        "Living Costs: €400-800/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€5,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Chinese Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €200-400/month",
        "Shared apartments: €300-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "malaysia",
    name: "Malaysia",
    highlights: [
      "Affordable tuition fees",
      "Diverse culture",
      "Post-study work opportunities",
      "English as the main language",
    ],
    details: {
      educationCosts: [
        "EU Students: €2,000-8,000/year",
        "Non-EU: €2,000-8,000/year",
        "Living Costs: €400-700/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€4,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Malaysian Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €150-300/month",
        "Shared apartments: €250-500/month",
        "Private studios: €400-600/month",
      ],
      visaSuccessRate: "100%",
    },
  },
  {
    id: "thailand",
    name: "Thailand",
    highlights: [
      "Affordable education",
      "Rich cultural heritage",
      "Post-study work opportunities",
      "Gateway to Southeast Asia",
    ],
    details: {
      educationCosts: [
        "EU Students: €2,000-6,000/year",
        "Non-EU: €2,000-6,000/year",
        "Living Costs: €400-700/month",
      ],
      workOpportunities: [
        "20 hrs/week during studies",
        "Full-time during holidays",
        "Post-study work visa: 1 year",
      ],
      visaProcess: [
        "University admission",
        "Financial proof (€4,000/year)",
        "Health insurance",
        "Student visa application",
        "Processing Time: 1-2 months",
      ],
      scholarships: [
        "Thai Government Scholarships",
        "Erasmus+",
        "University scholarships",
      ],
      accommodation: [
        "Student housing: €150-300/month",
        "Shared apartments: €250-500/month",
        "Private studios: €400-700/month",
      ],
      visaSuccessRate: "100%",
    },
  },
];
