export type BusinessTaskDraft={
 title:string;description:string;owner:string;priority:string;dueInDays:number;
 source:"BUSINESS_AI";approvalRequired:boolean;metadata?:Record<string,unknown>;
};

export function actionToTask(action:any,conversationId?:string):BusinessTaskDraft{
 return {
  title:action.title,
  description:action.description,
  owner:action.owner,
  priority:action.priority,
  dueInDays:action.dueInDays,
  source:"BUSINESS_AI",
  approvalRequired:true,
  metadata:{businessActionId:action.id,conversationId,expectedImpact:action.expectedImpact,estimatedBudget:action.estimatedBudget},
 };
}
