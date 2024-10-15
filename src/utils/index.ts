import mongoose from "mongoose";

export function isValidObjectId(id: string) {
  const ObjectId = mongoose.Types.ObjectId;
  if (ObjectId.isValid(id)) {
    return (String)(new ObjectId(id)) === id;

  }
  return false;
}

export function randomString(length = 6): string {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const slugify = (str: string, noDash?: boolean) => {
  str = str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/^-+|-+$/g, "");
  str.replace(/[\s_-]+/g, noDash ? "" : "-");
  return str;
};

export function shortCodify(str: string) {
  str = str.toLowerCase();
  return str.replace(/[^a-z0-9]/g, '');
}

export function enumToArray<T extends object>(enumObj: T): Array<T[keyof T]> {
  return Object.keys(enumObj)
    .filter(key => isNaN(Number(key))) // Filter out numeric keys
    .map(key => enumObj[key as keyof T]);
}


export function compareArrayString(source: any[], dest: any[]) {
  if (source.length !== dest.length) return false;

  const sortedArr1 = source.slice().sort();
  const sortedArr2 = dest.slice().sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) return false;
  }

  return true;
}
