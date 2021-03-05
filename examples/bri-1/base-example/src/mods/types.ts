export enum Priority {
  HIGH = 1,
  MEDIUM,
  LOW,
}

export enum SupplierType {
  PORT = 1,
  SPARE, //2
  TECHNICIAN, //3
  VESSEL, //4
}

export interface TaskMetadata {
  timeWindow: number[];
  taskLength: number;
}

export interface FileContentStructure {
  supplierId: string;
  supplierCost: number;
  supplierReputation: number;
  supplierAvailability: number[];
}

export type FileStructure = {
  _type: SupplierType;
  _metaData?: TaskMetadata;
  _content: FileContentStructure;
};

export type Structure = {
  Ports: FileStructure[];
  Spares: FileStructure[];
  Technicians: FileStructure[];
  Vessels: FileStructure[];
};

export interface ReqContent {
  spare: string;
  vessel: string;
  tech: number;
  port: string;
  taskLength: number;
}

export interface Req {
  [key: number]: ReqContent;
}

export interface Job {
  id: number;
  wtId: string;
  mJCode: string;
  tw: number[];
  reqs: ReqContent;
}

export interface Contents {
  fileContents: any;
  fileTag?: any;
}

export type OverlapContainer = { [key: number]: { [key: string]: string[] } };
export type SupplierPreferenceData = {
  [id: string]: {
    supplierCost: number;
    supplierReputation: number;
    supplierType: SupplierType;
  };
}

export interface CommitmentMetaData {
  shieldAddr: string;
  verifierAddr: string;
  state: bigint;
}

export interface VerifierInterface {
	mjID: number;
	state: bigint;
	supplierID: bigint;
	docHash1: bigint;
	docHash2: bigint;
	contractH1: bigint;
	contractH2: bigint;
	lc1: bigint;
	lc2: bigint;
	nc1: bigint;
	nc2: bigint;
}

export interface SuppContainer {
	id: number;
	supplierID: bigint;
	docHash1: bigint;
	docHash2: bigint;
	contractH1: bigint;
	contractH2: bigint;
};
