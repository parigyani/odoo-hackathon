import bcrypt from "bcryptjs";

const LOCK_THRESHOLD = 5;
const LOCK_MINUTES = 15;

(async () => {
  console.log("Setting up mock database user...");
  const mockUser = {
    id: 1,
    email: "manager@transitops.com",
    password_hash: await bcrypt.hash("CorrectPassword123", 10),
    role: "fleet_manager",
    failed_attempts: 0,
    locked_until: null
  };

  async function simulateLoginAttempt(password) {
    if (mockUser.locked_until && new Date(mockUser.locked_until) > new Date()) {
      const minsLeft = Math.ceil((new Date(mockUser.locked_until) - new Date()) / 60000);
      return `[423 Locked] Account locked. Try again in ${minsLeft} minute(s).`;
    }
    const valid = await bcrypt.compare(password, mockUser.password_hash);
    if (!valid) {
      const attempts = mockUser.failed_attempts + 1;
      const locked = attempts > LOCK_THRESHOLD;
      mockUser.failed_attempts = locked ? 0 : attempts;
      mockUser.locked_until = locked ? new Date(Date.now() + LOCK_MINUTES * 60000) : null;
      if (locked) {
        return `[423 Locked] Account locked after more than ${LOCK_THRESHOLD} failed attempts.`;
      }
      return `[401 Unauthorized] Invalid credentials. (Attempt ${attempts} of ${LOCK_THRESHOLD})`;
    }
    mockUser.failed_attempts = 0;
    mockUser.locked_until = null;
    return "[200 OK] Login successful!";
  }

  console.log("\n--- Simulating 7 Consecutive Failed Logins ---\n");
  for (let i = 1; i <= 7; i++) {
    console.log(`Attempt ${i} (wrong password):`);
    const result = await simulateLoginAttempt("wrongpassword");
    console.log(`Response: ${result}\n`);
  }
})();
