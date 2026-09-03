export type DealStage = "Lead" | "Qualified" | "Proposal" | "Won" | "Lost";

export interface DealActivity {
  id: string;
  date: string;
  type: "Call" | "Email" | "Meeting" | "Note";
  summary: string;
}

export interface Deal {
  id: string;
  company: string;
  owner: string;
  amount: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  activity: DealActivity[];
}
