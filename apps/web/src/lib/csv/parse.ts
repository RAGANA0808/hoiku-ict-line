export type CsvRow = Record<string, string>;

export type ParseResult =
  | { ok: true; rows: CsvRow[]; headers: string[] }
  | { ok: false; error: string };

const splitLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
};

export const parseCsv = (text: string): ParseResult => {
  const cleaned = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!cleaned) return { ok: false, error: 'CSVが空です。' };
  const lines = cleaned.split('\n');
  const headers = splitLine(lines[0]!).map((h) => h.trim());
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cols = splitLine(line);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return { ok: true, rows, headers };
};
