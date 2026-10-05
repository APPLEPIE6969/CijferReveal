import type {DisplayResult} from '../somtoday/types';
export type Lifecycle='observed-nonnumeric'|'baseline'|'pending'|'opened'|'unresolved';
export interface StoredResult { key:string;scope:string;version:string;state:Lifecycle;numeric:boolean;firstSeen:number;lastResolvedState?:Lifecycle;display?:DisplayResult; }
export interface Settings { sound:boolean;volume:number;motion:'system'|'reduce'; }
export interface CollectionEntry extends DisplayResult { openedAt:number;scope:string; }
export interface State { schema:2;salt:string;records:Record<string,StoredResult>;coverage:Record<string,{overview:boolean;subject:boolean;armed:boolean}>;collection:CollectionEntry[];settings:Settings; }
export const defaultSettings:Settings={sound:true,volume:.7,motion:'system'};
export function newState():State {return {schema:2,salt:Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join(''),records:{},coverage:{},collection:[],settings:{...defaultSettings}};}
