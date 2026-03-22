export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  lastContactedDate: string;
  notes: string;
}

export interface Recommendation {
  name: string;
  reason: string;
  daysSince: number;
}