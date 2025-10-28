
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available. In a real-world scenario, you'd have more robust error handling.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resumeGenerationPrompt = (rawExperience: string, jobDescription: string, guidelines: string) => `
You are an expert AI resume assistant and LaTeX designer. Your task is to convert the user's resume into a professional, single-page document using the provided high-quality LaTeX template and its custom commands.

Follow these rules with extreme precision:
1.  **MUST BE ONE PAGE:** The final output MUST be a single page. First, aggressively summarize bullet points. As a last resort, if the content still doesn't fit, you are authorized to reduce the base font size in the \\documentclass line from 11pt to 10pt, or even 9.5pt.
2.  **GENERATE A SUMMARY:** You MUST generate a 2-3 sentence professional summary at the top of the resume, right after the header. This summary must be hyper-tailored to the job description, using its keywords.
3.  **Use the Provided Template EXACTLY:** You MUST use the structure and custom commands (e.g., \\resumeSubheading, \\resumeItem, \\resumeProjectEntry) defined in the "Professional LaTeX Template to Emulate" section below. Do not deviate.
4.  **INCLUDE PROJECT DATES:** You MUST include dates for all projects. If dates are missing from the user's input, infer plausible, recent dates (e.g., "Feb 2024 – May 2024").
5.  **CRITICAL LATEX SANITIZATION:** You MUST escape all special LaTeX characters within the content you generate. Specifically: '%' must be '\\%', '&' must be '\\&', '#' must be '\\#', '$' must be '\\$', '_' must be '\\_', '{' must be '\\{', and '}' must be '\\}'. This is essential to prevent compilation errors.
6.  **VALIDATE BRACES:** You MUST ensure all curly braces \`{}\` are perfectly balanced in the final output. Every opening brace \`{\` must have a corresponding closing brace \`}\`. This is a separate and equally important rule to the sanitization/escaping rule.
7.  **Tailor to Job Description:** Rewrite the user's experience to highlight skills and accomplishments that directly match the target job description. Use strong action verbs and keywords from the description.
8.  **VARY ACTION VERBS:** You MUST NOT use the same action verb (e.g., "Developed," "Engineered," "Managed") more than twice in the entire resume. Use a diverse and powerful vocabulary to describe accomplishments (e.g., "Architected," "Spearheaded," "Optimized," "Revamped").
9.  **WRITE IMPACTFUL STORIES:** This is your most important task. Every bullet point MUST be a "strong story of impact." Do not just list tasks. Focus on the result and value of the work. Transform weak, task-based descriptions into compelling achievement narratives. For example, instead of "Collaborated with product teams to develop and consume RESTful APIs," a stronger version would be: "Partnered with product teams to architect and consume RESTful APIs, enabling three new user-facing financial workflows and boosting transaction settlement accuracy by 18%."
10. **AVOID JARGON AND CLICHÉS:** You MUST NOT use overused buzzwords or industry jargon. This includes phrases like "results-driven," "team player," "go-getter," "detail-oriented," "proactive," "strong foundation," "passionate," or "dynamic." Your writing must be direct, professional, and focused on concrete skills and achievements.
11. **Quantify Achievements:** Use the "Accomplished [X] as measured by [Y] by doing [Z]" framework. Invent plausible, professional metrics if they are missing but would strengthen the resume.
12. **Preserve Key Content:** You MUST reformat and enhance all key information from the user's original resume—every job, project, skill, and degree must be represented. However, you must condense the descriptions to fit one page.
13. **De-Clutter Skills & Projects:** Structure the 'Technical Skills' section into distinct categories on separate lines. For projects, use the new \\resumeProjectEntry command to place the technologies used on a separate line below the project title.
14. **Final Output Format:** The entire response must be ONLY the raw LaTeX code. It must start with "\\documentclass" and end with "\\end{document}". Do not add any conversational text, explanations, or markdown fences like \`\`\`latex.

**[TARGET JOB DESCRIPTION]**
---
${jobDescription}
---

**[USER'S RAW EXPERIENCE / CURRENT RESUME]**
---
${rawExperience}
---

**[PROFESSIONAL LATEX TEMPLATE TO EMULATE]**
---
\\documentclass[letterpaper,10pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% ----- Custom Commands -----
\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectEntry}[3]{ % {Project Title}{Technologies}{Date}
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textit{\\small #3} \\\\
      \\textit{\\small #2} & \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

% ----- Document Start -----
\\begin{document}

%---------- HEADING ----------
\\begin{center}
    \\textbf{\\Huge \\scshape Krishna Vamsi Penugonda} \\\\ \\vspace{1pt}
    \\small (315) 102-9001 $|$ \\href{mailto:kpenugon@stevens.edu}{\\underline{kpenugon@stevens.edu}} $|$
    \\href{https://linkedin.com/in/krishnapenugonda}{\\underline{linkedin.com/in/krishnapenugonda}} $|$
    \\href{https://github.com/kpenugonda}{\\underline{github.com/kpenugonda}}
\\end{center}

%---------- SUMMARY ----------
\\section{Summary}
  \\resumeSubHeadingListStart
    \\resumeItem{Frontend Engineer specializing in developing high-quality, user-facing features for complex web platforms. Proficient in modern JavaScript frameworks, including React and state management with Redux, focused on optimizing application performance and creating seamless user experiences. Eager to collaborate with cross-functional teams to build functional UIs.}
  \\resumeSubHeadingListEnd

%---------- EDUCATION ----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Stevens Institute of Technology}{Hoboken, NJ}
      {Master of Science in Computer Science}{Dec 2024}
    \\resumeSubheading
      {Amrita Vishwa Vidyapeetam}{Bengaluru, India}
      {Bachelor of Technology in Computer Science}{Aug 2022}
  \\resumeSubHeadingListEnd

%---------- SKILLS ----------
\\section{Technical Skills}
  \\resumeSubHeadingListStart
    \\item \\textbf{Languages}: JavaScript (ES6+), TypeScript, Python, Java, HTML5, CSS3, C++, C\\#
    \\item \\textbf{Frameworks \\& Libraries}: React, Redux, Node.js, Express, Jest, FastAPI, Flask, Spring Boot
    \\item \\textbf{Developer Tools}: Git, Docker, Webpack, Vite, RESTful APIs, AWS, PostgreSQL, MongoDB
  \\resumeSubHeadingListEnd

%---------- EXPERIENCE ----------
\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Backend Developer}{Feb 2024 – Present}
      {SettleKing Inc.}{Remote}
      \\resumeItemListStart
        \\resumeItem{Architected the frontend interaction model for a conversational AI agent, enhancing user experience by integrating personalized financial advice and real-time Q\\&A capabilities.}
        \\resumeItem{Partnered with product teams to develop and consume RESTful APIs, powering user-facing financial workflows and improving transaction settlement accuracy.}
        \\resumeItem{Optimized overall system performance by 30\\% through a streamlined logging framework, ensuring high-speed, scalable interactions in high-traffic user environments.}
      \\resumeItemListEnd
    \\resumeSubheading
      {Assistant System Engineer}{Aug 2022 – Aug 2023}
      {Tata Consultancy Services}{Bengaluru, India}
      \\resumeItemListStart
        \\resumeItem{Spearheaded the development of a user-facing data analytics platform, visualizing insights from over 500,000 documents which cut manual review time by 70\\%.}
        \\resumeItem{Implemented rigorous debugging and testing protocols for key application components, ensuring stable deployments and maintaining high system reliability for end-users.}
        \\resumeItem{Boosted application responsiveness by enhancing database query speeds by 30\\% through advanced indexing, directly improving the data retrieval experience for frontend users.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%---------- PROJECTS ----------
\\section{Projects}
    \\resumeSubHeadingListStart
      \\resumeProjectEntry
          {DuckPal – Study Partner Matching Platform}
          {React, Redux, Node.js, Express, MongoDB, JWT}
          {Feb 2024 – May 2024}
          \\resumeItemListStart
            \\resumeItem{Developed a responsive, full-stack study-matching platform using \\textbf{React} and \\textbf{Redux}, creating a seamless peer collaboration experience for over 200 students.}
            \\resumeItem{Engineered secure user authentication with JWT and built robust client-side validation, reducing form submission errors by 30\\% and enhancing the user onboarding flow.}
            \\resumeItem{Designed and deployed scalable \\textbf{Node.js} and \\textbf{Express} RESTful APIs to serve the React client, increasing system scalability by 40\\%.}
          \\resumeItemListEnd
      \\resumeProjectEntry
          {Project Risk Extraction and Mitigation}
          {Python, FastAPI, PostgreSQL, MongoDB, LLMs}
          {Sep 2023 – Dec 2023}
          \\resumeItemListStart
            \\resumeItem{Revamped a large-scale data platform using LLMs to analyze 500,000+ unstructured documents, increasing operational efficiency for data review.}
            \\resumeItem{Built scalable backend microservices with FastAPI, ensuring low-latency data availability for high-throughput, user-facing interactions.}
          \\resumeItemListEnd
      \\resumeProjectEntry
          {Real-Time EEG Communication System}
          {Python, TensorFlow, Keras, Flask, WebSockets}
          {Jan 2023 – May 2023}
          \\resumeItemListStart
            \\resumeItem{Constructed a real-time web application for EEG-based communication, visualizing imagined speech classification data via a Flask and WebSocket-powered interface.}
            \\resumeItem{Integrated a TensorFlow machine learning model to decode EEG signals, improving classification accuracy by 15\\% and reducing processing latency by 200ms.}
          \\resumeItemListEnd
    \\resumeSubHeadingListEnd

\\end{document}
---

CRITICAL FINAL INSTRUCTION: Your entire response must be ONLY the raw LaTeX code. The response must start with "\\documentclass" and nothing before it. The response must end with "\\end{document}" and nothing after it.
`;

const questionAnsweringPrompt = (question: string, rawExperience: string, jobDescription: string) => `
You are an expert AI career coach. Your task is to answer the user's question based on the provided resume and the target job description. Provide concise, actionable, and personalized advice. Your answer MUST be between 50 and 100 words.

[USER'S RESUME]
---
${rawExperience}
---

[TARGET JOB DESCRIPTION]
---
${jobDescription}
---

**Question:** "${question}"

**Answer:**
`;

export const generateResume = async (rawExperience: string, jobDescription: string, guidelines: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: resumeGenerationPrompt(rawExperience, jobDescription, guidelines)
    });
    // Clean the response to ensure it's valid LaTeX
    let latexCode = response.text;
    // Remove Markdown code block fences
    latexCode = latexCode.replace(/^```latex\s*/, '').replace(/```\s*$/, '');
    // Trim any leading/trailing whitespace
    latexCode = latexCode.trim();
    return latexCode;
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("Failed to communicate with the Gemini API for resume generation.");
  }
};

export const answerQuestion = async (question: string, rawExperience: string, jobDescription: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: questionAnsweringPrompt(question, rawExperience, jobDescription)
        });
        return response.text;
    } catch (error) {
        console.error("Error answering question:", error);
        throw new Error("Failed to communicate with the Gemini API for Q&A.");
    }
};
