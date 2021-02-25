import {
  SupplierType,
  Contents
} from '../types';

export let fileReader = async (fileName: string, fileTag ? : SupplierType): Promise < Contents > => {
  const fs = require('fs');
  try {
    const fileContents = fs.readFileSync(fileName, {
      encoding: 'utf-8'
    });

    if (fileContents && fileTag) {
      return Promise.resolve({
          fileContents: fileContents,
          fileTag: fileTag
        } as Contents);
    } else if (fileContents) {
      return Promise.resolve({
          fileContents: fileContents
        } as Contents);
    }
  } catch (err: any) {
    console.log(`Error while reading file under the name: ${fileName}. \n Error: ${err}`);
    return Promise.reject(err);
  }
  return Promise.reject("");
};