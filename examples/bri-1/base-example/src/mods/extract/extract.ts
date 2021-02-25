import {
  fileReader
} from '../utils/utils';
import {
  Priority,
	Contents,
  Job,
  Req
} from '../types';

let MJcodes: Req = {
  11: { 
    spare: "none",
    vessel: "CTV",
    tech: 2,
    port: "none",
    taskLength: 1
  },
  22: {
    spare: "none",
    vessel: "CTV",
    tech: 2,
    port: "no",
    taskLength: 1
  },
  33: {
    spare: "GB oil",
    vessel: "CTV",
    tech: 2,
    port: "no",
    taskLength: 1
  },
  44: {
    spare: "Gearbox replacement",
    vessel: "HLV",
    tech: 12,
    port: "yes",
    taskLength: 3
  }
};

export const retrieveJobs = async (scheduleList: string[], priority: Priority) => {
  if (!scheduleList.filter(
      (scheduleFileName: any) => {
        if (scheduleFileName.match(new RegExp(/[.]*.txt/))) return scheduleFileName;
      }
    )) return;

  let scheduleData: Contents[] = [];

  for (const _file of scheduleList) {
    await fileReader(_file)
      .then((data: Contents) => scheduleData.push(data))
      .catch((error: any) => console.log(`Error while trying to read file ${_file}. Gracefully pass. \n Error details: ${error}`));
  }
  if (scheduleData.length === 0) return;

  // We have tasks which are of priority:
  // LOW || MEDIUM || HIGH
  let jobs: string[] = [];
  const prio = (priority === Priority.HIGH) ? "HIGH" : ((priority === Priority.MEDIUM) ? "MED" : "LOW");

  for (const row of scheduleData) {
    const tempRow = row.fileContents.split('\n');
    for (const item of tempRow) {
      if (item.match(new RegExp(`"\\b${prio}\\b"`, 'gi'))) {
        jobs.push(item.replace(/"/g, ""));
      }
    }
  }
  // There were no jobs, return an empty array.
  if (jobs.length === 0) return;

  // Format the job.
  const fJobs = jobFormatter(jobs);
  console.log(JSON.stringify(fJobs, undefined, 2));
};

const jobFormatter = (jobs: string[]): Job[] => {
  let formattedJobs: Job[] = [];
  for (const job of jobs) {
    // Expand the current job into a propper array.
    const _job: string[] = job.split(',');
    formattedJobs.push({
      id: parseInt(_job[0]) || -1,
      wtId: _job[2],
      mJCode: _job[3],
      tw: [parseInt(_job[4]) || -1, parseInt(_job[5]) || -1],
      reqs: MJcodes[parseInt(_job[3])]
    });
  }
  return formattedJobs;
}