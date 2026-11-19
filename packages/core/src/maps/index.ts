import { Gps } from "../../../../components/bpm/Gps";
import { MapView } from "../../../../components/bpm/MapView";
import { wrap } from "../wrap";
export const bpm = { gps: wrap(Gps), mapView: wrap(MapView) };
