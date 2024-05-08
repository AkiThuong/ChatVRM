import { loadSheet } from "./utils/googleSheetService";
import type { NextApiRequest, NextApiResponse } from "next/types";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await loadSheet(
      "13kHxmxYWqfPsI8Wy1sLGhIsxOjkK_XFf-lvDOCormFs",
      "PlanningTemplate (Aki)!B4:J100"
    );

    if (data && data.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    // Extract optional filters from the request body
    const {
      ownerFilter, // Could be a single name or an array of names
      startDateFilter, // Date string, e.g., '07/05/2024'
      dueDateFilter, // Date string, e.g., '08/05/2024'
    } = req.body;
    console.log(req.body);
    const headers = data ? data[0] : [];
    const jsonData =
      data && data.length > 0
        ? data
            .slice(1)
            .filter((row) => {
              const hasTitle = row.length > 0 && row[3];
              if (!hasTitle) return false;

              const taskOwner = row[4] ? row[4].trim() : null;
              const startDate = row[5]
                ? convertDateString(row[5].trim())
                : null;
              const dueDate = row[6] ? convertDateString(row[6].trim()) : null;

              // Owner filter
              const ownerMatch =
                !ownerFilter ||
                (taskOwner &&
                  (Array.isArray(ownerFilter)
                    ? taskOwner
                        .toLowerCase()
                        .split(",")
                        .some((taskOwnerItem) =>
                          ownerFilter
                            .map((item: string) => item.toLowerCase())
                            .includes(taskOwnerItem.trim())
                        )
                    : taskOwner
                        .toLowerCase()
                        .split(",")
                        .includes(ownerFilter.toLowerCase())));

              // Start date filter
              const startDateMatch =
                !startDateFilter ||
                (startDate &&
                  startDate >= new Date(convertDateString(startDateFilter)));

              // Due date filter
              const dueDateMatch =
                !dueDateFilter ||
                (dueDate &&
                  dueDate <= new Date(convertDateString(dueDateFilter)));

              return ownerMatch && startDateMatch && dueDateMatch;
            })
            .map((row) => {
              let obj = headers.reduce((acc, header, index) => {
                acc[header.trim()] = row[index] ? row[index].trim() : null;
                return acc;
              }, {});

              // Split TASK OWNER by comma and trim each name

              // Split TASK OWNER by comma and trim each name
              if (obj["TASK OWNER"]) {
                obj["TASK OWNER"] = obj["TASK OWNER"]
                  .split(",")
                  .map((name: string) => name.trim());
              }
              return obj;
            })
        : {};

    res.status(200).json(jsonData);
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

