import { z } from "zod";

const comparisonOperatorSchema = z.enum([
  "equals",
  "notEquals",
  "greaterThan",
  "lessThan",
  "greaterOrEqual",
  "lessOrEqual",
  "contains",
  "anyOf",
]);

const navigationConditionSchema = z.object({
  contextKey: z.string(),
  operator: comparisonOperatorSchema,
  value: z.unknown(),
  targetNodeId: z.string(),
});

const navigationRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("direct"),
    nextNodeId: z.string(),
  }),
  z.object({
    type: z.literal("conditional"),
    conditions: z.array(navigationConditionSchema),
    defaultNodeId: z.string(),
  }),
  z.object({
    type: z.literal("computed"),
    computationKey: z.string(),
    parameters: z.record(z.string(), z.unknown()).optional(),
  }),
]);

const redFlagInfoSchema = z.object({
  category: z.string(),
  severity: z.string(),
  reason: z.string().optional(),
});

const scoreContributionSchema = z.object({
  modalityKey: z.string(),
  score: z.number(),
});

const answerOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  textAr: z.string(),
  nextNodeId: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  navigationRule: navigationRuleSchema.optional(),
  contextData: z.record(z.string(), z.unknown()).optional(),
  redFlag: redFlagInfoSchema.optional(),
  scoreImpact: scoreContributionSchema.optional(),
});

const appropriatenessLevelSchema = z.enum([
  "usuallyAppropriate",
  "mayBeAppropriate",
  "usuallyNotAppropriate",
  "noImagingIndicated",
]);

const radiationLevelSchema = z.enum(["none", "low", "medium", "high"]);

const imagingRecommendationSchema = z.object({
  modality: z.string(),
  modalityAr: z.string(),
  procedure: z.string(),
  procedureAr: z.string(),
  appropriateness: appropriatenessLevelSchema,
  radiation: radiationLevelSchema,
  score: z.number().optional(),
  comments: z.string().optional(),
  commentsAr: z.string().optional(),
});

// Node schemas - no longer have topicId (it's implicit from parent topic)
const questionNodeSchema = z.object({
  id: z.string(),
  type: z.literal("question"),
  questionText: z.string(),
  questionTextAr: z.string(),
  options: z.array(answerOptionSchema),
  hint: z.string().optional(),
  hintAr: z.string().optional(),
});

const resultNodeSchema = z.object({
  id: z.string(),
  type: z.literal("result"),
  summary: z.string().optional(),
  summaryAr: z.string().optional(),
  recommendations: z.array(imagingRecommendationSchema),
});

const decisionNodeSchema = z.discriminatedUnion("type", [
  questionNodeSchema,
  resultNodeSchema,
]);

// Panel info schema (single panel per file)
const panelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  iconName: z.string().optional(),
  isEnabled: z.boolean(),
});

// Topic schema with nested nodes
const topicSchema = z.object({
  id: z.string(),
  panelId: z.string(),
  name: z.string(),
  nameAr: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  iconName: z.string().optional(),
  rootNodeId: z.string(),
  isEnabled: z.boolean(),
  nodes: z.record(z.string(), decisionNodeSchema),
});

// Main file schema
export const decisionTreeFileSchema = z.object({
  panel_info: panelInfoSchema,
  topics: z.array(topicSchema),
});

export {
  panelInfoSchema,
  topicSchema,
  questionNodeSchema,
  resultNodeSchema,
  decisionNodeSchema,
  answerOptionSchema,
  imagingRecommendationSchema,
  navigationRuleSchema,
};
