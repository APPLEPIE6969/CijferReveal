export const PARSER_VERSION = 2;
export function parseGrade(value: unknown): number | null {
 // Accept whole numeric values in both decimal notations; never parse labels,
 // percentages, signs or trailing text as grades.
 if(typeof value!=='string')return null;
 const text=value.trim();if(!/^(?:[1-9](?:[,.][0-9]{1,2})?|10(?:[,.]0{1,2})?)$/.test(text))return null;
 const grade=Number(text.replace(',','.'));return grade>=1&&grade<=10?grade:null;
}
