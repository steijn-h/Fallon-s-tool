"use client";

import { useState, useTransition } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

import { importProspects, type ImportRow } from "@/lib/actions/import";
import { autoMapColumn, IMPORTABLE_FIELDS, type ImportableFieldKey } from "@/lib/import-mapping";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SheetCell = string | number | null;

const IGNORE_VALUE = "__ignore__";

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<SheetCell[][]>([]);
  const [mapping, setMapping] = useState<Record<number, ImportableFieldKey | null>>({});

  async function handleFile(file: File) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]!]!;
    const data = XLSX.utils.sheet_to_json<SheetCell[]>(sheet, { header: 1 });

    if (data.length === 0) {
      toast.error("Leeg bestand.");
      return;
    }

    const [headerRow, ...dataRows] = data;
    const headerStrings = (headerRow ?? []).map((h) => String(h ?? ""));
    setHeaders(headerStrings);
    setRows(dataRows);

    const nextMapping: Record<number, ImportableFieldKey | null> = {};
    headerStrings.forEach((header, index) => {
      nextMapping[index] = autoMapColumn(header);
    });
    setMapping(nextMapping);
  }

  function handleImport() {
    const mappedRows: ImportRow[] = rows
      .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
      .map((row) => {
        const record: Record<string, string> = {};
        row.forEach((cell, index) => {
          const field = mapping[index];
          if (field && cell !== null && cell !== undefined) {
            record[field] = String(cell);
          }
        });
        return record as unknown as ImportRow;
      })
      .filter((row) => "company" in row && String((row as Record<string, string>).company).trim() !== "");

    if (mappedRows.length === 0) {
      toast.error("Geen rijen met een bedrijfsnaam gevonden — controleer de kolomkoppeling.");
      return;
    }

    startTransition(async () => {
      const result = await importProspects(mappedRows);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.imported} prospects geïmporteerd, ${result.skipped} overgeslagen.`);
      setOpen(false);
      setHeaders([]);
      setRows([]);
      setMapping({});
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload /> Excel/CSV importeren
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prospects importeren</DialogTitle>
        </DialogHeader>

        {headers.length === 0 ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground hover:border-primary/50">
            <FileSpreadsheet className="size-8 text-muted-foreground" />
            Klik om een Excel- of CSV-bestand te kiezen
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Koppel elke kolom aan een veld. Kolommen zonder koppeling worden genegeerd.
            </p>
            <div className="max-h-96 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index} className="min-w-40">
                        <p className="mb-1 truncate font-medium text-foreground">{header || `Kolom ${index + 1}`}</p>
                        <select
                          value={mapping[index] ?? IGNORE_VALUE}
                          onChange={(e) =>
                            setMapping((prev) => ({
                              ...prev,
                              [index]: e.target.value === IGNORE_VALUE ? null : (e.target.value as ImportableFieldKey),
                            }))
                          }
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                        >
                          <option value={IGNORE_VALUE}>— Negeren —</option>
                          {IMPORTABLE_FIELDS.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((_, colIndex) => (
                        <TableCell key={colIndex} className="text-xs text-muted-foreground">
                          {row[colIndex] ?? ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              {rows.length} rijen gevonden — eerste 5 getoond ter controle.
            </p>
          </div>
        )}

        <DialogFooter>
          {headers.length > 0 ? (
            <Button variant="outline" onClick={() => { setHeaders([]); setRows([]); setMapping({}); }}>
              Ander bestand
            </Button>
          ) : null}
          <Button onClick={handleImport} disabled={pending || headers.length === 0}>
            {pending ? "Importeren..." : "Importeren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
