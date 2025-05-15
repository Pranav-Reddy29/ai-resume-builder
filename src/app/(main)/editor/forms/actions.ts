"use server";

import cohere from "@/lib/cohere";
import {
  generateSummarySchema,
  generateWorkExperienceSchema,
  GenerateSummaryInput,
  GenerateWorkExperienceInput,
  WorkExperience,
} from "@/lib/validation";

// ✅ Generate resume summary
export async function generateSummary(input: GenerateSummaryInput) {
  const { jobTitle, workExperiences, educations, skills } = generateSummarySchema.parse(input);

  const resumeText = `
Job Title: ${jobTitle || ""}

Work Experience:
${workExperiences?.map(exp =>
  `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"}): ${exp.description}`
).join("\n")}

Education:
${educations?.map(edu =>
  `- ${edu.degree} at ${edu.school} (${edu.startDate} - ${edu.endDate})`
).join("\n")}

Skills: ${skills?.join(", ")}
`;

  const prompt = `
You are an expert resume assistant. Based on the following details, generate a concise and professional resume summary suitable for the top of a resume. Do not include explanations—just the summary by highlighting the skills and it should be atleast of 3-4 lines in justified way.

${resumeText}
`;

  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = response.message?.content?.map(c => c.text).join("").trim();

    if (!aiResponse) throw new Error("Cohere returned no summary");

    return aiResponse;
  } catch (error) {
    console.error("Error generating summary with Cohere:", error);
    throw new Error("Failed to generate resume summary.");
  }
}

// ✅ Generate a single work experience entry
export async function generateWorkExperience(input: GenerateWorkExperienceInput): Promise<WorkExperience> {
  const { description } = generateWorkExperienceSchema.parse(input);

  const prompt = `
You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input.
Your response must adhere to the following structure. You can omit fields if they can't be inferred from the provided data, but don't add any new ones and it should be in justifyed and point and points should be in • format.

Job title: <job title>
Company: <company name>
Start date: <format: YYYY-MM-DD> (only if provided)
End date: <format: YYYY-MM-DD> (only if provided)
Description: <an optimized description in bullet format, might be inferred from the job title>
`;

  const userMessage = `
Please provide a work experience entry from this description:
${description}
`;

  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [{ role: "user", content: `${prompt}\n${userMessage}` }],
    });

    const aiResponse = response.message?.content?.map(c => c.text).join("").trim();

    if (!aiResponse) throw new Error("Cohere returned no work experience");

    return {
      position: aiResponse.match(/Job title: (.*)/)?.[1]?.trim() || "",
      company: aiResponse.match(/Company: (.*)/)?.[1]?.trim() || "",
      description: aiResponse.match(/Description:([\s\S]*)/)?.[1]?.trim() || "",
      startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
      endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
    };
  } catch (error) {
    console.error("Error generating work experience with Cohere:", error);
    throw new Error("Failed to generate work experience.");
  }
}
