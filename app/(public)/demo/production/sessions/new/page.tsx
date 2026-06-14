"use client";

import { useState, useCallback } from "react";
import {
  Title,
  Panel,
  Button,
  Selectbox,
  Input,
  NumberInput,
  DateInput,
  TimeInput,
  Textarea,
  Grid,
  Column,
} from "@/components/bpm";
import {
  calculateTRS,
  calculateAvailability,
  calculatePerformance,
  calculateQuality,
} from "@/lib/compute";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../strings";

const LINES = [
  { value: "EXT-A", label: "Ligne Extrudeur A" },
  { value: "EXT-B", label: "Ligne Extrudeur B" },
  { value: "FORM-1", label: "Ligne Formeur 1" },
  { value: "COND-1", label: "Ligne Conditionnement 1" },
];

type FormState = {
  lineCode: string;
  shift: string;
  operatorName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  availableTime: number;
  plannedStops: number;
  unplannedStops: number;
  totalParts: number;
  goodParts: number;
  rawMaterialUsed: number;
  rawMaterialLost: number;
  notes: string;
};

const defaultForm: FormState = {
  lineCode: "EXT-A",
  shift: "matin",
  operatorName: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  availableTime: 480,
  plannedStops: 30,
  unplannedStops: 0,
  totalParts: 0,
  goodParts: 0,
  rawMaterialUsed: 0,
  rawMaterialLost: 0,
  notes: "",
};

export default function DemoSessionNewPage() {
  const { locale } = useI18n();
  const t = STR[locale];

  const SHIFTS = [
    { value: "matin", label: t.shiftMorning },
    { value: "après-midi", label: t.shiftAfternoon },
    { value: "nuit", label: t.shiftNight },
  ];

  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<{
    trs: number;
    availability: number;
    performance: number;
    quality: number;
  } | null>(null);

  const update = useCallback((updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setResult(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const availableTime = form.availableTime || 0;
      const stopsTime = (form.plannedStops || 0) + (form.unplannedStops || 0);
      const goodParts = form.goodParts || 0;
      const totalParts = form.totalParts || 0;
      const netTimeHours = Math.max(0, (availableTime - stopsTime) / 60);
      const theoreticalRate = 120; // demo default
      const trs = calculateTRS({
        available_time: availableTime,
        stops_time: stopsTime,
        good_parts: goodParts,
        total_parts: totalParts,
        produced_parts: goodParts,
        theoretical_rate: theoreticalRate,
        net_time: netTimeHours,
      });
      const availability = calculateAvailability({
        available_time: availableTime,
        stops_time: stopsTime,
      });
      const performance = calculatePerformance({
        produced_parts: goodParts,
        theoretical_rate: theoreticalRate,
        net_time: netTimeHours,
      });
      const quality = calculateQuality({
        good_parts: goodParts,
        total_parts: totalParts,
      });
      setResult({
        trs: Math.round(trs * 100) / 100,
        availability: Math.round(availability * 100) / 100,
        performance: Math.round(performance * 100) / 100,
        quality: Math.round(quality * 100) / 100,
      });
    },
    [form]
  );

  const resetForm = useCallback(() => {
    setForm(defaultForm);
    setResult(null);
  }, []);

  return (
    <div className="space-y-6">
      <Title level={1}>{t.newSessionTitle}</Title>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Grid cols={2}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldProductionLine}
            </label>
            <Selectbox
              options={LINES}
              value={form.lineCode}
              onChange={(v) => update({ lineCode: String(v) })}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldShift}
            </label>
            <Selectbox
              options={SHIFTS}
              value={form.shift}
              onChange={(v) => update({ shift: String(v) })}
            />
          </Column>
        </Grid>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            {t.fieldOperator}
          </label>
          <Input
            value={form.operatorName}
            onChange={(v) => update({ operatorName: v })}
            placeholder={t.operatorPlaceholder}
          />
        </div>
        <Grid cols={2}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldStart}
            </label>
            <div className="flex gap-2">
              <DateInput
                value={form.startDate || null}
                onChange={(v) => update({ startDate: v ? v.toISOString().slice(0, 10) : "" })}
              />
              <TimeInput
                value={form.startTime || null}
                onChange={(v) => update({ startTime: v ? `${String(v.getHours()).padStart(2, "0")}:${String(v.getMinutes()).padStart(2, "0")}` : "" })}
              />
            </div>
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldEnd}
            </label>
            <div className="flex gap-2">
              <DateInput
                value={form.endDate || null}
                onChange={(v) => update({ endDate: v ? v.toISOString().slice(0, 10) : "" })}
              />
              <TimeInput
                value={form.endTime || null}
                onChange={(v) => update({ endTime: v ? `${String(v.getHours()).padStart(2, "0")}:${String(v.getMinutes()).padStart(2, "0")}` : "" })}
              />
            </div>
          </Column>
        </Grid>
        <Grid cols={3}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldAvailableTime}
            </label>
            <NumberInput
              value={form.availableTime}
              onChange={(v) => update({ availableTime: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldPlannedStops}
            </label>
            <NumberInput
              value={form.plannedStops}
              onChange={(v) => update({ plannedStops: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldUnplannedStops}
            </label>
            <NumberInput
              value={form.unplannedStops}
              onChange={(v) => update({ unplannedStops: v ?? 0 })}
              min={0}
            />
          </Column>
        </Grid>
        <Grid cols={3}>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldPartsProduced}
            </label>
            <NumberInput
              value={form.totalParts}
              onChange={(v) => update({ totalParts: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldGoodParts}
            </label>
            <NumberInput
              value={form.goodParts}
              onChange={(v) => update({ goodParts: v ?? 0 })}
              min={0}
            />
          </Column>
          <Column>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {t.fieldMaterialUsed}
            </label>
            <NumberInput
              value={form.rawMaterialUsed}
              onChange={(v) => update({ rawMaterialUsed: v ?? 0 })}
              min={0}
            />
          </Column>
        </Grid>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            {t.fieldMaterialLost}
          </label>
          <NumberInput
            value={form.rawMaterialLost}
            onChange={(v) => update({ rawMaterialLost: v ?? 0 })}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            {t.fieldNotes}
          </label>
          <Textarea
            value={form.notes}
            onChange={(v) => update({ notes: v })}
            placeholder={t.notesPlaceholder}
            rows={3}
          />
        </div>
        <Button type="submit">{t.saveSimulation}</Button>
      </form>

      {result && (
        <Panel title={t.resultTitle} variant="success">
          <p className="text-sm mb-2">
            {t.resultSummary(result.trs, result.availability, result.performance, result.quality)}
          </p>
          <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {t.resultNote}
          </p>
          <Button variant="secondary" size="small" onClick={resetForm} className="mt-3">
            {t.newEntry}
          </Button>
        </Panel>
      )}
    </div>
  );
}
