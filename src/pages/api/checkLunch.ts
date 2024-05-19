import { loadSheet } from "./utils/googleSheetService";
import type { NextApiRequest, NextApiResponse } from "next/types";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const today = formatDateToLocale(new Date());
    const data = await loadSheet(
      "1utnVUaRsgpRu5Li_l1K5c4EFncmuztHJ1eC0Dds6S8M",
      "Lunch!A1:J500"
    );

    if (data && data.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    // Extract optional filters from the request body
    const { userName } = req.body;
    console.log(req.body);
    console.log(today);

    const headers = data ? data[0] : [];
    console.log(headers);
    let userLunchDetails = null;
    for (let row of data) {
      if (row[2] === userName && row[5] === today) {
        // replace array indices based on your sheet structure
        userLunchDetails = {
          nickname: row[2],
          office: row[3],
          option: row[6],
          detail: row[7],
          img: row[8],
          receive_flg: row[9],
        }; // replace array indices based on your sheet structure
        break;
      }
    }
    res.status(200).json(userLunchDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch data from Google Sheets",
    });
  }
}

function convertDateString(dateStr: string) {
  const parts = dateStr.split("/");
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])); // months are 0-based in JS
}

function formatDateToLocale(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

