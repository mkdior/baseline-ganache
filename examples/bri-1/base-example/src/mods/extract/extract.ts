import { fileReader } from "../../utils/utils";
import {
  Job,
  Req,
  Priority,
  Contents,
  SupplierType,
  FileStructure,
} from "../types";

let MJcodes: Req = {
  11: {
    spare: "none",
    vessel: "CTV",
    tech: 2,
    port: "no",
    taskLength: 1,
  },
  22: {
    spare: "none",
    vessel: "CTV",
    tech: 2,
    port: "no",
    taskLength: 1,
  },
  33: {
    spare: "GB oil",
    vessel: "CTV",
    tech: 2,
    port: "no",
    taskLength: 1,
  },
  44: {
    spare: "Gearbox replacement",
    vessel: "HLV",
    tech: 12,
    port: "yes",
    taskLength: 3,
  },
};

export const retrieveJobs = async (
  scheduleList: string[],
  priority: Priority
): Promise<Job[]> => {
  if (
    !scheduleList.filter((scheduleFileName: any) => {
      if (scheduleFileName.match(new RegExp(/[.]*.txt/)))
        return scheduleFileName;
    })
  )
    return [];

  let scheduleData: Contents[] = [];

  for (const _file of scheduleList) {
    await fileReader(_file)
      .then((data: Contents) => scheduleData.push(data))
      .catch((error: any) =>
        console.log(
          `Error while trying to read file ${_file}. Gracefully pass. \n Error details: ${error}`
        )
      );
  }
  if (scheduleData.length === 0) return [];

  // We have tasks which are of priority:
  // LOW || MEDIUM || HIGH
  let jobs: string[] = [];
  const prio =
    priority === Priority.HIGH
      ? "HIGH"
      : priority === Priority.MEDIUM
      ? "MED"
      : "LOW";

  for (const row of scheduleData) {
    const tempRow = row.fileContents.split("\n");
    for (const item of tempRow) {
      if (item.match(new RegExp(`"\\b${prio}\\b"`, "gi"))) {
        jobs.push(item.replace(/"/g, ""));
      }
    }
  }
  // There were no jobs, return an empty array.
  if (jobs.length === 0) return [];

  // Format the job.
  return jobFormatter(jobs);
};

const jobFormatter = (jobs: string[]): Job[] => {
  let formattedJobs: Job[] = [];
  for (const job of jobs) {
    // Expand the current job into a propper array.
    const _job: string[] = job.split(",");
    formattedJobs.push({
      id: parseInt(_job[0]) || -1,
      wtId: _job[2],
      mJCode: _job[3],
      tw: [parseInt(_job[4]) || -1, parseInt(_job[5]) || -1],
      reqs: MJcodes[parseInt(_job[3])],
    });
  }
  return formattedJobs;
};

// Can return multiple suppliers of same type, this is correct.
export const reqExpander = (jobs: Job[]): { [id: string]: SupplierType[] } => {
  let reqSupps: { [id: string]: SupplierType[] } = {};

  for (const job of jobs) {
    const taskId = job.id;
    const mjId = job.mJCode;
    // @TODO::Hamza -- Change the reqs structure, make it so that it's either false
    // if no supplier of sort X is needed or some other value which indicates the number
    // and/or type of supplier. As of now, stub this since we know what we need for each MJID.
    switch (mjId) {
      case "11" || "22": {
        reqSupps = {
          ...{
            ...reqSupps,
          },
          [taskId]: [SupplierType.TECHNICIAN, SupplierType.TECHNICIAN],
        };
        break;
      }
      case "33": {
        reqSupps = {
          ...{
            ...reqSupps,
          },
          [taskId]: [
            SupplierType.SPARE,
            SupplierType.TECHNICIAN,
            SupplierType.TECHNICIAN,
          ],
        };
        break;
      }
      case "44": {
        reqSupps = {
          ...{
            ...reqSupps,
          },
          [taskId]: [
            SupplierType.SPARE,
            SupplierType.PORT,
            ...new Array(12).fill(SupplierType.TECHNICIAN),
          ],
        };
        break;
      }
    }
  }

  return reqSupps;
};

// Checks if given job can be started with given suppliers.
export const jobCanBeStarted = (
  job: Job,
  suppliers: { [key: string]: FileStructure }
): boolean => {
  if (Object.keys(suppliers).length === 0) return false;
  // First get needed suppliers for the job
  const reqSupps: SupplierType[] = reqExpander([job])[job.id];

  if (reqSupps.length === 0) return false;

  // Reduce entries in reqSupps [3, 3, 3] ->>> [3]
  const singularSuppliers = reqSupps.reduce(
    (pVal: SupplierType[], cVal: SupplierType) => {
      if (!pVal.includes(cVal)) {
        return [...pVal, cVal];
      }
      return [...pVal];
    },
    []
  );

  // If any of the suppliers dont exist in the job's suppliers list return.
  for (const [_, value] of Object.entries(suppliers)) {
    if (!singularSuppliers.includes(value._type)) return false;
  }

  return true;
};
