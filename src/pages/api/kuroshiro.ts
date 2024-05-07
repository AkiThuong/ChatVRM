/* eslint-disable */
import Kuroshiro from "kuroshiro";
// Initialize kuroshiro with an instance of analyzer (You could check the [apidoc](#initanalyzer) for more information):
// For this example, you should npm install and import the kuromoji analyzer first
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
// Instantiate:

import type { NextApiRequest, NextApiResponse } from "next/types";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = req.body.message;
  const convertTo = req.body.convertTo || "hiragana";
  const kuroshiro = new Kuroshiro();
  // Initialize
  // Here uses async/await, you could also use Promise
  await kuroshiro.init(new KuromojiAnalyzer());
  // Convert what you want:
  const result = await kuroshiro.convert(message, {
    to: convertTo,
    mode: "spaced",
  });

  res.status(200).json({ result: message });
}
