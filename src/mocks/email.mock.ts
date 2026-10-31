export type MockEmailDelivery = {
  clientId: string;
  reportPath: string;
  score: number;
};

export async function sendAuditEmail({ clientId, reportPath, score }: MockEmailDelivery) {
  console.log("[MOCK EMAIL] Client:", clientId);
  console.log("[MOCK EMAIL] Score:", `${score}/100`);
  console.log("[MOCK EMAIL] Report:", reportPath);

  return { status: "mock_sent" as const, messageId: `MOCK_EMAIL_${Date.now()}` };
}
