import { DunkDrivingIncident } from '../types/index.js';
export declare function scanStateForIncidents(state: string): Promise<DunkDrivingIncident[]>;
export declare function saveIncidents(incidents: DunkDrivingIncident[]): Promise<void>;
export declare function getTopIncidentsToday(limit?: number): Promise<DunkDrivingIncident[]>;
export declare function scanAllStates(): Promise<Map<string, DunkDrivingIncident[]>>;
//# sourceMappingURL=newsService.d.ts.map