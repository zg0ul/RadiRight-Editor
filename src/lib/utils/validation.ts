import type { DecisionTreeFile, QuestionNode, Topic } from "../types/decision-tree";

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  nodeId?: string;
  topicId?: string;
}

export function validateTree(data: DecisionTreeFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Panel info validations
  if (!data.panel_info.id) {
    issues.push({
      type: "error",
      message: "Panel info missing ID",
    });
  }

  if (!data.panel_info.name) {
    issues.push({
      type: "error",
      message: "Panel info missing name",
    });
  }

  if (data.panel_info.nameAr?.startsWith("[Arabic:")) {
    issues.push({
      type: "warning",
      message: "Panel has placeholder Arabic name",
    });
  }

  // 2. Topic validations
  const topicIds = new Set<string>();
  for (const topic of data.topics) {
    // Duplicate topic ID check
    if (topicIds.has(topic.id)) {
      issues.push({
        type: "error",
        message: `Duplicate topic ID "${topic.id}"`,
        topicId: topic.id,
      });
    }
    topicIds.add(topic.id);

    // Root node exists within topic's nodes
    if (!topic.nodes[topic.rootNodeId]) {
      issues.push({
        type: "error",
        message: `Topic "${topic.name}" root node "${topic.rootNodeId}" not found`,
        topicId: topic.id,
      });
    }

    // Panel ID matches
    if (topic.panelId !== data.panel_info.id) {
      issues.push({
        type: "warning",
        message: `Topic "${topic.name}" has panelId "${topic.panelId}" but file panel is "${data.panel_info.id}"`,
        topicId: topic.id,
      });
    }

    // Arabic placeholder detection
    if (topic.nameAr.startsWith("[Arabic:")) {
      issues.push({
        type: "warning",
        message: `Topic "${topic.name}" has placeholder Arabic name`,
        topicId: topic.id,
      });
    }

    // Validate nodes within topic
    validateTopicNodes(topic, issues);
  }

  return issues;
}

function validateTopicNodes(topic: Topic, issues: ValidationIssue[]): void {
  const allNodeIds = new Set(Object.keys(topic.nodes));

  for (const [nodeId, node] of Object.entries(topic.nodes)) {
    if (node.type === "question") {
      const q = node as QuestionNode;

      // At least one option
      if (q.options.length === 0) {
        issues.push({
          type: "error",
          message: `Question node "${nodeId}" has no options`,
          nodeId,
          topicId: topic.id,
        });
      }

      // Check option references (must be within same topic)
      for (const opt of q.options) {
        if (opt.nextNodeId && !allNodeIds.has(opt.nextNodeId)) {
          issues.push({
            type: "error",
            message: `Option "${opt.id}" in node "${nodeId}" points to non-existent node "${opt.nextNodeId}"`,
            nodeId,
            topicId: topic.id,
          });
        }

        // Check conditional navigation targets
        if (opt.navigationRule?.type === "conditional") {
          for (const cond of opt.navigationRule.conditions) {
            if (!allNodeIds.has(cond.targetNodeId)) {
              issues.push({
                type: "error",
                message: `Conditional rule in option "${opt.id}" targets non-existent node "${cond.targetNodeId}"`,
                nodeId,
                topicId: topic.id,
              });
            }
          }
          if (!allNodeIds.has(opt.navigationRule.defaultNodeId)) {
            issues.push({
              type: "error",
              message: `Conditional rule default in option "${opt.id}" targets non-existent node "${opt.navigationRule.defaultNodeId}"`,
              nodeId,
              topicId: topic.id,
            });
          }
        }

        // Arabic placeholder
        if (opt.textAr.startsWith("[Arabic:")) {
          issues.push({
            type: "warning",
            message: `Option "${opt.id}" in node "${nodeId}" has placeholder Arabic text`,
            nodeId,
            topicId: topic.id,
          });
        }
      }

      // ID uniqueness within options
      const optIds = new Set<string>();
      for (const opt of q.options) {
        if (optIds.has(opt.id)) {
          issues.push({
            type: "error",
            message: `Duplicate option ID "${opt.id}" in node "${nodeId}"`,
            nodeId,
            topicId: topic.id,
          });
        }
        optIds.add(opt.id);
      }

      // Arabic placeholder for question text
      if (q.questionTextAr.startsWith("[Arabic:")) {
        issues.push({
          type: "warning",
          message: `Question node "${nodeId}" has placeholder Arabic text`,
          nodeId,
          topicId: topic.id,
        });
      }
    }

    if (node.type === "result") {
      if (node.recommendations.length === 0) {
        issues.push({
          type: "error",
          message: `Result node "${nodeId}" has no recommendations`,
          nodeId,
          topicId: topic.id,
        });
      }
    }

    // noGuidelines nodes don't require any additional validation
    // They just need summary text which is optional
  }

  // Orphan detection within topic
  if (topic.nodes[topic.rootNodeId]) {
    const reachable = new Set<string>();
    const stack = [topic.rootNodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (reachable.has(current)) continue;
      reachable.add(current);

      const node = topic.nodes[current];
      if (node?.type === "question") {
        for (const opt of (node as QuestionNode).options) {
          if (opt.nextNodeId && !reachable.has(opt.nextNodeId)) {
            stack.push(opt.nextNodeId);
          }
        }
      }
    }

    for (const nodeId of Object.keys(topic.nodes)) {
      if (!reachable.has(nodeId)) {
        issues.push({
          type: "warning",
          message: `Node "${nodeId}" in topic "${topic.name}" is unreachable from root`,
          nodeId,
          topicId: topic.id,
        });
      }
    }
  }

  // Cycle detection within topic
  if (topic.nodes[topic.rootNodeId]) {
    const visited = new Set<string>();
    const inStack = new Set<string>();

    function dfs(nodeId: string): boolean {
      if (inStack.has(nodeId)) return true; // cycle
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      inStack.add(nodeId);

      const node = topic.nodes[nodeId];
      if (node?.type === "question") {
        for (const opt of (node as QuestionNode).options) {
          if (opt.nextNodeId && topic.nodes[opt.nextNodeId]) {
            if (dfs(opt.nextNodeId)) return true;
          }
        }
      }
      inStack.delete(nodeId);
      return false;
    }

    if (dfs(topic.rootNodeId)) {
      issues.push({
        type: "error",
        message: `Topic "${topic.name}" contains a cycle in the decision tree`,
        topicId: topic.id,
      });
    }
  }

  // Node ID uniqueness within topic (already guaranteed by object keys, but check anyway)
  const seenIds = new Set<string>();
  for (const nodeId of Object.keys(topic.nodes)) {
    if (seenIds.has(nodeId)) {
      issues.push({
        type: "error",
        message: `Duplicate node ID "${nodeId}" in topic "${topic.name}"`,
        nodeId,
        topicId: topic.id,
      });
    }
    seenIds.add(nodeId);
  }
}
