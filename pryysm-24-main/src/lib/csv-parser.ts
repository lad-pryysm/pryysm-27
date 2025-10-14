
"use client";

export function parseCsv(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("File could not be read."));
      }

      const text = event.target.result as string;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== ''); // Split lines and remove empty ones

      if (lines.length < 2) {
        return reject(new Error("CSV must have a header and at least one data row."));
      }

      const headers = lines[0].split(',').map(header => header.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const obj: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = values[j] ? values[j].trim() : '';
        }
        data.push(obj);
      }

      resolve(data);
    };

    reader.onerror = (event) => {
      reject(new Error("Error reading file: " + event.target?.error));
    };

    reader.readAsText(file);
  });
}
