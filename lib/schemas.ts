import { Type } from "@google/genai";

/** JSON schema for the structured complaint draft (Call 2). */
export const complaintSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Short heading for the complaint, e.g. 'Complaint for non-payment of wages'.",
    },
    authorityName: {
      type: Type.STRING,
      description: "The office/authority the complaint is addressed to.",
    },
    authorityAddress: {
      type: Type.STRING,
      description: "Postal address of that authority (use a known Delhi labour office).",
    },
    subject: { type: Type.STRING, description: "The 'Subject:' line of the letter." },
    body: {
      type: Type.STRING,
      description:
        "The full complaint letter as plain text with line breaks (\\n). Include salutation, facts, the law relied on, the relief sought, and a signature block with placeholders.",
    },
    requiredDocuments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Documents the worker should attach.",
    },
    helpline: { type: Type.STRING, description: "Relevant helpline number." },
    howToSubmit: {
      type: Type.STRING,
      description: "Plain steps for where and how to submit the complaint.",
    },
    disclaimer: {
      type: Type.STRING,
      description: "Short note that this is a template, not legal advice.",
    },
  },
  required: [
    "title",
    "authorityName",
    "authorityAddress",
    "subject",
    "body",
    "requiredDocuments",
    "helpline",
    "howToSubmit",
    "disclaimer",
  ],
  propertyOrdering: [
    "title",
    "authorityName",
    "authorityAddress",
    "subject",
    "body",
    "requiredDocuments",
    "helpline",
    "howToSubmit",
    "disclaimer",
  ],
};
