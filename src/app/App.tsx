import { useState, useEffect, useRef, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Activity,
  Shield,
  Bell,
  Cpu,
  Zap,
  TrendingUp,
  Clock,
  Eye,
  BarChart2,
  ChevronRight,
  Settings as SettingsIcon,
  Search,
  Filter,
  CheckCircle,
  Play,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Download,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Toaster, toast } from "sonner";

// ─── THEME PALETTES ──────────────────────────────────────────────────────────

const THEMES = {
  cyber: {
    primary: "#1B4F8A",
    secondary: "#2E7D5E",
    bgGlow: "transparent",
    border: "#E2E6EA",
    name: "Enterprise Navy (Navy/Forest)",
  },
  amber: {
    primary: "#C87A1A",
    secondary: "#1B4F8A",
    bgGlow: "transparent",
    border: "#E2E6EA",
    name: "Enterprise Amber (Warning)",
  },
  emerald: {
    primary: "#2E7D5E",
    secondary: "#1B4F8A",
    bgGlow: "transparent",
    border: "#E2E6EA",
    name: "Enterprise Green (Operational)",
  },
  crimson: {
    primary: "#B91C1C",
    secondary: "#1B4F8A",
    bgGlow: "transparent",
    border: "#E2E6EA",
    name: "Enterprise Red (Alert)",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

// ─── INITIAL TELEMETRY DATA ───────────────────────────────────────────────────

const INITIAL_THROUGHPUT_DATA = [
  { t: "00:00", flow: 85, block: 15 },
  { t: "02:00", flow: 72, block: 28 },
  { t: "04:00", flow: 80, block: 20 },
  { t: "06:00", flow: 91, block: 9 },
  { t: "08:00", flow: 95, block: 5 },
  { t: "10:00", flow: 88, block: 12 },
  { t: "12:00", flow: 74, block: 26 },
  { t: "14:00", flow: 89, block: 11 },
  { t: "16:00", flow: 93, block: 7 },
  { t: "18:00", flow: 86, block: 14 },
  { t: "20:00", flow: 92, block: 8 },
  { t: "22:00", flow: 90, block: 10 },
  { t: "Now", flow: 94, block: 6 },
];

const WORKERS = [
  { id: "W-0021", name: "Arjun Krishnan", station: "Assembly Line A", status: "active", eff: 92, shift: "Day" },
  { id: "W-0034", name: "Meera Iyer", station: "Quality Control", status: "active", eff: 98, shift: "Day" },
  { id: "W-0057", name: "Ravi Subramanian", station: "Packing Zone", status: "warning", eff: 76, shift: "Day" },
  { id: "W-0089", name: "Priya Nair", station: "Loading Bay", status: "active", eff: 88, shift: "Night" },
  { id: "W-0102", name: "Karthik Murugan", station: "Inspection Deck", status: "active", eff: 94, shift: "Day" },
  { id: "W-0118", name: "Anitha Devi", station: "Assembly Line B", status: "idle", eff: 0, shift: "Break" },
];

type Worker = typeof WORKERS[number];

const LANGS = ["EN", "தமிழ்", "हिन्दी"] as const;
type Lang = typeof LANGS[number];

const ML_INSIGHTS: Record<Lang, string> = {
  EN: "Operations optimization algorithm has identified a slight delay in conveyor sync. Line efficiency normal.",
  "தமிழ்": "கன்வேயர் ஒத்திசைவில் சிறிய தாமதத்தை ஆல்காரிதம் கண்டறிந்துள்ளது. வரிசை செயல்திறன் சாதாரணமாக உள்ளது.",
  "हिन्दी": "कन्वेयर सिंक में एल्गोरिदम ने थोड़ी देरी की पहचान की है। लाइन दक्षता सामान्य है।",
};

// Isometric Factory Map Grid Configuration
const MACHINE_METRICS = [
  { id: "M-101", name: "CNC Milling CNC-01", gx: 1, gy: 1, h: 52, temp: 42.4, vib: 1.2, power: 4.8, operatorId: "W-0021" },
  { id: "M-102", name: "Assembly Robot AR-4", gx: 3, gy: 2, h: 40, temp: 37.1, vib: 0.8, power: 3.5, operatorId: "W-0118" },
  { id: "M-103", name: "Wave Soldering WS-2", gx: 5, gy: 3, h: 58, temp: 224.2, vib: 0.3, power: 7.1, operatorId: "W-0034" },
  { id: "M-104", name: "Inspection Optical IO-9", gx: 7, gy: 2, h: 44, temp: 31.8, vib: 0.4, power: 1.2, operatorId: "W-0102" },
  { id: "M-105", name: "Laser Cutter LC-1", gx: 9, gy: 1, h: 48, temp: 78.5, vib: 2.1, power: 9.6, operatorId: "W-0057" },
  { id: "M-201", name: "Thermal Press TP-3", gx: 2, gy: 5, h: 32, temp: 154.6, vib: 1.5, power: 8.2, operatorId: "W-0089" },
  { id: "M-202", name: "Packing Belt PK-5", gx: 8, gy: 5, h: 36, temp: 29.2, vib: 2.8, power: 2.4, operatorId: "W-0057" },
  { id: "M-203", name: "Optical Inspector OI-4", gx: 10, gy: 4, h: 38, temp: 34.0, vib: 0.1, power: 1.8, operatorId: "W-0102" },
];

type Machine = typeof MACHINE_METRICS[number];

const INITIAL_INCIDENTS = [
  { id: 1, sev: "critical", msg: "Unauthorized Asset Movement — Sector 4", ts: "14:02:11", acknowledged: false, resolved: false },
  { id: 2, sev: "warning", msg: "Micro-fracture detected on Assembly Line B — 1.2% rate", ts: "13:17:45", acknowledged: true, resolved: false },
  { id: 3, sev: "resolved", msg: "Worker pathing anomaly — Zone 7 clearance confirmed", ts: "11:55:04", acknowledged: true, resolved: true },
];

type Incident = typeof INITIAL_INCIDENTS[number];

// ─── AUDIO SYNTH PANEL (WEB AUDIO API) ──────────────────────────────────────

function playBeep(type: "click" | "alert" | "success", enabled: boolean) {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "alert") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("AudioContext block", e);
  }
}

// ─── MAIN APP CONTAINER ──────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<string>("ops");
  const [lang, setLang] = useState<Lang>("EN");
  const [opsTab, setOpsTab] = useState<"alerts" | "telemetry" | "models">("alerts");

  // Telemetry Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<ThemeKey>("cyber");
  const [telemetrySpeed, setTelemetrySpeed] = useState<"slow" | "normal" | "fast">("normal");

  // Dynamic Telemetry State
  const [machines, setMachines] = useState<Machine[]>(MACHINE_METRICS);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [throughputData, setThroughputData] = useState(INITIAL_THROUGHPUT_DATA);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [workers, setWorkers] = useState<Worker[]>(WORKERS);
  const [selectedWorker, setSelectedWorker] = useState<Worker>(WORKERS[1]);

  // Security Feed Sector Lockdown
  const [lockdownSectors, setLockdownSectors] = useState({
    sector1: false,
    sector4: false,
    assemblyA: false,
    loadingDock: false,
  });

  // Access Log Monospace Stream
  const [accessLogs, setAccessLogs] = useState<string[]>([
    "14:02:11 - SECURITY WARNING: Unauthorized movement Sector 4 camera.",
    "13:58:45 - RFID read: W-0034 (Meera Iyer) entered Quality Control - Granted.",
    "13:54:12 - Sensor scan: Thermal Press TP-3 heat curve calibration complete.",
    "13:50:33 - RFID read: W-0102 (Karthik Murugan) entered Inspection Deck - Granted.",
    "13:46:18 - RFID read: W-0118 (Anitha Devi) exited Assembly Line B for break - Granted.",
  ]);

  const activeTheme = THEMES[themeMode];

  // Dynamically update document variables when themeMode changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", activeTheme.primary);
    root.style.setProperty("--accent", activeTheme.secondary);
    root.style.setProperty("--border", activeTheme.border);
  }, [activeTheme]);

  // Dynamic Clock State
  const [timeStr, setTimeStr] = useState("14:32:07 IST");
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString("en-US", { hour12: false }) + " IST");
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Telemetry Dynamic Update Loop
  useEffect(() => {
    const delay = telemetrySpeed === "slow" ? 4000 : telemetrySpeed === "normal" ? 2000 : 800;

    const interval = setInterval(() => {
      // 1. Slightly fluctuate machine telemetry (Temperature / Vibration)
      setMachines((prev) =>
        prev.map((m) => {
          let deltaTemp = (Math.random() - 0.5) * 0.8;
          let deltaVib = (Math.random() - 0.5) * 0.15;
          // Keep solder station around 220, others around 30-80
          const minTemp = m.id === "M-103" ? 218 : 25;
          const maxTemp = m.id === "M-103" ? 228 : 180;
          return {
            ...m,
            temp: Math.min(Math.max(m.temp + deltaTemp, minTemp), maxTemp),
            vib: Math.min(Math.max(m.vib + deltaVib, 0.05), 5.0),
          };
        })
      );

      // 2. Fluctuate throughput data (live point)
      setThroughputData((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        const currentFlow = next[lastIdx].flow;
        const currentBlock = next[lastIdx].block;

        const newFlow = Math.min(Math.max(currentFlow + Math.floor((Math.random() - 0.5) * 6), 65), 100);
        const newBlock = Math.min(Math.max(currentBlock + Math.floor((Math.random() - 0.5) * 4), 2), 35);

        next[lastIdx] = { ...next[lastIdx], flow: newFlow, block: newBlock };
        return next;
      });

      // 3. Fluctuate Worker Efficiencies slightly
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.status !== "active") return w;
          const delta = Math.floor((Math.random() - 0.5) * 4);
          return {
            ...w,
            eff: Math.min(Math.max(w.eff + delta, 60), 100),
          };
        })
      );

      // 4. Randomly generate security access log
      const names = ["Ravi Subramanian", "Arjun Krishnan", "Priya Nair", "Meera Iyer", "Karthik Murugan"];
      const ids = ["W-0057", "W-0021", "W-0089", "W-0034", "W-0102"];
      const stations = ["Assembly A", "Loading Bay", "Sector 4", "Quality Control", "Inspection Deck"];
      const randomIdx = Math.floor(Math.random() * names.length);
      const isGranted = Math.random() > 0.15 || stations[randomIdx] !== "Sector 4";
      const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
      const log = `${ts} - RFID read: ${ids[randomIdx]} (${names[randomIdx]}) requested access ${stations[randomIdx]} - ${
        isGranted ? "Granted." : "DENIED (Access Violation)."
      }`;

      setAccessLogs((prev) => [log, ...prev.slice(0, 14)]);
    }, delay);

    return () => clearInterval(interval);
  }, [telemetrySpeed]);

  // Derived Statistics
  const activeAlertsCount = useMemo(() => incidents.filter((i) => !i.resolved).length, [incidents]);
  const avgEfficiency = useMemo(() => {
    const active = workers.filter((w) => w.status === "active");
    if (active.length === 0) return 0;
    return Math.round(active.reduce((acc, curr) => acc + curr.eff, 0) / active.length);
  }, [workers]);

  const handleScreenChange = (scr: string) => {
    playBeep("click", soundEnabled);
    setScreen(scr);
  };

  const handleTriggerIncident = (sev: "critical" | "warning", message: string) => {
    playBeep("alert", soundEnabled);
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    const newInc: Incident = {
      id: Date.now(),
      sev,
      msg: message,
      ts,
      acknowledged: false,
      resolved: false,
    };
    setIncidents((prev) => [newInc, ...prev]);
    toast.error(`ALERT: ${message}`, {
      description: `Time: ${ts} | Severity: ${sev.toUpperCase()}`,
      duration: 5000,
    });
  };

  const handleAcknowledgeIncident = (id: number) => {
    playBeep("click", soundEnabled);
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, acknowledged: true } : inc)));
    toast.info("Incident acknowledged. Operator dispatched.");
  };

  const handleResolveIncident = (id: number) => {
    playBeep("success", soundEnabled);
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, resolved: true, acknowledged: true } : inc)));
    toast.success("Incident resolved. Equipment status returned to Normal.");
  };

  const handleClearIncidents = () => {
    playBeep("click", soundEnabled);
    setIncidents([]);
    toast.success("Incident logs cleared.");
  };

  // Mock Report Downloader
  const handleExportCSV = () => {
    playBeep("success", soundEnabled);
    const headers = "Timestamp,Log Details,Category\n";
    const rows = accessLogs.map((log) => `"${log.slice(0, 8)}","${log.slice(11)}","Access Event"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `axiom_ops_report_${Date.now()}.csv`;
    link.click();
    toast.success("Operations log exported successfully.");
  };

  // Hexagon/Radar Chart Baseline Generation
  const selectedWorkerRadar = useMemo(() => {
    const e = selectedWorker.eff;
    return [
      { axis: "Task Eff.", value: e || 20, base: 80 },
      { axis: "Safety Protocol", value: selectedWorker.status === "active" ? Math.min(e + 5, 100) : 30, base: 80 },
      { axis: "Station Attendance", value: selectedWorker.status === "idle" ? 0 : Math.max(e - 10, 50), base: 80 },
      { axis: "Quality Output", value: selectedWorker.status === "active" ? Math.min(e - 5, 100) : 10, base: 80 },
      { axis: "ML Alignment", value: selectedWorker.status === "active" ? Math.min(Math.max(e - 4, 10), 100) : 20, base: 80 },
      { axis: "Response Rate", value: selectedWorker.status === "active" ? Math.max(e - 15, 45) : 10, base: 80 },
    ];
  }, [selectedWorker]);

  // Selected Machine Operator helper
  const selectedMachineOperator = useMemo(() => {
    if (!selectedMachineId) return null;
    const mach = machines.find((m) => m.id === selectedMachineId);
    if (!mach) return null;
    return workers.find((w) => w.id === mach.operatorId) || null;
  }, [selectedMachineId, machines, workers]);

  return (
    <div className="w-screen h-screen bg-background text-foreground flex overflow-hidden font-sans select-none relative">
      <Toaster position="bottom-right" theme="light" closeButton richColors />

      {/* ─── SIDEBAR NAVIGATION ─── */}
      <aside
        className="w-16 h-full bg-sidebar border-r flex flex-col items-center py-4 z-50 shrink-0 transition-colors border-border"
      >
        {/* Axiom Logo */}
        <div
          onClick={() => handleScreenChange("ops")}
          className="w-10 h-10 rounded-xl mb-8 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 border border-border bg-muted"
        >
          <Cpu className="w-5 h-5 text-primary" />
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-4 flex-1">
          {[
            { id: "ops", label: "Operations Overview", Icon: LayoutDashboard },
            { id: "workers", label: "Worker Management", Icon: Users },
            { id: "incidents", label: "Incident Response", Icon: AlertTriangle, badgeCount: activeAlertsCount },
            { id: "analytics", label: "Advanced Analytics", Icon: Activity },
            { id: "security", label: "Site Security", Icon: Shield },
          ].map(({ id, label, Icon, badgeCount }) => {
            const isActive = screen === id;
            return (
              <button
                key={id}
                title={label}
                onClick={() => handleScreenChange(id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-300 group hover:bg-muted ${
                  isActive ? "bg-muted border border-border" : ""
                }`}
              >
                <Icon
                  className="w-5 h-5 transition-colors group-hover:text-foreground"
                  style={{
                    color: isActive ? activeTheme.primary : "#6B7280",
                  }}
                />
                {badgeCount ? (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badgeCount}
                  </span>
                ) : null}
                <span className="absolute left-16 bg-card border border-border px-2 py-1 rounded text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Settings Trigger */}
        <div className="flex flex-col gap-2">
          <button
            title="Settings Console"
            onClick={() => handleScreenChange("settings")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-muted hover:text-foreground ${
              screen === "settings" ? "bg-muted border border-border" : ""
            }`}
            style={{
              color: screen === "settings" ? activeTheme.primary : "#6B7280",
            }}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT BLOCK ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        
        {/* HEADER */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-6 z-40 shrink-0 transition-colors border-border">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280]">
              Axiom telemetry engine
            </span>
            <div className="h-3 w-[1px] bg-border" />
            <h1 className="text-sm font-semibold tracking-wide text-foreground capitalize flex items-center gap-2">
              <span>System</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 text-foreground" />
              <span className="opacity-90 font-medium text-xs font-mono bg-muted px-2 py-0.5 rounded border border-border text-foreground/80">
                {screen === "ops" ? "Operations Overview" :
                 screen === "workers" ? "Worker Management Console" :
                 screen === "incidents" ? "Incident Response Center" :
                 screen === "analytics" ? "Advanced Diagnostics & Analytics" :
                 screen === "security" ? "Site Security Portal" : "Telemetry Settings"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="font-mono text-[10px] text-accent tracking-widest uppercase">Live control</span>
            </div>

            {/* Time Feed */}
            <span className="font-mono text-xs text-[#6B7280]">{timeStr}</span>

            {/* Language Toggle */}
            <div className="flex bg-muted p-0.5 rounded-full border border-border">
              {LANGS.map((lg) => (
                <button
                  key={lg}
                  onClick={() => { playBeep("click", soundEnabled); setLang(lg); }}
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-semibold transition-all duration-300 ${
                    lang === lg
                      ? "text-white"
                      : "text-[#6B7280] hover:text-foreground"
                  }`}
                  style={{
                    backgroundColor: lang === lg ? activeTheme.primary : "transparent",
                  }}
                >
                  {lg}
                </button>
              ))}
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <div className="text-right">
                <div className="text-[11px] font-bold leading-none text-foreground">Samra R.</div>
                <div className="text-[9px] font-mono leading-none text-[#6B7280] mt-0.5">Admin level 3</div>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{
                  backgroundColor: activeTheme.primary,
                }}
              >
                SR
              </div>
            </div>
          </div>
        </header>

        {/* SCREEN CONTENT VIEWS */}
        <main className="flex-1 overflow-hidden relative">
          
          {/* SCREEN: OPERATIONS */}
          {screen === "ops" && (() => {
            const currentFlow = throughputData[throughputData.length - 1].flow;
            const currentBlock = throughputData[throughputData.length - 1].block;
            const activePilferageAlerts = incidents.filter(i => !i.resolved && (i.msg.toLowerCase().includes("asset") || i.msg.toLowerCase().includes("unauthorized") || i.msg.toLowerCase().includes("theft")));
            const pilferageCount = activePilferageAlerts.length;
            const activeDefectAlerts = incidents.filter(i => !i.resolved && (i.msg.toLowerCase().includes("defect") || i.msg.toLowerCase().includes("fracture") || i.msg.toLowerCase().includes("violation") || i.msg.toLowerCase().includes("failure")));
            const defectCount = activeDefectAlerts.length;
            const yieldRate = (100 - defectCount * 0.15).toFixed(2);

            return (
              <div className="h-full flex flex-col gap-4 p-4 overflow-hidden animate-fade-in">
                
                {/* TOP ROW: 4 Clean & Professional KPI Cards */}
                <div className="grid grid-cols-4 gap-4 shrink-0">
                  
                  {/* KPI 1: EFFICIENCY */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all border-l-4 border-l-[#1B4F8A] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">Overall Operations Efficiency</span>
                      <Activity className="w-4 h-4 text-[#1B4F8A]" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[36px] font-bold text-[#1B4F8A] leading-none font-sans">{avgEfficiency}%</span>
                      <span className="text-[12px] font-sans text-[#2E7D5E] font-medium">OEE Yield</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#2E7D5E]" style={{ width: `${avgEfficiency}%` }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 text-right">Target benchmark: 90%</div>
                  </div>

                  {/* KPI 2: BOTTLENECKS */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all border-l-4 border-l-[#C87A1A] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">Throughput Bottlenecks</span>
                      <Zap className="w-4 h-4 text-[#C87A1A]" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[36px] font-bold text-[#1B4F8A] leading-none font-sans">{currentFlow}%</span>
                      <span className="text-[12px] font-sans text-[#6B7280]">Flow Rate</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#1B4F8A]" style={{ width: `${currentFlow}%` }} />
                      <div className="h-full bg-[#B91C1C]" style={{ width: `${currentBlock}%` }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 flex justify-between">
                      <span>Blockage Risk: {currentBlock}%</span>
                      <span>Flowing Normal</span>
                    </div>
                  </div>

                  {/* KPI 3: PILFERAGE & SECURITY */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all shadow-sm bg-white"
                       style={{ borderLeft: pilferageCount > 0 ? "4px solid #B91C1C" : "4px solid #2E7D5E" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">Asset Pilferage & Security</span>
                      <Shield className="w-4 h-4" style={{ color: pilferageCount > 0 ? "#B91C1C" : "#2E7D5E" }} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {pilferageCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#B91C1C] text-white">
                          Active Breach
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#E6F4EA] text-[#2E7D5E]">
                          Secure
                        </span>
                      )}
                      <span className="text-[12px] font-sans text-[#6B7280]">Asset Status</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: pilferageCount > 0 ? "100%" : "0%", backgroundColor: pilferageCount > 0 ? "#B91C1C" : "#2E7D5E" }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 flex justify-between">
                      <span style={{ color: pilferageCount > 0 ? "#B91C1C" : "inherit" }} className={pilferageCount > 0 ? "font-semibold" : ""}>
                        {pilferageCount > 0 ? `${pilferageCount} Active Breach(es)` : "0 Active Breaches"}
                      </span>
                      <span>Sector 4 scanner</span>
                    </div>
                  </div>

                  {/* KPI 4: DEFECTS */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all shadow-sm bg-white"
                       style={{ borderLeft: defectCount > 0 ? "4px solid #C87A1A" : "4px solid #2E7D5E" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">Quality Defects & Inspection</span>
                      <AlertCircle className="w-4 h-4" style={{ color: defectCount > 0 ? "#C87A1A" : "#2E7D5E" }} />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[36px] font-bold text-[#1B4F8A] leading-none font-sans">{yieldRate}%</span>
                      <span className="text-[12px] font-sans text-[#2E7D5E] font-medium">Yield Quality</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(0, parseFloat(yieldRate))}%`, backgroundColor: defectCount > 0 ? "#C87A1A" : "#2E7D5E" }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 flex justify-between">
                      <span style={{ color: defectCount > 0 ? "#C87A1A" : "inherit" }} className={defectCount > 0 ? "font-semibold" : ""}>
                        {defectCount > 0 ? `${defectCount} Defect Anomaly(s)` : "0 Defects Flagged"}
                      </span>
                      <span>ML Visual inspector</span>
                    </div>
                  </div>

                </div>

                {/* BOTTOM HALF: Expanded Floor Map (Left) & Reorganized Tabbed Panel + Chart (Right) */}
                <div className="flex-1 flex gap-4 min-h-0">
                  
                  {/* Left Side: Large Factory Map */}
                  <div className="flex-1 glass-panel relative overflow-hidden group/floor bg-white">
                    {/* Title Bar */}
                    <div className="absolute top-0 inset-x-0 bg-[#F4F5F7] border-b border-[#E2E6EA] py-2.5 px-4 flex items-center justify-between z-20">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#1B4F8A]" />
                        <span className="font-sans text-xs font-semibold text-[#1A1F2E]">
                          Interactive Factory Floor Telemetry Map
                        </span>
                      </div>
                      <span className="text-[11px] font-sans text-[#6B7280]">
                        Select a node to view telemetry stream
                      </span>
                    </div>

                    {/* Floor SVG Isometric Mapping */}
                    <div className="absolute inset-0 flex items-center justify-center p-6 top-8">
                      <InteractiveFactoryFloor
                        machines={machines}
                        theme={activeTheme}
                        selectedMachineId={selectedMachineId}
                        onSelectMachine={(id) => {
                          playBeep("click", soundEnabled);
                          setSelectedMachineId(id === selectedMachineId ? null : id);
                        }}
                      />
                    </div>

                    {/* Machine Telemetry Float Box */}
                    {selectedMachineId && (
                      <div className="absolute bottom-4 left-4 w-72 glass-panel border border-[#E2E6EA] bg-white p-4 z-30 shadow-lg animate-slide-up">
                        {(() => {
                          const mach = machines.find((m) => m.id === selectedMachineId);
                          if (!mach) return null;
                          return (
                            <div>
                              <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-2 mb-3">
                                <span className="text-xs font-sans font-bold text-[#1A1F2E]">{mach.name}</span>
                                <button
                                  onClick={() => setSelectedMachineId(null)}
                                  className="text-[#6B7280] hover:text-[#1A1F2E] text-xs font-sans font-semibold"
                                >
                                  Close
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">Temperature</div>
                                  <div className="text-sm font-sans font-bold text-[#1B4F8A]">
                                    {mach.temp.toFixed(1)}°C
                                  </div>
                                </div>
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">Vibration</div>
                                  <div className="text-sm font-sans font-bold text-[#1B4F8A]">
                                    {mach.vib.toFixed(2)} mm/s
                                  </div>
                                </div>
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">Energy Draw</div>
                                  <div className="text-sm font-sans font-bold text-[#1B4F8A]">
                                    {mach.power.toFixed(1)} kW
                                  </div>
                                </div>
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">Operator</div>
                                  <div className="text-xs font-sans font-bold truncate text-[#2E7D5E]">
                                    {selectedMachineOperator ? selectedMachineOperator.name : "Unassigned"}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  handleScreenChange("workers");
                                  if (selectedMachineOperator) {
                                    setSelectedWorker(selectedMachineOperator);
                                  }
                                }}
                                className="w-full text-center py-1.5 rounded text-[11px] font-sans font-semibold border border-[#E2E6EA] hover:bg-[#F4F5F7] text-[#1B4F8A] transition-all"
                              >
                                Inspect Assigned Worker
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Consolidated Console & Charts */}
                  <div className="w-80 flex flex-col gap-4 shrink-0 h-full">
                    {/* Tabbed Console */}
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden bg-white">
                      {/* Tab Headers */}
                      <div className="flex bg-[#F4F5F7] border-b border-[#E2E6EA] text-center shrink-0">
                        {[
                          { id: "alerts", label: "Alerts" },
                          { id: "telemetry", label: "IoT Sensors" },
                          { id: "models", label: "AI Models" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => { playBeep("click", soundEnabled); setOpsTab(t.id as any); }}
                            className={`flex-1 py-2.5 font-sans text-[11px] font-bold border-r border-[#E2E6EA] last:border-r-0 transition-all ${
                              opsTab === t.id
                                ? "text-[#1B4F8A] bg-white border-b-2 border-b-[#1B4F8A]"
                                : "text-[#6B7280] hover:text-[#1B4F8A]"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Body */}
                      <div className="flex-1 overflow-y-auto p-3 bg-white">
                        
                        {/* Tab 1: Alerts */}
                        {opsTab === "alerts" && (
                          <div className="space-y-2">
                            {incidents.filter(inc => !inc.resolved).length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <CheckCircle className="w-8 h-8 text-[#2E7D5E] mb-1.5" />
                                <span className="text-[12px] font-sans font-semibold text-[#6B7280]">No active incidents</span>
                              </div>
                            ) : (
                              incidents.filter(inc => !inc.resolved).map((inc) => (
                                <div key={inc.id} className="p-3 bg-white rounded border border-[#E2E6EA] shadow-sm flex flex-col">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      inc.sev === "critical"
                                        ? "bg-[#FEE2E2] text-[#B91C1C]"
                                        : "bg-[#FEF3C7] text-[#C87A1A]"
                                    }`}>
                                      {inc.sev.charAt(0).toUpperCase() + inc.sev.slice(1)}
                                    </span>
                                    <span className="text-[10px] font-sans text-[#6B7280]">{inc.ts}</span>
                                  </div>
                                  <p className="text-[12px] text-[#1A1F2E] leading-normal font-sans font-medium mb-2.5">{inc.msg}</p>
                                  <div className="flex gap-2 justify-end">
                                    {!inc.acknowledged && (
                                      <button
                                        onClick={() => handleAcknowledgeIncident(inc.id)}
                                        className="px-2.5 py-1 text-[10px] font-sans font-semibold border border-[#E2E6EA] hover:bg-[#F4F5F7] text-[#1B4F8A] rounded transition-colors"
                                      >
                                        Acknowledge
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleResolveIncident(inc.id)}
                                      className="px-2.5 py-1 text-[10px] font-sans font-semibold border border-[#E2E6EA] hover:bg-[#E6F4EA] text-[#2E7D5E] hover:border-[#2E7D5E] rounded transition-colors"
                                    >
                                      Resolve
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Tab 2: IoT Sensors */}
                        {opsTab === "telemetry" && (
                          <div className="space-y-1.5">
                            {machines.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => { playBeep("click", soundEnabled); setSelectedMachineId(m.id); }}
                                className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-all shadow-sm ${
                                  selectedMachineId === m.id
                                    ? "border-[#1B4F8A] bg-[#F0F4F8]"
                                    : "border-[#E2E6EA] bg-white hover:bg-[#F4F5F7]"
                                }`}
                              >
                                <div>
                                  <span className="text-[12px] font-bold text-[#1A1F2E] block">{m.name}</span>
                                  <span className="text-[10px] font-sans text-[#6B7280]">{m.id}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-sans font-bold text-[#1B4F8A] block">{m.temp.toFixed(1)}°C</span>
                                  <span className="text-[10px] font-sans text-[#6B7280]">{m.vib.toFixed(2)} mm/s</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tab 3: AI Models */}
                        {opsTab === "models" && (
                          <div className="space-y-2">
                            {[
                              { name: "SafetyNet-v2", acc: "98.4%", active: true },
                              { name: "DefectNet-v3", acc: "97.8%", active: true },
                              { name: "SolderInspect", acc: "94.2%", active: incidents.some(i => i.msg.includes("Line B")) ? false : true },
                            ].map(({ name, acc, active }) => (
                              <div key={name} className="p-2.5 rounded border border-[#E2E6EA] bg-white flex items-center justify-between shadow-sm">
                                <div>
                                  <span className="text-[12px] font-bold text-[#1A1F2E] block">{name}</span>
                                  <span className="text-[10px] font-sans text-[#6B7280]">AI Telemetry Module</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-sans font-bold" style={{ color: active ? "#2E7D5E" : "#C87A1A" }}>{acc}</span>
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? "#2E7D5E" : "#C87A1A" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Flow & Blockage Chart */}
                    <div className="h-36 glass-panel p-3.5 flex flex-col shrink-0 bg-white">
                      <span className="font-sans text-[12px] font-bold text-[#1A1F2E] mb-2">
                        Conveyor Flow Capacity & Blockages (24h)
                      </span>
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={throughputData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                            <defs>
                              <linearGradient id="opsColorFlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1B4F8A" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#1B4F8A" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#E2E6EA" vertical={false} />
                            <XAxis
                              dataKey="t"
                              tick={{ fontFamily: "sans-serif", fontSize: 9, fill: "#6B7280" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontFamily: "sans-serif", fontSize: 9, fill: "#6B7280" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#FFFFFF",
                                border: "1px solid #E2E6EA",
                                borderRadius: "6px",
                                fontFamily: "sans-serif",
                                fontSize: "10px",
                              }}
                              itemStyle={{ color: "#1A1F2E" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="flow"
                              stroke="#1B4F8A"
                              strokeWidth={1.5}
                              fillOpacity={1}
                              fill="url(#opsColorFlow)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })()}

          {/* SCREEN: WORKERS */}
          {screen === "workers" && (
            <div className="h-full flex gap-4 p-4 overflow-hidden animate-fade-in bg-[#F4F5F7]">
              {/* Workers List Panel */}
              <div className="w-80 glass-panel flex flex-col shrink-0 bg-white">
                <div className="p-3 border-b border-[#E2E6EA] space-y-2">
                  <div className="flex items-center gap-2 text-[#1A1F2E]">
                    <Users className="w-4 h-4 text-[#1B4F8A]" />
                    <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                      Operator Profiles
                    </span>
                  </div>
                  
                  {/* Search / Filter Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7280]" />
                    <input
                      type="text"
                      placeholder="Search operators..."
                      className="w-full bg-[#F4F5F7] border border-[#E2E6EA] pl-9 pr-4 py-2 rounded text-xs text-[#1A1F2E] outline-none focus:border-[#1B4F8A]/40 font-sans"
                    />
                  </div>
                </div>

                {/* Worker Profiles List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {workers.map((w) => {
                    const isSelected = selectedWorker.id === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => { playBeep("click", soundEnabled); setSelectedWorker(w); }}
                        className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm ${
                          isSelected
                            ? "border-[#1B4F8A] bg-[#F0F4F8]"
                            : "border-[#E2E6EA] bg-white hover:bg-[#F4F5F7]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1A1F2E] font-sans">{w.name}</span>
                          <span className={`text-[9px] font-sans font-bold uppercase px-1.5 py-0.25 rounded ${
                            w.status === "active"
                              ? "bg-[#E6F4EA] text-[#2E7D5E]"
                              : w.status === "warning"
                              ? "bg-[#FEF3C7] text-[#C87A1A]"
                              : "bg-[#F4F5F7] text-[#6B7280]"
                          }`}>
                            {w.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-sans">
                          <span>{w.station}</span>
                          <span>{w.id}</span>
                        </div>

                        {w.status !== "idle" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-[9px] text-[#6B7280] font-sans mb-1">
                              <span>Activity Efficiency</span>
                              <span className="font-bold text-[#1B4F8A]">{w.eff}%</span>
                            </div>
                            <div className="h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#1B4F8A] transition-all duration-500"
                                style={{ width: `${w.eff}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Worker Profile Detail View */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Detail card */}
                <div className="glass-panel p-6 flex flex-col gap-6 relative bg-white">
                  <div className="flex items-center gap-6">
                    {/* Big Avatar */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md relative bg-[#1B4F8A]">
                      {selectedWorker.name.split(" ").map((n) => n[0]).join("")}
                      <span className={`absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white ${
                        selectedWorker.status === "active" ? "bg-[#2E7D5E]" : selectedWorker.status === "warning" ? "bg-[#C87A1A]" : "bg-[#6B7280]"
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-[#1A1F2E] font-sans leading-none">{selectedWorker.name}</h2>
                        <span className="text-[10px] font-sans text-[#6B7280] bg-[#F4F5F7] border border-[#E2E6EA] px-2 py-0.5 rounded">
                          {selectedWorker.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2.5 text-xs text-[#6B7280] font-sans">
                        <span>Station: {selectedWorker.station}</span>
                        <span>•</span>
                        <span>Shift: {selectedWorker.shift}</span>
                        <span>•</span>
                        <span>Shift Attendance: 98.2%</span>
                      </div>
                    </div>

                    {/* Quick Action Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playBeep("click", soundEnabled);
                          setWorkers((prev) =>
                            prev.map((w) =>
                              w.id === selectedWorker.id
                                ? { ...w, status: w.status === "active" ? "idle" : "active", eff: w.status === "active" ? 0 : 88 }
                                : w
                            )
                          );
                          setSelectedWorker((prev) => ({
                            ...prev,
                            status: prev.status === "active" ? "idle" : "active",
                            eff: prev.status === "active" ? 0 : 88,
                          }));
                          toast.info(`Operator shift status toggled.`);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#E2E6EA] rounded text-xs font-sans font-semibold text-[#1B4F8A] transition-colors shadow-sm"
                      >
                        Toggle Shift Active / Break
                      </button>
                      <button
                        onClick={() => {
                          handleTriggerIncident("warning", `Path deviation warning for ${selectedWorker.name} near restricted Zone R-4`);
                        }}
                        className="px-3.5 py-1.5 bg-[#FEE2E2] hover:bg-[#FEE2E2]/85 border border-[#FCA5A5] rounded text-xs font-sans font-semibold text-[#B91C1C] transition-colors shadow-sm"
                      >
                        Trigger Safety Warning
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 border-t border-[#E2E6EA] pt-4 mt-1">
                    {[
                      { label: "Worker Yield Rate", val: selectedWorker.status === "idle" ? "0%" : "99.4%", color: "#1B4F8A" },
                      { label: "Assigned Line Efficiency", val: selectedWorker.status === "idle" ? "0%" : `${selectedWorker.eff}%`, color: "#1B4F8A" },
                      { label: "Time on Floor", val: selectedWorker.status === "idle" ? "0.0h" : "6.2h", color: "#2E7D5E" },
                      { label: "Incident History", val: "0 Alerts", color: "#2E7D5E" },
                      { label: "Compliance Score", val: "100%", color: "#2E7D5E" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-[#F4F5F7] p-3 rounded border border-[#E2E6EA]">
                        <div className="text-lg font-sans font-bold" style={{ color }}>{val}</div>
                        <div className="text-[10px] text-[#6B7280] font-sans mt-1 leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex gap-4 min-h-0">
                  {/* Performance Hexagon Radar Chart */}
                  <div className="flex-1 glass-panel p-4 flex flex-col bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-[#1B4F8A]" />
                      <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                        AI Performance Alignment Matrix
                      </span>
                    </div>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={selectedWorkerRadar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke="#E2E6EA" />
                          <PolarAngleAxis dataKey="axis" tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "sans-serif" }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            name={selectedWorker.name}
                            dataKey="value"
                            stroke="#1B4F8A"
                            fill="#1B4F8A"
                            fillOpacity={0.15}
                            strokeWidth={1.5}
                          />
                          <Radar
                            name="Line Target"
                            dataKey="base"
                            stroke="#2E7D5E"
                            fill="#2E7D5E"
                            fillOpacity={0.05}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 justify-center pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded" style={{ backgroundColor: "#1B4F8A" }} />
                        <span className="text-[10px] font-sans text-[#6B7280]">Operator Stats</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 border border-dashed rounded" style={{ borderColor: "#2E7D5E" }} />
                        <span className="text-[10px] font-sans text-[#6B7280]">Target Benchmark</span>
                      </div>
                    </div>
                  </div>

                  {/* Worker Timeline */}
                  <div className="w-72 glass-panel p-4 flex flex-col shrink-0 bg-white">
                    <span className="font-sans text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3 block">
                      Shift History Timeline (Today)
                    </span>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {[
                        { t: "14:22", msg: "Safety compliance verification scan complete.", type: "success" },
                        { t: "13:46", msg: "Began scheduled worker rotation sequence.", type: "info" },
                        { t: "11:30", msg: "Refreshed assembly parts calibration logs.", type: "success" },
                        { t: "09:12", msg: "Flagged micro-vibration warning CNC-01.", type: "warn" },
                        { t: "08:00", msg: "Shift checkout initialized. RFID verified.", type: "info" },
                      ].map(({ t, msg, type }) => (
                        <div key={t} className="flex gap-3">
                          <span className="text-[10px] font-sans text-[#6B7280] w-8 pt-0.5 shrink-0">{t}</span>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`w-2.5 h-2.5 rounded-full border border-white shrink-0 shadow-sm ${
                              type === "success" ? "bg-[#2E7D5E]" : type === "warn" ? "bg-[#C87A1A]" : "bg-[#1B4F8A]"
                            }`} />
                            <div className="w-[1px] bg-[#E2E6EA] flex-1 min-h-[20px]" />
                          </div>
                          <p className="text-[11px] text-[#1A1F2E] leading-relaxed font-sans">{msg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: INCIDENTS RESPONSE CENTER */}
          {screen === "incidents" && (
            <div className="h-full flex gap-4 p-4 overflow-hidden animate-fade-in bg-[#F4F5F7]">
              {/* Incident Controller Side */}
              <div className="w-72 flex flex-col gap-4 shrink-0">
                <div className="glass-panel p-4 space-y-3 bg-white">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#1B4F8A]" />
                    <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                      Telemetry Defect Injector
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Simulate operations incidents and safety alerts on the live dashboard stream.
                  </p>

                  <div className="space-y-2 pt-2">
                    {[
                      { label: "Thermal runaway on Wave Solder WS-2", sev: "critical", msg: "Thermal runaway: Solder WS-2 temperature peaked 238.5°C" },
                      { label: "Vibration anomaly CNC-01 (1.9mm/s)", sev: "warning", msg: "Vibration anomaly detected on CNC-01. Structural warning rate: 1.9mm/s" },
                      { label: "PPE Violation: Missing Hardhat Line A", sev: "critical", msg: "PPE Violation: Line A assembly area - helmet compliance failure." },
                      { label: "Power surge on Loading Dock conveyor", sev: "warning", msg: "Power surge on Loading Dock conveyor: peak rate: 14kW" },
                    ].map(({ label, sev, msg }) => (
                      <button
                        key={label}
                        onClick={() => handleTriggerIncident(sev as any, msg)}
                        className="w-full text-left p-2.5 bg-white hover:bg-[#F4F5F7] border border-[#E2E6EA] rounded text-[12px] leading-snug font-sans transition-all text-[#1A1F2E] shadow-sm"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${sev === "critical" ? "bg-[#B91C1C]" : "bg-[#C87A1A]"}`} />
                          <span className={`text-[9px] font-sans font-bold uppercase ${sev === "critical" ? "text-[#B91C1C]" : "text-[#C87A1A]"}`}>
                            {sev}
                          </span>
                        </div>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-4 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4 text-[#1B4F8A]" />
                      <span className="font-sans text-[11px] font-bold text-[#6B7280]">
                        Active Metrics Summary
                      </span>
                    </div>
                    <div className="space-y-2.5 mt-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">Total Registered Today</span>
                        <span className="text-xs font-sans font-bold text-[#1A1F2E]">{incidents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">Critical Failures</span>
                        <span className="text-xs font-sans font-bold text-[#B91C1C]">
                          {incidents.filter((i) => i.sev === "critical" && !i.resolved).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">Warnings Pending</span>
                        <span className="text-xs font-sans font-bold text-[#C87A1A]">
                          {incidents.filter((i) => i.sev === "warning" && !i.resolved).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">Resolved Incidents</span>
                        <span className="text-xs font-sans font-bold text-[#2E7D5E]">
                          {incidents.filter((i) => i.resolved).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClearIncidents}
                    className="w-full text-center py-2 border border-[#B91C1C]/20 hover:border-[#B91C1C]/40 bg-[#B91C1C]/5 hover:bg-[#B91C1C]/10 rounded font-sans text-xs font-semibold text-[#B91C1C] transition-all"
                  >
                    Clear History Logs
                  </button>
                </div>
              </div>

              {/* Incidents Live Feed Panel */}
              <div className="flex-1 glass-panel flex flex-col min-w-0 bg-white">
                <div className="p-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F4F5F7]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
                    <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                      Live Incident Logs & Response Actions
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-[#6B7280]">
                    Acknowledge alerts to deploy responders. Mark as resolved when completed.
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                  {incidents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                      <CheckCircle className="w-12 h-12 text-[#2E7D5E] mb-2" />
                      <div className="text-sm font-sans font-bold text-[#1A1F2E]">No Active Anomalies</div>
                      <div className="text-xs text-[#6B7280] mt-1">All telemetry systems reporting normal parameter bounds.</div>
                    </div>
                  ) : (
                    incidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-4 bg-white rounded-lg border border-[#E2E6EA] flex items-start gap-4 transition-all duration-300 shadow-sm"
                        style={{
                          borderLeft: inc.resolved
                            ? "4px solid #2E7D5E"
                            : inc.sev === "critical"
                            ? "4px solid #B91C1C"
                            : "4px solid #C87A1A",
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          inc.resolved
                            ? "bg-[#E6F4EA] text-[#2E7D5E]"
                            : inc.sev === "critical"
                            ? "bg-[#FEE2E2] text-[#B91C1C]"
                            : "bg-[#FEF3C7] text-[#C87A1A]"
                        }`}>
                          {inc.resolved ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded ${
                              inc.resolved
                                ? "bg-[#E6F4EA] text-[#2E7D5E]"
                                : inc.sev === "critical"
                                ? "bg-[#FEE2E2] text-[#B91C1C]"
                                : "bg-[#FEF3C7] text-[#C87A1A]"
                            }`}>
                              {inc.resolved ? "Resolved" : inc.sev === "critical" ? "Critical Failure" : "Warning System"}
                            </span>
                            <span className="text-[10px] font-sans text-[#6B7280]">{inc.ts}</span>
                          </div>
                          <p className="text-sm font-semibold text-[#1A1F2E]">{inc.msg}</p>
                          <div className="flex gap-4 mt-2.5 text-[10px] font-sans text-[#6B7280]">
                            <span>Incident ID: INC-{inc.id.toString().slice(-4)}</span>
                            <span>•</span>
                            <span>Impact Area: Assembly Floor Zone 4</span>
                          </div>
                        </div>

                        {/* Interactive response actions */}
                        <div className="flex items-center gap-2">
                          {!inc.acknowledged && !inc.resolved && (
                            <button
                              onClick={() => handleAcknowledgeIncident(inc.id)}
                              className="px-3.5 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#E2E6EA] rounded text-xs font-sans font-semibold text-[#1B4F8A] transition-colors shadow-sm"
                            >
                              Acknowledge
                            </button>
                          )}
                          {inc.acknowledged && !inc.resolved && (
                            <span className="text-[10px] font-sans font-bold text-[#1B4F8A] bg-[#F0F4F8] border border-[#1B4F8A]/20 px-2.5 py-1.5 rounded uppercase">
                              Responding...
                            </span>
                          )}
                          {!inc.resolved && (
                            <button
                              onClick={() => handleResolveIncident(inc.id)}
                              className="px-3.5 py-1.5 bg-white hover:bg-[#E6F4EA] border border-[#E2E6EA] hover:border-[#2E7D5E] rounded text-xs font-sans font-semibold text-[#2E7D5E] transition-colors shadow-sm"
                            >
                              Resolve
                            </button>
                          )}
                          {inc.resolved && (
                            <span className="text-[10px] font-sans font-bold text-[#2E7D5E] bg-[#E6F4EA] border border-[#2E7D5E]/20 px-2.5 py-1.5 rounded uppercase flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3" /> Closed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: ADVANCED ANALYTICS */}
          {screen === "analytics" && (
            <div className="h-full flex flex-col gap-4 p-4 overflow-hidden animate-fade-in bg-[#F4F5F7]">
              {/* Analytics Header Grid */}
              <div className="grid grid-cols-4 gap-3 shrink-0">
                {[
                  { label: "Overall Equipment Effectiveness", val: `${avgEfficiency}%`, delta: "+2.4% over benchmark", color: "#1B4F8A" },
                  { label: "Assembly Line Yield Rate", val: "99.85%", delta: "Peak performance yield", color: "#2E7D5E" },
                  { label: "Safety Index Rating", val: "100%", delta: "Zero compliance violations", color: "#2E7D5E" },
                  { label: "Average Incident Resolution", val: "4.2m", delta: "-1.1 min this shift", color: "#1B4F8A" },
                ].map(({ label, val, delta, color }) => (
                  <div key={label} className="glass-panel p-4 bg-white border border-[#E2E6EA] shadow-sm">
                    <div className="text-2xl font-bold font-sans text-[#1B4F8A] tracking-tight">{val}</div>
                    <div className="text-[10px] font-sans text-[#6B7280] mt-1 leading-none">{label}</div>
                    <div className="text-[10px] font-sans text-[#2E7D5E] mt-2.5 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{delta}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Charts Grid */}
              <div className="flex-1 flex gap-4 min-h-0">
                {/* Flow and Vibration Details */}
                <div className="flex-1 glass-panel p-4 flex flex-col bg-white border border-[#E2E6EA] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#1B4F8A]" />
                      <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                        Vibration Anomaly Matrix by Machine Node
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-sans">
                      Safe bounds: &lt; 2.5 mm/s
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={machines} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke="#E2E6EA" vertical={false} />
                        <XAxis
                          dataKey="id"
                          tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "sans-serif" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "sans-serif" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#FFFFFF",
                            border: "1px solid #E2E6EA",
                            borderRadius: "8px",
                            fontFamily: "sans-serif",
                            fontSize: "11px",
                          }}
                          itemStyle={{ color: "#1A1F2E" }}
                        />
                        <Bar dataKey="vib" fill="#1B4F8A" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Machine Temperature Heat Chart */}
                <div className="flex-1 glass-panel p-4 flex flex-col bg-white border border-[#E2E6EA] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#1B4F8A]" />
                      <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                        Live Thermal Telemetry Curves
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-sans">
                      Real-time Sensor Monitoring
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={machines} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke="#E2E6EA" vertical={false} />
                        <XAxis
                          dataKey="id"
                          tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "sans-serif" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "sans-serif" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#FFFFFF",
                            border: "1px solid #E2E6EA",
                            borderRadius: "8px",
                            fontFamily: "sans-serif",
                            fontSize: "11px",
                          }}
                          itemStyle={{ color: "#1A1F2E" }}
                        />
                        <Line type="monotone" dataKey="temp" stroke="#2E7D5E" strokeWidth={2} dot={{ fill: "#2E7D5E" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Data Exporter Bar */}
              <div className="glass-panel p-4 flex items-center justify-between shrink-0 bg-white border border-[#E2E6EA] shadow-sm">
                <div>
                  <span className="font-sans text-xs font-bold text-[#1A1F2E] block">
                    Operations Telemetry Log Exporter
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    Export raw IoT sensor access telemetry and RFID security event logs.
                  </span>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded text-xs font-sans font-semibold bg-[#1B4F8A] hover:bg-[#1B4F8A]/90 text-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Operations Log</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: SITE SECURITY */}
          {screen === "security" && (
            <div className="h-full flex gap-4 p-4 overflow-hidden animate-fade-in bg-[#F4F5F7]">
              {/* CCTV Camera Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4 min-w-0">
                {[
                  { id: "sector1", title: "CAM 01 // SECTOR 1 MAINWAY", locked: lockdownSectors.sector1 },
                  { id: "sector4", title: "CAM 02 // SECTOR 4 RESTRICTED", locked: lockdownSectors.sector4 },
                  { id: "assemblyA", title: "CAM 03 // ASSEMBLY LINE A", locked: lockdownSectors.assemblyA },
                  { id: "loadingDock", title: "CAM 04 // LOADING DOCK B", locked: lockdownSectors.loadingDock },
                ].map(({ id, title, locked }) => (
                  <div key={id} className="glass-panel relative flex flex-col overflow-hidden group/cam bg-white border border-[#E2E6EA] shadow-sm">
                    {/* Cam Info Overlay */}
                    <div className="absolute top-0 inset-x-0 bg-[#F4F5F7]/95 backdrop-blur-sm p-2 flex items-center justify-between border-b border-[#E2E6EA] z-20">
                      <span className="font-sans text-[10px] font-bold text-[#1A1F2E]">{title}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${locked ? "bg-[#B91C1C]" : "bg-[#2E7D5E]"}`} />
                        <span className="font-sans text-[9px] text-[#6B7280] font-semibold">{locked ? "LOCKDOWN" : "LIVE FEED"}</span>
                      </div>
                    </div>

                    {/* CCTV SVG Video Simulation */}
                    <div className="flex-1 bg-[#EEF1F5] relative flex items-center justify-center overflow-hidden">
                      {locked ? (
                        <div className="text-center space-y-2 z-20">
                          <Lock className="w-10 h-10 text-[#B91C1C] mx-auto" />
                          <div className="text-[#B91C1C] font-sans text-xs font-bold uppercase tracking-wider">
                            Sector Lockdown Active
                          </div>
                          <div className="text-[#B91C1C]/70 font-sans text-[10px]">
                            Perimeter shield activated
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <svg className="w-full h-full max-h-[140px]" viewBox="0 0 200 100">
                            {/* Static Grid */}
                            <path d="M 0,25 L 200,25 M 0,50 L 200,50 M 0,75 L 200,75 M 50,0 L 50,100 M 100,0 L 100,100 M 150,0 L 150,100" stroke="#E2E6EA" strokeWidth="0.5" />
                            {/* Person Bounding box */}
                            {id === "sector4" ? (
                              <g>
                                <rect x="80" y="20" width="40" height="60" fill="none" stroke="#B91C1C" strokeWidth="1" />
                                <text x="82" y="16" fill="#B91C1C" fontSize="7" fontFamily="sans-serif" fontWeight="bold">
                                  Alert: Unknown Asset
                                </text>
                              </g>
                            ) : (
                              <g>
                                <rect x="40" y="30" width="30" height="50" fill="none" stroke="#2E7D5E" strokeWidth="0.8" />
                                <text x="42" y="26" fill="#2E7D5E" fontSize="6" fontFamily="sans-serif" fontWeight="bold">
                                  Operator Detected
                                </text>
                              </g>
                            )}
                            <circle cx="10" cy="90" r="2.5" fill="#2E7D5E" />
                            <text x="16" y="92.5" fill="#2E7D5E" fontSize="6" fontFamily="sans-serif" fontWeight="bold">REC</text>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Lockdown Toggle control */}
                    <div className="absolute bottom-2 right-2 z-20">
                      <button
                        onClick={() => {
                          playBeep("alert", soundEnabled);
                          setLockdownSectors((prev) => ({
                            ...prev,
                            [id]: !prev[id as keyof typeof lockdownSectors],
                          }));
                          toast.warning(`Sector lockdown toggled.`);
                        }}
                        className={`p-1.5 rounded border font-sans text-[10px] font-semibold transition-all flex items-center gap-1 shadow-sm ${
                          locked
                            ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5] hover:bg-[#FEE2E2]/85"
                            : "bg-white text-[#1B4F8A] border-[#E2E6EA] hover:bg-[#F4F5F7]"
                        }`}
                      >
                        {locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{locked ? "Unlock Sector" : "Lock Sector"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* RFID Access Logs Terminal */}
              <div className="w-80 glass-panel flex flex-col shrink-0 bg-white border border-[#E2E6EA] shadow-sm">
                <div className="p-3 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F4F5F7]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1B4F8A]" />
                    <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                      RFID Scan Terminal Stream
                    </span>
                  </div>
                  <span className="text-[10px] font-sans text-[#6B7280]">Auto-refreshing</span>
                </div>
                
                {/* Scrolling Console */}
                <div className="flex-1 bg-[#F4F5F7] p-3 overflow-y-auto font-mono text-[10px] text-[#1A1F2E] space-y-2 leading-relaxed">
                  {accessLogs.map((log, i) => (
                    <div key={i} className={`border-l-2 pl-2 py-0.5 rounded-r shadow-xs ${
                      log.includes("DENIED") || log.includes("WARNING")
                        ? "border-[#B91C1C] text-[#B91C1C] bg-[#FEE2E2]/40"
                        : "border-[#2E7D5E]/30 text-[#6B7280] bg-white/60"
                    }`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SETTINGS DIALOG */}
          {screen === "settings" && (
            <div className="h-full max-w-2xl mx-auto p-6 overflow-y-auto animate-fade-in bg-[#F4F5F7]">
              <div className="glass-panel p-6 space-y-6 bg-white border border-[#E2E6EA] shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-[#1A1F2E] font-sans">Axiom Dashboard Settings Panel</h2>
                  <p className="text-xs text-[#6B7280] mt-1 font-sans">Configure interface telemetry metrics, styling skins, and sound outputs.</p>
                </div>

                <div className="border-t border-[#E2E6EA] pt-4 space-y-6">
                  {/* Theme Switcher */}
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-bold text-[#6B7280] uppercase block">
                      Interface Theme Skin Selection
                    </label>
                    <span className="text-[11px] text-[#6B7280] block mb-2 font-sans">
                      Changes primary color tones, glows, and custom gradient accents instantly.
                    </span>
                    <div className="grid grid-cols-2 gap-3 font-sans">
                      {(Object.keys(THEMES) as ThemeKey[]).map((tKey) => {
                        const th = THEMES[tKey];
                        const isSel = themeMode === tKey;
                        return (
                          <button
                            key={tKey}
                            onClick={() => { playBeep("success", soundEnabled); setThemeMode(tKey); }}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              isSel ? "bg-[#F0F4F8] border-[#1B4F8A] font-semibold" : "bg-white hover:bg-[#F4F5F7] border-[#E2E6EA]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.primary }} />
                              <span className="text-xs text-[#1A1F2E]">{th.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sound Settings */}
                  <div className="flex items-center justify-between border-t border-[#E2E6EA] pt-4 font-sans">
                    <div>
                      <label className="text-xs font-sans font-bold text-[#6B7280] uppercase block">
                        Tactile Synthesizer Sounds
                      </label>
                      <span className="text-[11px] text-[#6B7280]">
                        Plays a synth frequency on panel clicks, alerts, and report downloads.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        playBeep("success", !soundEnabled);
                      }}
                      className={`p-2.5 rounded border transition-all ${
                        soundEnabled ? "bg-[#F0F4F8] border-[#1B4F8A]/30 text-[#1B4F8A]" : "bg-white border-[#E2E6EA] hover:bg-[#F4F5F7] text-[#6B7280]"
                      }`}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5 opacity-40" />
                      )}
                    </button>
                  </div>

                  {/* Telemetry Speed Configuration */}
                  <div className="border-t border-[#E2E6EA] pt-4 space-y-2 font-sans">
                    <label className="text-xs font-sans font-bold text-[#6B7280] uppercase block">
                      Live Telemetry Stream Speed
                    </label>
                    <span className="text-[11px] text-[#6B7280] block mb-2">
                      Adjusts telemetry loop frequency (Sensors fluctuation, RFID log updates).
                    </span>
                    <div className="flex gap-2">
                      {[
                        { val: "slow", label: "Slow Feed (4s)" },
                        { val: "normal", label: "Standard Feed (2s)" },
                        { val: "fast", label: "Real-time Fast (0.8s)" },
                      ].map(({ val, label }) => {
                        const isSel = telemetrySpeed === val;
                        return (
                          <button
                            key={val}
                            onClick={() => { playBeep("click", soundEnabled); setTelemetrySpeed(val as any); }}
                            className={`flex-1 text-center py-2 rounded text-[11px] font-sans font-semibold transition-all ${
                              isSel
                                ? "bg-[#1B4F8A] text-white"
                                : "bg-white border border-[#E2E6EA] text-[#6B7280] hover:bg-[#F4F5F7]"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[#E2E6EA] pt-4 flex gap-4 justify-between font-sans">
                    <span className="text-[11px] text-[#6B7280] self-center">
                      Axiom Build v2.4.2 // License Granted
                    </span>
                    <button
                      onClick={() => {
                        playBeep("success", soundEnabled);
                        setMachines(MACHINE_METRICS);
                        setIncidents(INITIAL_INCIDENTS);
                        setWorkers(WORKERS);
                        setLockdownSectors({ sector1: false, sector4: false, assemblyA: false, loadingDock: false });
                        toast.success("System mock data reset successfully.");
                      }}
                      className="px-4 py-2 border border-[#B91C1C]/20 hover:border-[#B91C1C]/40 bg-[#B91C1C]/5 hover:bg-[#B91C1C]/10 rounded text-xs font-semibold text-[#B91C1C] transition-colors"
                    >
                      Reset System Telemetry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// ─── INTERACTIVE FACTORY FLOOR SVG ───

interface InteractiveFactoryFloorProps {
  machines: Machine[];
  theme: typeof THEMES[ThemeKey];
  selectedMachineId: string | null;
  onSelectMachine: (id: string) => void;
}

function InteractiveFactoryFloor({
  machines,
  theme,
  selectedMachineId,
  onSelectMachine,
}: InteractiveFactoryFloorProps) {
  // 2D linear projection mapping from grid (gx, gy) to SVG coordinates (x, y)
  // gx is in range 1-10, gy is in range 1-5.
  // We scale them to fit inside the 670x370 SVG viewbox.
  const project = (gx: number, gy: number) => ({
    x: 60 + gx * 50,
    y: 80 + gy * 45,
  });

  const getMachineSize = (id: string) => {
    switch (id) {
      case "M-101": return { label: "CNC-01" };
      case "M-102": return { label: "AR-4" };
      case "M-103": return { label: "WS-2" };
      case "M-104": return { label: "IO-9" };
      case "M-105": return { label: "LC-1" };
      case "M-201": return { label: "TP-3" };
      case "M-202": return { label: "PK-5" };
      case "M-203": return { label: "OI-4" };
      default: return { label: "MACH" };
    }
  };

  const getMachineColor = (m: Machine) => {
    if (m.vib > 2.5) {
      return "#B91C1C"; // Critical (Deep red)
    } else if (m.vib > 1.4 || m.temp > 100) {
      return "#C87A1A"; // Warning (Amber)
    }
    return "#2E7D5E"; // Muted forest green
  };

  const connections: [number, number, number, number][] = [
    [1, 1, 3, 2],
    [3, 2, 5, 3],
    [5, 3, 7, 2],
    [7, 2, 9, 1],
    [2, 5, 8, 5],
    [3, 2, 2, 5],
    [7, 2, 8, 5],
    [9, 1, 10, 4],
  ];

  return (
    <svg viewBox="0 0 670 370" className="w-full h-full overflow-hidden rounded-md">
      <defs>
        {/* Subtle engineering grid */}
        <pattern id="engineering-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E6EA" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* 2D Schematic Background */}
      <rect width="100%" height="100%" fill="#EEF1F5" />
      <rect width="100%" height="100%" fill="url(#engineering-grid)" opacity="0.6" />

      {/* Connecting Flow Lines */}
      {connections.map(([fx, fy, tx, ty], i) => {
        const f = project(fx, fy);
        const t = project(tx, ty);
        return (
          <line
            key={`c-${i}`}
            x1={f.x}
            y1={f.y}
            x2={t.x}
            y2={t.y}
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Machine Nodes as 16px solid circles */}
      {machines.map((m) => {
        const { label } = getMachineSize(m.id);
        const isSelected = selectedMachineId === m.id;
        const pos = project(m.gx, m.gy);
        const nodeColor = getMachineColor(m);

        return (
          <g
            key={m.id}
            onClick={() => onSelectMachine(m.id)}
            className="cursor-pointer group/node"
          >
            {/* Larger transparent hover zone for easy clicks */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={18}
              fill="transparent"
            />

            {/* Selected highlight ring (static) */}
            {isSelected && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={13}
                fill="none"
                stroke="#1B4F8A"
                strokeWidth="2"
              />
            )}

            {/* 16px Solid node (r=8) */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={8}
              fill={nodeColor}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="transition-all duration-200 group-hover/node:scale-110"
            />

            {/* Machine Name text label above node */}
            <text
              x={pos.x}
              y={pos.y - 14}
              textAnchor="middle"
              className="font-sans text-[11px] font-bold fill-[#1A1F2E]"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
