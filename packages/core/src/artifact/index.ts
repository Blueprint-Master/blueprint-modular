// Direct imports keep optional browser engines and framework code out of this entry.
import { Badge } from "../../../../components/bpm/Badge";
import { BarChart } from "../../../../components/bpm/BarChart";
import { LineChart } from "../../../../components/bpm/LineChart";
import { Metric } from "../../../../components/bpm/Metric";
import { MetricRow } from "../../../../components/bpm/MetricRow";
import { wrap } from "../wrap";

export { Badge, BarChart, LineChart, Metric, MetricRow };
export const bpm = {
  metric: /* @__PURE__ */ wrap(Metric),
  metricRow: /* @__PURE__ */ wrap(MetricRow),
  badge: /* @__PURE__ */ wrap(Badge),
  barChart: /* @__PURE__ */ wrap(BarChart),
  lineChart: /* @__PURE__ */ wrap(LineChart),
};
