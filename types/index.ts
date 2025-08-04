// src/types/index.ts

export type QualificationType = 'Qualification' | 'Skillset' | 'Unit';

export interface LinkedUnit {
  code: string;
  title: string;
  status: string;
}

export interface QualificationEntry {
  id: string;
  user_id: string;
  code: string;
  title: string;
  provider: string;
  rto_code: string;
  date_awarded: string;
  status: string;
  superseded_by: string;
  type: QualificationType;
  linked_units?: LinkedUnit[];
}

export interface StandaloneUnitEntry {
  id: string;
  user_id: string;
  code: string;
  title: string;
  provider: string;
  rto_code: string;
  date_awarded: string;
  status: string;
  superseded_by: string;
  type: 'Unit';
}

export interface QualificationMap {
  [code: string]: {
    title: string;
    status: string;
    supersededBy: string;
    type: QualificationType;
    linkedUnits?: LinkedUnit[];
  };
}

export interface RtoLookup {
  [rtoCode: string]: {
    name: string;
  };
}
