export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          fullName: string;
          email: string;
          role: "PATIENT" | "STAFF";
          note?: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          fullName: string;
          email: string;
          role?: "PATIENT" | "STAFF";
          note?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          fullName?: string;
          email?: string;
          role?: "PATIENT" | "STAFF";
          note?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
  };
};
