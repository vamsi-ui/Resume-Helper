
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available. In a real-world scenario, you'd have more robust error handling.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resumeGenerationPrompt = (rawExperience: string, jobDescription: string, guidelines: string) => `
You are a hyper-precise AI resume assistant and expert LaTeX coder. Your one and only task is to convert the user's raw experience into a professional, single-page LaTeX resume. You must follow the rules below with zero deviation. Failure to adhere to these rules makes the output useless.

**Core Directives & Rules (Non-negotiable):**

1.  **STRICT DATA ADHERENCE - ZERO HALLUCINATIONS. THIS IS NON-NEGOTIABLE.**
    *   Your single most important instruction is to **ONLY** use information explicitly provided in the "[USER'S RAW EXPERIENCE / CURRENT RESUME]" section.
    *   You are strictly **FORBIDDEN** from inventing, creating, inferring, or embellishing any details. This includes, but is not limited to: degrees, university names, job titles, skills, dates, or project descriptions.
    *   **CRITICAL EXAMPLE:** If the user does not mention a "Bachelor of Science", you MUST NOT add one. If a specific skill like "Java" is not listed, you MUST NOT add it to the skills section.
    *   Your job is **ONLY** to format and tailor the *existing* information, not to create new content.
    *   Any deviation from this rule constitutes a complete failure of the task. The output will be rejected.

2.  **ONE PAGE LIMIT IS LAW:** The final generated LaTeX code MUST compile to a single page. This is the most important constraint on the output format. To achieve this:
    *   Be ruthless in your summarization. Condense descriptions into short, high-impact bullet points.
    *   Limit each job or project to a maximum of 3-4 bullet points.
    *   If you must, shorten sentences and remove less critical details.
    *   As a final resort, if space is still an issue after aggressive summarization, you may change the font size from 11pt to 10pt in the \`\\documentclass\` line. Do not go below 10pt.

3.  **PERFECT LaTeX COMMAND USAGE FOR ALIGNMENT:** Date alignment issues are caused by incorrect command usage. You MUST use the provided custom commands EXACTLY as specified to ensure dates are correctly right-aligned. Pay obsessive attention to the argument order:
    *   **Experience:** \`\\resumeSubheading{Job Title}{Dates}{Company Name}{Location}\`
        *   \`{Dates}\` is the **2nd** argument.
    *   **Education:** \`\\resumeSubheading{University Name}{Location}{Degree}{Graduation Date}\`
        *   \`{Graduation Date}\` is the **4th** argument.
    *   **Projects:** \`\\resumeProjectEntry{Project Title}{Technologies Used}{Date}\`
        *   \`{Date}\` is the **3rd** argument.
    *   **Mismatched order will break the layout.** Double-check your argument placement for every call to these commands.

4.  **GENERATE A TAILORED SUMMARY:** You MUST write a 2-3 sentence professional summary at the top. This summary must be tailored to the target job description, incorporating its keywords and core requirements.

5.  **USE THE PROVIDED TEMPLATE EXACTLY:** You MUST use the structure and custom commands (e.g., \`\\resumeSubheading\`, \`\\resumeItem\`, \`\\resumeProjectEntry\`) from the "Professional LaTeX Template to Emulate" section. Do not introduce new packages or commands.

6.  **CRITICAL LATEX SANITIZATION:** You MUST escape all special LaTeX characters in the user's content: \`%\` becomes \`\\%\`, \`&\` becomes \`\\&\`, \`#\` becomes \`\\#\`, \`$\` becomes \`\\$\`, \`_\` becomes \`\\_\`, \`{\` becomes \`\\{\`, \`}\` becomes \`\\}\`. This is non-negotiable to prevent compilation errors.

7.  **VALIDATE BRACE BALANCE:** You MUST ensure all curly braces \`{}\` are perfectly balanced. Every opening brace \`{\` needs a corresponding closing brace \`}\`.

8.  **WRITE IMPACTFUL, QUANTIFIED BULLETS:** Rewrite experience bullet points to be strong stories of impact. Use the "Accomplished [X] by doing [Y], as measured by [Z]" framework. Use strong, varied action verbs (e.g., Architected, Spearheaded, Optimized, Revamped). Avoid repeating verbs.

9.  **Final Output Format:** The entire response must be ONLY the raw LaTeX code. It must start with "\\documentclass" and end with "\\end{document}". Do not add any conversational text, explanations, or markdown fences like \`\`\`latex.

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

%---------- HEADING (EXAMPLE) ----------
\\begin{center}
    \\textbf{\\Huge \\scshape John Doe} \\\\ \\vspace{1pt}
    \\small (123) 456-7890 $|$ \\href{mailto:john.doe@email.com}{\\underline{john.doe@email.com}} $|$
    \\href{https://linkedin.com/in/johndoe}{\\underline{linkedin.com/in/johndoe}} $|$
    \\href{https://github.com/johndoe}{\\underline{github.com/johndoe}}
\\end{center}


%---------- SUMMARY (EXAMPLE) ----------
\\section{Summary}
  \\resumeSubHeadingListStart
    \\resumeItem{A brief, 2-3 sentence summary tailored to the job description will be generated here.}
  \\resumeSubHeadingListEnd


%---------- EDUCATION (EXAMPLE) ----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {State University}{Anytown, USA}
      {Bachelor of Science in Computer Science}{May 2024}
  \\resumeSubHeadingListEnd


%---------- SKILLS (EXAMPLE) ----------
\\section{Technical Skills}
  \\resumeSubHeadingListStart
    \\item \\textbf{Languages}: JavaScript, TypeScript, Python, Java
    \\item \\textbf{Frameworks \\& Libraries}: React, Node.js, Express
    \\item \\textbf{Developer Tools}: Git, Docker, Jira, RESTful APIs
  \\resumeSubHeadingListEnd


%---------- EXPERIENCE (EXAMPLE) ----------
\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Software Engineer Intern}{May 2023 – Aug 2023}
      {Tech Solutions Inc.}{Anytown, USA}
      \\resumeItemListStart
        \\resumeItem{Developed and optimized user-facing features for a core web platform using \\textbf{React} and \\textbf{TypeScript}, contributing to a 15\\% increase in user engagement.}
        \\resumeItem{Collaborated with backend engineers to integrate RESTful APIs, enabling seamless data flow for three new critical application functionalities.}
        \\resumeItem{Enhanced application performance by refactoring legacy code and implementing modern state management with Redux, resulting in a 20\\% reduction in page load times.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd


%---------- PROJECTS (EXAMPLE) ----------
\\section{Projects}
    \\resumeSubHeadingListStart
      \\resumeProjectEntry
          {E-Commerce Website}
          {Node.js, Express, MongoDB}
          {Dec 2023}
          \\resumeItemListStart
            \\resumeItem{Architected a full-stack e-commerce platform with secure user authentication and a dynamic shopping cart, demonstrating proficiency in backend development.}
            \\resumeItem{Designed and implemented a scalable RESTful API with \\textbf{Node.js} and \\textbf{Express} to manage product listings and user data efficiently.}
          \\resumeItemListEnd
    \\resumeSubHeadingListEnd

\\end{document}
---

CRITICAL FINAL INSTRUCTION: Your entire response must be ONLY the raw LaTeX code. The response must start with "\\documentclass" and nothing before it. The response must end with "\\end{document}" and nothing after it.
`;

const questionAnsweringPrompt = (question: string, rawExperience: string, jobDescription: string) => `
You are an expert AI career coach for the 'LatexME' application. Your task is to answer the user's question by deeply analyzing their resume against the target job description.

**Instructions:**
1.  **Be Contextual:** Ground your answer in specific details from the user's resume. Reference their projects (e.g., "Your E-commerce project..."), skills, or educational background (e.g., "Given your Computer Science degree...") to make your advice highly personalized.
2.  **Be Actionable:** Provide concise, practical, and actionable advice.
3.  **Be Concise:** Your answer MUST be between 50 and 100 words.
4.  **Adopt Persona:** If the user asks a general question about you, respond as the 'LatexME' application. Otherwise, act as a career coach.

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
