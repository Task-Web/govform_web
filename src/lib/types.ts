// State metadata - tracks versioning and timestamps
export interface StateMeta {
  created_at: string;
  updated_at: string;
  version: number;
  type: string;
}

// File metadata for uploaded files
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  filename: string;
  uploaded_at?: string;
}

// Form page data types
export interface Page1Data {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
}

export interface Page2Data {
  passport_number: string;
  visa_type: string;
  travel_purpose: string;
  arrival_date: string;
  departure_date: string;
}

export interface Page3Data {
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

// GovForm state data structure
export interface GovFormStateData {
  delay_seconds: number;
  form: {
    page1: Page1Data;
    page2: Page2Data;
    page3: Page3Data;
  };
  completed_pages: string[];
  uploads: FileMetadata[];
  [key: string]: unknown;
}

// User state with envelope structure (meta, data, note)
export interface UserState<T extends Record<string, unknown> = GovFormStateData> {
  meta: StateMeta;
  data: T;
  note: string | null;
}

// API response for state endpoints
export interface StateResponse<T extends Record<string, unknown> = GovFormStateData> {
  user_id: string;
  state: UserState<T>;
}

// Request body for PUT /api/state
export interface StateRequest<T extends Record<string, unknown> = Record<string, unknown>> {
  data: T;
  note?: string | null;
  meta?: Partial<StateMeta>;
}

// Request body for PATCH /api/state
export interface StatePatchRequest<T extends Record<string, unknown> = Record<string, unknown>> {
  data: Partial<T>;
  note?: string | null;
}

// Input for replaceState - allows partial meta
export interface ReplaceStateInput<T extends Record<string, unknown> = Record<string, unknown>> {
  data?: T;
  note?: string | null;
  meta?: Partial<StateMeta>;
}

// System info response
export interface InfoResponse {
  app_name: string;
  node_version: string;
  env: Record<string, string>;
  request: Record<string, unknown>;
}

export function createDefaultFormData(): GovFormStateData {
  return {
    delay_seconds: 0,
    form: {
      page1: {
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        nationality: "",
      },
      page2: {
        passport_number: "",
        visa_type: "",
        travel_purpose: "",
        arrival_date: "",
        departure_date: "",
      },
      page3: {
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "",
      },
    },
    completed_pages: [],
    uploads: [],
  };
}

export function createDefaultState(): UserState<GovFormStateData> {
  const now = new Date().toISOString();
  return {
    meta: {
      created_at: now,
      updated_at: now,
      version: 1,
      type: "govform",
    },
    data: createDefaultFormData(),
    note: null,
  };
}
