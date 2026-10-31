export async function sendWhatsApp(clientId: string, reportPath: string, score: number) {
  console.log("[MOCK WHATSAPP] Client:", clientId);
  console.log("[MOCK WHATSAPP] Score:", `${score}/100`);
  console.log("[MOCK WHATSAPP] Report:", reportPath);

  return { status: "mock_sent" as const, sid: `MOCK_SID_${Date.now()}` };
}
