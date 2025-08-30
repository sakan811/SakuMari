/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

/**
 * Custom hook for managing authentication status and actions
 * @returns Object containing session data, status, credentials enabled flag, and auth functions
 */
export function useAuthStatus() {
  const { data: session, status } = useSession();
  const [credentialsEnabled, setCredentialsEnabled] = useState(false);

  useEffect(() => {
    // Fetch credentials provider status
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setCredentialsEnabled(data.credentialsEnabled))
      .catch(() => setCredentialsEnabled(false));
  }, []);

  return {
    session,
    status,
    credentialsEnabled,
    signIn,
    signOut,
  };
}
