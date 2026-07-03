import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const workflowAutomationService = {
  async list() {
    return prisma.workflow.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        nodes: true,
        connections: true,
        schedules: true,
        triggers: true,
      },
    });
  },

  async get(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { version: "desc" } },
        nodes: true,
        connections: true,
        variables: true,
        schedules: true,
        triggers: true,
        histories: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  async create(data: any, createdById?: string) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        triggerType: data.triggerType || "MANUAL",
        category: data.category,
        createdById,
        histories: {
          create: {
            action: "CREATED",
            message: "Workflow created",
            createdById,
          },
        },
      },
    });
  },

  async saveGraph(id: string, nodes: any[], connections: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.workflowConnection.deleteMany({ where: { workflowId: id } });
      await tx.workflowNode.deleteMany({ where: { workflowId: id } });

      if (nodes.length) {
        await tx.workflowNode.createMany({
          data: nodes.map((n) => ({
            workflowId: id,
            nodeKey: n.nodeKey,
            type: n.type,
            label: n.label,
            configJson: n.configJson as any,
            positionX: n.positionX || 0,
            positionY: n.positionY || 0,
          })),
        });
      }

      if (connections.length) {
        await tx.workflowConnection.createMany({
          data: connections.map((c) => ({
            workflowId: id,
            sourceKey: c.sourceKey,
            targetKey: c.targetKey,
            conditionJson: c.conditionJson as any,
          })),
        });
      }

      await tx.workflowHistory.create({
        data: {
          workflowId: id,
          action: "GRAPH_UPDATED",
          message: "Workflow graph updated",
        },
      });

      return tx.workflow.findUnique({
        where: { id },
        include: { nodes: true, connections: true },
      });
    });
  },

  async publish(id: string, createdById?: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: { nodes: true, connections: true },
    });

    if (!workflow) throw new Error("Workflow not found");

    const latest = await prisma.workflowVersion.findFirst({
      where: { workflowId: id },
      orderBy: { version: "desc" },
    });

    const version = (latest?.version || 0) + 1;

    return prisma.$transaction(async (tx) => {
      await tx.workflowVersion.create({
        data: {
          workflowId: id,
          version,
          status: "PUBLISHED",
          snapshotJson: workflow as any,
          createdById,
        },
      });

      await tx.workflowHistory.create({
        data: {
          workflowId: id,
          action: "PUBLISHED",
          message: `Workflow published as version ${version}`,
          createdById,
        },
      });

      return tx.workflow.update({
        where: { id },
        data: { status: "PUBLISHED", isActive: true },
      });
    });
  },

  async execute(id: string, inputJson: any = {}, triggerType = "MANUAL") {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: { nodes: true, connections: true },
    });

    if (!workflow) throw new Error("Workflow not found");
    if (!workflow.isActive) throw new Error("Workflow is not active");

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: "RUNNING",
        triggerType,
        inputJson,
        startedAt: new Date(),
        logs: {
          create: {
            level: "INFO",
            message: "Workflow execution started",
            dataJson: { triggerType, inputJson } as any,
          },
        },
      },
    });

    try {
      for (const node of workflow.nodes) {
        await prisma.workflowExecutionLog.create({
          data: {
            executionId: execution.id,
            nodeKey: node.nodeKey,
            level: "INFO",
            message: `Node executed: ${node.label}`,
            dataJson: {
              type: node.type,
              configJson: node.configJson,
            } as any,
          },
        });
      }

      return prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          outputJson: { message: "Workflow completed" } as any,
        },
      });
    } catch (error: any) {
      await prisma.workflowRetry.create({
        data: {
          executionId: execution.id,
          attempt: 1,
          status: "FAILED",
          error: error.message,
        },
      });

      return prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          error: error.message,
          completedAt: new Date(),
        },
      });
    }
  },

  async analytics() {
    const [total, success, failed, running] = await Promise.all([
      prisma.workflowExecution.count(),
      prisma.workflowExecution.count({ where: { status: "SUCCESS" } }),
      prisma.workflowExecution.count({ where: { status: "FAILED" } }),
      prisma.workflowExecution.count({ where: { status: "RUNNING" } }),
    ]);

    return {
      total,
      success,
      failed,
      running,
      successRate: total ? Math.round((success / total) * 100) : 0,
      failureRate: total ? Math.round((failed / total) * 100) : 0,
    };
  },

  async generateAiWorkflow(prompt: string) {
    return {
      name: "AI Generated Workflow",
      description: prompt,
      nodes: [
        { nodeKey: "start", type: "START", label: "Start", positionX: 100, positionY: 100 },
        { nodeKey: "condition", type: "CONDITION", label: "Check Condition", positionX: 350, positionY: 100 },
        { nodeKey: "notify", type: "NOTIFICATION", label: "Send Notification", positionX: 600, positionY: 100 },
        { nodeKey: "end", type: "END", label: "End", positionX: 850, positionY: 100 }
      ],
      connections: [
        { sourceKey: "start", targetKey: "condition" },
        { sourceKey: "condition", targetKey: "notify" },
        { sourceKey: "notify", targetKey: "end" }
      ],
    };
  },
};
