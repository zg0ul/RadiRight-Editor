// TypeScript types matching the Dart/Freezed models in radi_right
// Updated for nested nodes structure

export interface PanelInfo {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  iconName?: string;
  isEnabled: boolean;
}

export interface Topic {
  id: string;
  panelId: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  iconName?: string;
  rootNodeId: string;
  isEnabled: boolean;
  nodes: Record<string, DecisionNode>;
}

export interface QuestionNode {
  id: string;
  type: "question";
  questionText: string;
  questionTextAr: string;
  options: AnswerOption[];
  hint?: string;
  hintAr?: string;
}

export interface ResultNode {
  id: string;
  type: "result";
  summary?: string;
  summaryAr?: string;
  recommendations: ImagingRecommendation[];
}

export interface NoGuidelinesNode {
  id: string;
  type: "noGuidelines";
  summary?: string;
  summaryAr?: string;
}

export type DecisionNode = QuestionNode | ResultNode | NoGuidelinesNode;

export interface AnswerOption {
  id: string;
  text: string;
  textAr: string;
  nextNodeId: string;
  description?: string;
  descriptionAr?: string;
  navigationRule?: NavigationRule;
  contextData?: Record<string, unknown>;
  redFlag?: RedFlagInfo;
  scoreImpact?: ScoreContribution;
}

export type NavigationRule =
  | DirectNavigation
  | ConditionalNavigation
  | ComputedNavigation;

export interface DirectNavigation {
  type: "direct";
  nextNodeId: string;
}

export interface ConditionalNavigation {
  type: "conditional";
  conditions: NavigationCondition[];
  defaultNodeId: string;
}

export interface ComputedNavigation {
  type: "computed";
  computationKey: string;
  parameters?: Record<string, unknown>;
}

export interface NavigationCondition {
  contextKey: string;
  operator: ComparisonOperator;
  value: unknown;
  targetNodeId: string;
}

export type ComparisonOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "greaterOrEqual"
  | "lessOrEqual"
  | "contains"
  | "anyOf";

export interface RedFlagInfo {
  category: string;
  severity: string;
  reason?: string;
}

export interface ScoreContribution {
  modalityKey: string;
  score: number;
}

export interface ImagingRecommendation {
  modality: string;
  modalityAr: string;
  procedure: string;
  procedureAr: string;
  appropriateness: AppropriatenessLevel;
  radiation: RadiationLevel;
  score?: number;
  comments?: string;
  commentsAr?: string;
  /**
   * Priority level for matching logic:
   * 1 = primary/best choice (indicated)
   * 2 = acceptable alternative (may be appropriate)
   */
  priority?: number;
}

export type AppropriatenessLevel =
  | "usuallyAppropriate"
  | "mayBeAppropriate"
  | "usuallyNotAppropriate"
  | "noImagingIndicated";

export type RadiationLevel = "none" | "low" | "medium" | "high";

/**
 * The structure of a decision tree JSON file.
 * Each file contains one panel with its topics and nested nodes.
 */
export interface DecisionTreeFile {
  panel_info: PanelInfo;
  topics: Topic[];
}

// Helper type guards
export function isQuestionNode(node: DecisionNode): node is QuestionNode {
  return node.type === "question";
}

export function isResultNode(node: DecisionNode): node is ResultNode {
  return node.type === "result";
}

export function isNoGuidelinesNode(node: DecisionNode): node is NoGuidelinesNode {
  return node.type === "noGuidelines";
}

// Helper to get all nodes from all topics (for backwards compatibility)
export function getAllNodes(
  file: DecisionTreeFile,
): Record<string, DecisionNode> {
  const allNodes: Record<string, DecisionNode> = {};
  for (const topic of file.topics) {
    for (const [nodeId, node] of Object.entries(topic.nodes)) {
      // Prefix with topic ID to ensure uniqueness across topics
      allNodes[`${topic.id}:${nodeId}`] = node;
    }
  }
  return allNodes;
}

// Helper to find which topic a node belongs to
export function findTopicForNode(
  file: DecisionTreeFile,
  nodeId: string,
): Topic | undefined {
  for (const topic of file.topics) {
    if (topic.nodes[nodeId]) {
      return topic;
    }
  }
  return undefined;
}
