import { SupplierType, Contents } from "../mods/types";

export let fileReader = async (
  fileName: string,
  fileTag?: SupplierType
): Promise<Contents> => {
  const fs = require("fs");
  try {
    const fileContents = fs.readFileSync(fileName, {
      encoding: "utf-8",
    });

    if (fileContents && fileTag) {
      return Promise.resolve({
        fileContents: fileContents,
        fileTag: fileTag,
      } as Contents);
    } else if (fileContents) {
      return Promise.resolve({
        fileContents: fileContents,
      } as Contents);
    }
  } catch (err) {
    console.log(
      `Error while reading file under the name: ${fileName}. \n Error: ${err}`
    );
    return Promise.reject(err);
  }
  return Promise.reject("");
};

// https://stackoverflow.com/a/51470002/9911187
export const combineArrays = (array_of_arrays: any): any => {
  // First, handle some degenerate cases...

  if (!array_of_arrays) {
    // Or maybe we should toss an exception...?
    return [];
  }

  if (!Array.isArray(array_of_arrays)) {
    // Or maybe we should toss an exception...?
    return [];
  }

  if (array_of_arrays.length == 0) {
    return [];
  }

  for (let i = 0; i < array_of_arrays.length; i++) {
    if (!Array.isArray(array_of_arrays[i]) || array_of_arrays[i].length == 0) {
      // If any of the arrays in array_of_arrays are not arrays or zero-length, return an empty array...
      return [];
    }
  }

  // Done with degenerate cases...

  // Start "odometer" with a 0 for each array in array_of_arrays.
  let odometer = new Array(array_of_arrays.length).fill(0);

  let output: any = [];

  let newCombination = formCombination(odometer, array_of_arrays);

  output.push(newCombination);

  while (odometer_increment(odometer, array_of_arrays)) {
    newCombination = formCombination(odometer, array_of_arrays);
    output.push(newCombination);
  }

  return output;
}; /* combineArrays() */

// Translate "odometer" to combinations from array_of_arrays
const formCombination = (odometer: any, array_of_arrays: any): any => {
  return odometer.reduce(
    (accumulator: any, odometer_value: any, odometer_index: any) => {
      return [...accumulator, array_of_arrays[odometer_index][odometer_value]];
    },
    []
  );
}; /* formCombination() */

const odometer_increment = (odometer: any, array_of_arrays: any): any => {
  for (
    let i_odometer_digit = odometer.length - 1;
    i_odometer_digit >= 0;
    i_odometer_digit--
  ) {
    let maxee = array_of_arrays[i_odometer_digit].length - 1;

    if (odometer[i_odometer_digit] + 1 <= maxee) {
      // increment, and you're done...
      odometer[i_odometer_digit]++;
      return true;
    } else {
      if (i_odometer_digit - 1 < 0) {
        // No more digits left to increment, end of the line...
        return false;
      } else {
        // Can't increment this digit, cycle it to zero and continue
        // the loop to go over to the next digit...
        odometer[i_odometer_digit] = 0;
        continue;
      }
    }
  } /* for( let odometer_digit = odometer.length-1; odometer_digit >=0; odometer_digit-- ) */
}; /* odometer_increment() */

//Helper functies to handle bignumbers
export const bnToBuf = (bn: any): Uint8Array => {
  const bigInt = require("big-integer");
  var hex = bigInt(bn).toString(16);
  if (hex.length % 2) {
    hex = "0" + hex;
  }

  var len = hex.length / 2; //of 16
  var u8 = new Uint8Array(len); //zoals hier

  var i = 0;
  var j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }

  //when input is single/small value/smallerthan128bit fill unit8array with zeros and paste input at the end of array
  if (bn.length <= 32) {
    var testa = new Uint8Array(16).fill(0);
    for (let i = 0; i < u8.length; i++) {
      testa[15 - i] = u8[u8.length - i - 1];
    }
  } else var testa = u8;

  return testa;
};

export const flattenDeep = (arr: any[]): any => {
  return arr.reduce(
    (acc: any, val: any) =>
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    []
  );
};

export const parseToDigitsArray = (str: string, base: number) => {
  const digits = str.split("");
  const ary: number[] = [];
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const n = parseInt(digits[i], base);
    if (Number.isNaN(n)) return null;
    ary.push(n);
  }
  return ary;
};

/** Helper function for the converting any base to any base
 */
export const add = (x: number[], y: number[], base: number) => {
  const z: number[] = [];
  const n = Math.max(x.length, y.length);
  let carry = 0;
  let i = 0;
  while (i < n || carry) {
    const xi = i < x.length ? x[i] : 0;
    const yi = i < y.length ? y[i] : 0;
    const zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i += 1;
  }
  return z;
};

/** Helper function for the converting any base to any base
 Returns a*x, where x is an array of decimal digits and a is an ordinary
 JavaScript number. base is the number base of the array x.
 */
export const multiplyByNumber = (num: number, x: number[], base: number) => {
  if (num < 0) throw "null";
  if (num === 0) return [];

  let result: number[] = [];
  let power = x;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-bitwise
    if (num & 1) {
      result = add(result, power, base);
    }
    num >>= 1; // eslint-disable-line
    if (num === 0) break;
    power = add(power, power, base);
  }
  return result;
};

/** Helper function for the converting any base to any base
 */
export const convertBase = (str: string, fromBase: number, toBase: number) => {
  const digits = parseToDigitsArray(str, fromBase);
  if (digits === null) throw "null";

  let outArray: number[] | null = [];
  let power: number[] | null = [1];
  for (let i = 0; i < digits.length; i += 1) {
    // invariant: at this point, fromBase^i = power
    if (digits[i]) {
      outArray = add(
        outArray,
        multiplyByNumber(digits[i], power, toBase),
        toBase
      );
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }

  let out = "";
  for (let i = outArray.length - 1; i >= 0; i -= 1) {
    out += outArray[i].toString(toBase);
  }
  // if the original input was equivalent to zero, then 'out' will still be empty ''. Let's check for zero.
  if (out === "") {
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
      sum += digits[i];
    }
    if (sum === 0) out = "0";
  }

  return out;
};

// Converts hex strings to decimal values
export const hexToDec = (hexStr: string) => {
  if (hexStr.substring(0, 2) === "0x") {
    return convertBase(hexStr.substring(2).toLowerCase(), 16, 10);
  }
  return convertBase(hexStr.toLowerCase(), 16, 10);
};
