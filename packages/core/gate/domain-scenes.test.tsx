import React from "react";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CelestialScene } from "../../../components/bpm/CelestialScene";
import { OrbitalSystem } from "../../../components/bpm/OrbitalSystem";
import { SeatMap } from "../../../components/bpm/SeatMap";
import { FlightMap } from "../../../components/bpm/FlightMap";
import { AirportBoard } from "../../../components/bpm/AirportBoard";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Celestial and aviation interactions", () => {
  it("selects custom objects by keyboard and honors controlled selection", () => {
    const onSelect = vi.fn();
    const objects = [{ id: "s", label: "Custom star", x: 0, y: 0 }, { id: "p", label: "Custom planet", x: 50, y: 10 }];
    const { rerender } = render(<CelestialScene objects={objects} selectedId="s" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Custom planet" }), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(objects[1]);
    expect(screen.getByRole("button", { name: "Custom star" }).getAttribute("aria-pressed")).toBe("true");
    rerender(<CelestialScene objects={objects} selectedId="p" onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: "Custom planet" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("lets the caller control camera changes without overriding its view", () => {
    const onCameraChange = vi.fn();
    render(<CelestialScene camera={{ azimuth: 20, zoom: 2 }} onCameraChange={onCameraChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Tourner à droite" }));
    expect(onCameraChange).toHaveBeenCalledWith({ azimuth: 35, zoom: 2 });
  });
  it("updates controlled time only through its callback", () => {
    const onTimeChange = vi.fn();
    render(<OrbitalSystem time={5} onTimeChange={onTimeChange} />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Temps du modèle" }), { target: { value: "12" } });
    expect(onTimeChange).toHaveBeenCalledWith(12);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("5");
    expect(screen.queryByRole("button", { name: "Animer" })).toBeNull();
  });
  it("starts animation only on request, resumes from paused time and cancels on unmount", () => {
    const callbacks = new Map<number, FrameRequestCallback>(); let next = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { callbacks.set(++next, callback); return next; });
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { callbacks.delete(id); });
    const tick = (now: number) => { const current = [...callbacks.values()]; callbacks.clear(); act(() => current.forEach(fn => fn(now))); };
    const { unmount } = render(<OrbitalSystem speed={10} />);
    expect(callbacks.size).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Animer" })); tick(0); tick(100);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Animer" })); tick(500); tick(600);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("2");
    unmount(); expect(cancel).toHaveBeenCalled(); expect(callbacks.size).toBe(0);
  });
  it("selects flights through the mobile list with the source object", () => {
    const onFlightSelect = vi.fn(), flights = [{ id: "demo", label: "DEMO", lat: 49, lon: 2 }];
    render(<FlightMap flights={flights} onFlightSelect={onFlightSelect} />);
    fireEvent.change(screen.getByLabelText("Sélectionner un vol"), { target: { value: "demo" } });
    expect(onFlightSelect).toHaveBeenCalledWith(flights[0]);
    expect(screen.getByRole("button", { name: "DEMO" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("filters airport data without inventing flights", () => {
    render(<AirportBoard flights={[{ id: "a", flightNumber: "D104", destination: "Lisbonne", scheduledTime: "14:00" },
      { id: "b", flightNumber: "D208", destination: "Tokyo", scheduledTime: "15:00" }]} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "lisbonne" } });
    expect(screen.getByText("D104")).toBeTruthy(); expect(screen.queryByText("D208")).toBeNull();
  });
  it("preserves aisles, disables occupied seats and emits stable seat IDs", () => {
    const onSelectionChange = vi.fn();
    render(<SeatMap multiple rows={[{ id: "1", label: "1", seats: [{ id: "1A", label: "1A" }, null,
      { id: "1C", label: "1C", status: "occupied" }, { id: "1D", label: "1D" }] }]} onSelectionChange={onSelectionChange} />);
    const occupied = screen.getByRole("button", { name: "Siège 1C, occupé" });
    expect((occupied as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(occupied); expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Siège 1A, disponible" }));
    fireEvent.click(screen.getByRole("button", { name: "Siège 1D, disponible" }));
    expect(onSelectionChange.mock.calls[1][0]).toEqual(["1A", "1D"]);
    fireEvent.click(screen.getByRole("button", { name: "Siège 1A, disponible" }));
    expect(onSelectionChange.mock.calls[2][0]).toEqual(["1D"]);
  });
});
