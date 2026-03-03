import { nanoid } from "nanoid";

/**
 * Generate a unique node ID within a topic's nodes.
 * With nested nodes, IDs only need to be unique within the topic.
 * Format: q1, q2, q3... for questions, r1, r2, r_initial... for results
 */
export function generateNodeId(
  type: "question" | "result",
  existingNodeIds: string[]
): string {
  const typeChar = type === "question" ? "q" : "r";

  // Find highest existing number for this type
  const pattern = new RegExp(`^${typeChar}(\\d+)$`);
  let maxNum = 0;
  for (const id of existingNodeIds) {
    const match = id.match(pattern);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
  }

  // If we found numbered IDs, increment the max
  if (maxNum > 0 || existingNodeIds.some((id) => id.match(pattern))) {
    return `${typeChar}${maxNum + 1}`;
  }

  // First node of this type - start with 1
  if (!existingNodeIds.some((id) => id.startsWith(typeChar))) {
    return `${typeChar}1`;
  }

  // Fallback: use type + nanoid for uniqueness
  return `${typeChar}_${nanoid(6)}`;
}

/**
 * Generate a unique option ID within a node's options.
 * Format: a1, a2, a3...
 */
export function generateOptionId(existingOptionIds: string[]): string {
  const pattern = /^a(\d+)$/;
  let maxNum = 0;
  for (const id of existingOptionIds) {
    const match = id.match(pattern);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
  }
  return `a${maxNum + 1}`;
}

/**
 * Generate a descriptive result node ID.
 * Format: r_descriptive_name
 */
export function generateResultNodeId(
  description: string,
  existingNodeIds: string[]
): string {
  // Convert description to snake_case
  const base = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);

  const candidateId = `r_${base}`;

  // If unique, use it
  if (!existingNodeIds.includes(candidateId)) {
    return candidateId;
  }

  // Otherwise append a number
  let counter = 2;
  while (existingNodeIds.includes(`${candidateId}_${counter}`)) {
    counter++;
  }
  return `${candidateId}_${counter}`;
}

/**
 * Generate a topic ID from the topic name.
 * Format: snake_case version of the name
 */
export function generateTopicId(name: string, existingTopicIds: string[]): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  if (!existingTopicIds.includes(base)) {
    return base;
  }

  let counter = 2;
  while (existingTopicIds.includes(`${base}_${counter}`)) {
    counter++;
  }
  return `${base}_${counter}`;
}
