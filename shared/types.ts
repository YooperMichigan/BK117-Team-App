// Types shared by the server and the front end.

/** Every POC response is wrapped so the UI can show that it is sample data. */
export interface SampleResponse<T> {
  sample: true;
  data: T;
}

export interface CheckPilot {
  id: number;
  name: string;
}

export type MeetingStatus = 'upcoming' | 'held';

export interface MeetingSummary {
  id: number;
  title: string;
  date: string; // ISO date, YYYY-MM-DD
  startTime: string; // 24h HH:MM
  location: string;
  status: MeetingStatus;
  itemCount: number;
  totalMinutes: number;
}

export type AgendaItemStatus = 'open' | 'discussed' | 'carried';

export interface AgendaItem {
  id: number;
  meetingId: number;
  position: number;
  title: string;
  presenterId: number | null;
  presenterName: string | null;
  minutes: number;
  notes: string;
  status: AgendaItemStatus;
  /** Date of the meeting this item was carried over from, if any. */
  carriedFromDate: string | null;
}

export interface Meeting extends MeetingSummary {
  items: AgendaItem[];
}

export interface NewMeeting {
  title: string;
  date: string;
  startTime: string;
  location: string;
}

export interface NewAgendaItem {
  title: string;
  presenterId: number | null;
  minutes: number;
}

export type AgendaItemPatch = Partial<Pick<AgendaItem, 'title' | 'presenterId' | 'minutes' | 'notes' | 'status'>>;

export interface CarryOverResult {
  carried: number;
  toMeetingId: number;
}
