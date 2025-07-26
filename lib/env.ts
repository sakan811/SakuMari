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

import { existsSync } from 'fs';

function isRunningInDocker(): boolean {
  return existsSync('/.dockerenv') || 
         process.env.DOCKER_CONTAINER === 'true' ||
         process.env.KUBERNETES_SERVICE_HOST !== undefined;
}

export function getDatabaseHost(): string {
  const autoDetect = process.env.AUTO_DETECT_DB_HOST === 'true';
  const fallbackHost = process.env.POSTGRES_HOST || 'localhost';
  
  if (!autoDetect) {
    return fallbackHost;
  }
  
  return isRunningInDocker() ? 'db' : 'localhost';
}

export function buildDatabaseUrl(options: {
  user: string;
  password: string;
  host?: string;
  port: string;
  database: string;
}): string {
  const host = options.host || getDatabaseHost();
  return `postgresql://${options.user}:${options.password}@${host}:${options.port}/${options.database}`;
}

export function getDatabaseUrls() {
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const port = process.env.POSTGRES_PORT || '5432';
  const database = process.env.POSTGRES_DB || 'kana_flashcard';
  
  const url = buildDatabaseUrl({ user, password, port, database });
  
  return {
    POSTGRES_PRISMA_URL: url,
    POSTGRES_URL_NON_POOLING: url,
  };
}