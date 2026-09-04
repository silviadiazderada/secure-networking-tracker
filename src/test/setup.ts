// Loads local env for tests that talk to Neon (the RLS isolation test).
// The validation unit test needs none of this.
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });
