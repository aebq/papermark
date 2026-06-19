import ViewedDocumentEmail from "@/components/emails/viewed-document";

import { sendEmail } from "@/lib/resend";

export const sendViewedDocumentEmail = async ({
  ownerEmail,
  documentId,
  documentName,
  linkName,
  viewerEmail,
  teamMembers,
  locationString,
  details,
}: {
  ownerEmail: string | null;
  documentId: string;
  documentName: string;
  linkName: string;
  viewerEmail: string | null;
  teamMembers?: string[];
  locationString?: string;
  details?: {
    location: string | null;
    time: string | null;
    browser: string | null;
    device: string | null;
    ip: string | null;
  };
}) => {
  const emailTemplate = ViewedDocumentEmail({
    documentId,
    documentName,
    linkName,
    viewerEmail,
    locationString,
    details,
  });
  try {
    if (!ownerEmail) {
      throw new Error("Document Owner not found");
    }

    let subjectLine: string = `Your document has been viewed: ${documentName}`;
    if (viewerEmail) {
      subjectLine = `${viewerEmail} viewed the document: ${documentName}`;
    }

    const data = await sendEmail({
      to: ownerEmail,
      cc: teamMembers,
      subject: subjectLine,
      react: emailTemplate,
      test: process.env.NODE_ENV === "development",
      system: true,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};
