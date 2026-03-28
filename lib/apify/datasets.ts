import { apifyClient } from "./client";

export async function fetchDatasetItems(datasetId: string): Promise<unknown[]> {
  return apifyClient.getDataset(datasetId);
}
