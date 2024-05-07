// lib/googleSheetsService.ts
import { google } from "googleapis";

export async function loadSheet(spreadsheetId: string, range: string) {
  const credentialsJSON = Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    "base64"
  ).toString("utf8");

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentialsJSON),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  } catch (error) {
    console.error("Error loading sheet data:", error);
    throw new Error("Failed to fetch data from Google Sheets");
  }
}

