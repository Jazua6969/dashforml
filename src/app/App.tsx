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
  Sun,
  Moon,
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

interface AccessLog {
  ts: string;
  type: "warning" | "rfid" | "sensor";
  id?: string;
  name?: string;
  station?: string;
  action?: "entered" | "exited" | "requested";
  status?: "Granted" | "Denied";
  customMsg?: string;
}

const TRANSLATIONS = {
  EN: {
    headerEngine: "Axiom telemetry engine",
    system: "System",
    opsOverview: "Operations Overview",
    workerManagement: "Worker Management Console",
    incidentCenter: "Incident Response Center",
    analytics: "Advanced Diagnostics & Analytics",
    securityPortal: "Site Security Portal",
    settings: "Telemetry Settings",
    liveControl: "Live Control",
    adminLevel: "Admin level 3",
    userProfile: "User",
    userAvatar: "U",
    navOps: "System",
    navWorkers: "Workers",
    navIncidents: "Incidents",
    navAnalytics: "Analytics",
    navSecurity: "Security",
    navSettings: "Settings",

    // KPI Cards in Ops Screen
    oeeTitle: "Overall Operations Efficiency",
    oeeYield: "OEE Yield",
    oeeBenchmark: "Target benchmark: 90%",
    bottlenecksTitle: "Throughput Bottlenecks",
    flowRate: "Flow Rate",
    blockageRisk: "Blockage Risk: ",
    flowingNormal: "Flowing Normal",
    flowingSlow: "Flowing Slow",
    flowingFast: "Flowing Fast",
    securityTitle: "Asset Pilferage & Security",
    activeBreach: "Active Breach",
    secure: "Secure",
    assetStatus: "Asset Status",
    activeBreachesLabel: "Active Breach(es)",
    zeroBreachesLabel: "0 Active Breaches",
    sector4Scanner: "Sector 4 scanner",
    defectsTitle: "Quality Defects & Inspection",
    yieldQuality: "Yield Quality",
    defectAnomaly: "Defect Anomaly(s)",
    noDefects: "0 Defects Flagged",
    mlInspector: "ML Visual inspector",

    // Schematic / Map
    floorMapTitle: "Interactive Factory Floor Telemetry Map",
    selectNode: "Select a node to view telemetry stream",
    actionClose: "Close",
    temperatureLabel: "Temperature",
    vibrationLabel: "Vibration",
    energyDrawLabel: "Energy Draw",
    operatorLabel: "Operator",
    statusUnassigned: "Unassigned",
    actionInspectWorker: "Inspect Assigned Worker",

    // Tabs
    tabAlerts: "Alerts",
    tabSensors: "IoT Sensors",
    tabModels: "AI Models",
    noActiveIncidents: "No active incidents",
    actionAcknowledge: "Acknowledge",
    actionResolve: "Resolve",
    aiModuleLabel: "AI Telemetry Module",
    conveyorChartTitle: "Conveyor Flow Capacity & Blockages (24h)",

    // Workers Screen
    workerProfiles: "Operator Profiles",
    searchOperators: "Search operators...",
    activityEfficiency: "Activity Efficiency",
    stationLabel: "Station: ",
    shiftLabel: "Shift: ",
    shiftAttendanceLabel: "Shift Attendance: ",
    toggleShift: "Toggle Shift Active / Break",
    triggerWarning: "Trigger Safety Warning",
    workerYieldRate: "Worker Yield Rate",
    assignedLineEff: "Assigned Line Efficiency",
    timeOnFloor: "Time on Floor",
    incidentHistory: "Incident History",
    complianceScore: "Compliance Score",
    performanceAlignment: "AI Performance Alignment Matrix",
    operatorStats: "Operator Stats",
    targetBenchmark: "Target Benchmark",
    shiftHistoryTimeline: "Shift History Timeline (Today)",
    axisTaskEff: "Task Eff.",
    axisSafetyProtocol: "Safety Protocol",
    axisStationAttendance: "Station Attendance",
    axisQualityOutput: "Quality Output",
    axisMLAlignment: "ML Alignment",
    axisResponseRate: "Response Rate",
    lineTarget: "Line Target",

    // Incidents Screen
    defectInjector: "Telemetry Defect Injector",
    defectInjectorDesc: "Simulate operations incidents and safety alerts on the live dashboard stream.",
    activeMetricsSummary: "Active Metrics Summary",
    totalRegisteredToday: "Total Registered Today",
    criticalFailures: "Critical Failures",
    warningsPending: "Warnings Pending",
    resolvedIncidents: "Resolved Incidents",
    clearHistoryLogs: "Clear History Logs",
    incidentLogsTitle: "Live Incident Logs & Response Actions",
    incidentLogsDesc: "Acknowledge alerts to deploy responders. Mark as resolved when completed.",
    noActiveAnomalies: "No Active Anomalies",
    noActiveAnomaliesDesc: "All telemetry systems reporting normal parameter bounds.",
    statusCritical: "Critical Failure",
    statusWarning: "Warning System",
    statusResolved: "Resolved",
    incidentIdLabel: "Incident ID: ",
    impactAreaLabel: "Impact Area: Assembly Floor Zone 4",
    statusResponding: "Responding...",
    statusClosed: "Closed",

    // Analytics Screen
    analyticsOee: "Overall Equipment Effectiveness",
    analyticsYield: "Assembly Line Yield Rate",
    analyticsSafety: "Safety Index Rating",
    analyticsResolution: "Average Incident Resolution",
    oeeDelta: "+2.4% over benchmark",
    yieldDelta: "Peak performance yield",
    safetyDelta: "Zero compliance violations",
    resolutionDelta: "-1.1 min this shift",
    vibrationMatrixTitle: "Vibration Anomaly Matrix by Machine Node",
    safeBoundsLabel: "Safe bounds: < 2.5 mm/s",
    thermalTelemetryTitle: "Live Thermal Telemetry Curves",
    realtimeMonitoringLabel: "Real-time Sensor Monitoring",
    logExporterTitle: "Operations Telemetry Log Exporter",
    logExporterDesc: "Export raw IoT sensor access telemetry and RFID security event logs.",
    exportLogsButton: "Export Operations Log",

    // Security Screen
    camLiveFeed: "LIVE FEED",
    camLockdown: "LOCKDOWN",
    lockdownActive: "Sector Lockdown Active",
    perimeterShield: "Perimeter shield activated",
    alertUnknownAsset: "Alert: Unknown Asset",
    operatorDetected: "Operator Detected",
    recIndicator: "REC",
    actionUnlockSector: "Unlock Sector",
    actionLockSector: "Lock Sector",
    rfidScanTitle: "RFID Scan Terminal Stream",
    autoRefreshing: "Auto-refreshing",

    // Settings Screen
    settingsTitle: "Axiom Dashboard Settings Panel",
    settingsDesc: "Configure interface telemetry metrics, styling skins, and sound outputs.",
    soundsLabel: "Tactile Synthesizer Sounds",
    soundsDesc: "Plays a synth frequency on panel clicks, alerts, and report downloads.",
    streamSpeedLabel: "Live Telemetry Stream Speed",
    streamSpeedDesc: "Adjusts telemetry loop frequency (Sensors fluctuation, RFID log updates).",
    speedSlow: "Slow Feed (4s)",
    speedNormal: "Standard Feed (2s)",
    speedFast: "Real-time Fast (0.8s)",
    axiomBuildLabel: "Axiom Build v2.4.2 // License Granted",
    resetSystemTelemetry: "Reset System Telemetry",

    // Toast Notifications
    toastIncidentDispatched: "Incident acknowledged. Operator dispatched.",
    toastIncidentResolved: "Incident resolved. Equipment status returned to Normal.",
    toastIncidentCleared: "Incident logs cleared.",
    toastLogsExported: "Operations log exported successfully.",
    toastShiftToggled: "Operator shift status toggled.",
    toastLockdownToggled: "Sector lockdown toggled.",
    toastResetSuccess: "System mock data reset successfully.",
  },
  "தமிழ்": {
    headerEngine: "ஆக்ஸியம் டெலிமெட்ரி எஞ்சின்",
    system: "கணினி",
    opsOverview: "செயல்பாடுகள் மேலோட்டம்",
    workerManagement: "பணியாளர் மேலாண்மை பணியகம்",
    incidentCenter: "சம்பவ பதில் மையம்",
    analytics: "மேம்பட்ட பகுப்பாய்வு",
    securityPortal: "தள பாதுகாப்பு போர்டல்",
    settings: "டெலிமெட்ரி அமைப்புகள்",
    liveControl: "நேரடி கட்டுப்பாடு",
    adminLevel: "நிர்வாக நிலை 3",
    userProfile: "பயனர்",
    userAvatar: "ப",
    navOps: "கணினி",
    navWorkers: "பணியாளர்கள்",
    navIncidents: "சம்பவங்கள்",
    navAnalytics: "பகுப்பாய்வு",
    navSecurity: "பாதுகாப்பு",
    navSettings: "அமைப்புகள்",

    oeeTitle: "ஒட்டுமொத்த செயல்பாட்டு திறன்",
    oeeYield: "OEE விளைச்சல்",
    oeeBenchmark: "இலக்கு அளவுகோல்: 90%",
    bottlenecksTitle: "செயல்திறன் தடைகள்",
    flowRate: "பாய்வு விகிதம்",
    blockageRisk: "தடை ஆபத்து: ",
    flowingNormal: "சாதாரண பாய்வு",
    flowingSlow: "மெதுவான பாய்வு",
    flowingFast: "வேகமான பாய்வு",
    securityTitle: "சொத்து திருட்டு & பாதுகாப்பு",
    activeBreach: "செயலில் உள்ள மீறல்",
    secure: "பாதுகாப்பானது",
    assetStatus: "சொத்து நிலை",
    activeBreachesLabel: "செயலில் உள்ள மீறல்(கள்)",
    zeroBreachesLabel: "0 செயலில் உள்ள மீறல்கள்",
    sector4Scanner: "பிரிவு 4 ஸ்கேனர்",
    defectsTitle: "தர குறைபாடுகள் & ஆய்வு",
    yieldQuality: "விளைச்சல் தரம்",
    defectAnomaly: "குறைபாடு அலைமாறல்(கள்)",
    noDefects: "0 குறைபாடுகள் குறிக்கப்பட்டன",
    mlInspector: "எம்.எல் காட்சி ஆய்வாளர்",

    floorMapTitle: "தொழிற்சாலை தரை டெலிமெட்ரி வரைபடம்",
    selectNode: "டெலிமெட்ரி பார்க்க ஒரு முனையைத் தேர்ந்தெடுக்கவும்",
    actionClose: "மூடு",
    temperatureLabel: "வெப்பநிலை",
    vibrationLabel: "அதிர்வு",
    energyDrawLabel: "ஆற்றல் நுகர்வு",
    operatorLabel: "பணியாளர்",
    statusUnassigned: "ஒதுக்கப்படவில்லை",
    actionInspectWorker: "ஒதுக்கப்பட்ட பணியாளரை ஆய்வு செய்",

    tabAlerts: "எச்சரிக்கைகள்",
    tabSensors: "IoT சென்சார்கள்",
    tabModels: "AI மாதிரிகள்",
    noActiveIncidents: "செயலில் சம்பவங்கள் இல்லை",
    actionAcknowledge: "அங்கீகரி",
    actionResolve: "தீர்வு காண்",
    aiModuleLabel: "AI டெலிமெட்ரி தொகுதி",
    conveyorChartTitle: "கன்வேயர் பாய்வு திறன் & தடைகள் (24ம)",

    workerProfiles: "பணியாளர் சுயவிவரங்கள்",
    searchOperators: "பணியாளர்களைத் தேடுங்கள்...",
    activityEfficiency: "செயல்பாட்டு திறன்",
    stationLabel: "நிலையம்: ",
    shiftLabel: "பணி மாற்று: ",
    shiftAttendanceLabel: "பணி மாற்று வருகை: ",
    toggleShift: "பணி மாற்றத்தை இயக்கு / இடைவேளை",
    triggerWarning: "பாதுகாப்பு எச்சரிக்கையைத் தூண்டு",
    workerYieldRate: "பணியாளர் விளைச்சல் விகிதம்",
    assignedLineEff: "ஒதுக்கப்பட்ட வரிசை திறன்",
    timeOnFloor: "தளத்தில் இருந்த நேரம்",
    incidentHistory: "சம்பவ வரலாறு",
    complianceScore: "இணக்க மதிப்பெண்",
    performanceAlignment: "AI செயல்திறன் சீரமைப்பு அணி",
    operatorStats: "பணியாளர் புள்ளிவிவரங்கள்",
    targetBenchmark: "இலக்கு அளவுகோல்",
    shiftHistoryTimeline: "பணி மாற்ற வரலாறு (இன்று)",
    axisTaskEff: "பணி திறன்",
    axisSafetyProtocol: "பாதுகாப்பு நெறிமுறை",
    axisStationAttendance: "நிலைய வருகை",
    axisQualityOutput: "தரமான வெளியீடு",
    axisMLAlignment: "ML சீரமைப்பு",
    axisResponseRate: "பதில் விகிதம்",
    lineTarget: "வரிசை இலக்கு",

    defectInjector: "டெலிமெட்ரி குறைபாடு உட்செலுத்தி",
    defectInjectorDesc: "நேரடி டாஷ்போர்டு ஸ்ட்ரீமில் செயல்பாட்டு சம்பவங்கள் மற்றும் பாதுகாப்பு எச்சரிக்கைகளை உருவகப்படுத்தவும்.",
    activeMetricsSummary: "செயலில் உள்ள அளவீடுகளின் சுருக்கம்",
    totalRegisteredToday: "இன்று பதிவு செய்யப்பட்ட மொத்தம்",
    criticalFailures: "முக்கிய தோல்விகள்",
    warningsPending: "நிலுவையில் உள்ள எச்சரிக்கைகள்",
    resolvedIncidents: "தீர்க்கப்பட்ட சம்பவங்கள்",
    clearHistoryLogs: "வரலாற்று பதிவுகளை அழிக்கவும்",
    incidentLogsTitle: "நேரடி சம்பவ பதிவுகள் & பதில் நடவடிக்கைகள்",
    incidentLogsDesc: "பதிலளிப்பவர்களைப் பயன்படுத்த எச்சரிக்கைகளை அங்கீகரிக்கவும். முடிந்ததும் தீர்க்கப்பட்டதாகக் குறிக்கவும்.",
    noActiveAnomalies: "செயலில் அலைமாறல்கள் இல்லை",
    noActiveAnomaliesDesc: "அனைத்து டெலிமெட்ரி அமைப்புகளும் சாதாரண அளவுரு வரம்புகளைப் புகாரளிக்கின்றன.",
    statusCritical: "முக்கிய தோல்வி",
    statusWarning: "எச்சரிக்கை அமைப்பு",
    statusResolved: "தீர்க்கப்பட்டது",
    incidentIdLabel: "சம்பவ எண்: ",
    impactAreaLabel: "தாக்க பகுதி: அசெம்பிளி தரை மண்டலம் 4",
    statusResponding: "பதிலளிக்கிறது...",
    statusClosed: "மூடப்பட்டது",

    analyticsOee: "ஒட்டுமொத்த உபகரண செயல்திறன்",
    analyticsYield: "அசெம்பிளி வரிசை விளைச்சல் விகிதம்",
    analyticsSafety: "பாதுகாப்பு குறியீட்டு மதிப்பீடு",
    analyticsResolution: "சராசரி சம்பவ தீர்வு நேரம்",
    oeeDelta: "அளவுகோலை விட +2.4%",
    yieldDelta: "உச்ச செயல்திறன் விளைச்சல்",
    safetyDelta: "பூஜ்ஜிய இணக்க மீறல்கள்",
    resolutionDelta: "இந்த ஷிப்டில் -1.1 நிமிடம்",
    vibrationMatrixTitle: "இயந்திர முனையத்தின் அதிர்வு முரண்பாடு அணி",
    safeBoundsLabel: "பாதுகாப்பான வரம்புகள்: < 2.5 mm/s",
    thermalTelemetryTitle: "நேரடி வெப்ப டெலிமெட்ரி வளைவுகள்",
    realtimeMonitoringLabel: "நேரடி சென்சார் கண்காணிப்பு",
    logExporterTitle: "செயல்பாடுகள் டெலிமெட்ரி பதிவு ஏற்றுமதி",
    logExporterDesc: "மூல IoT சென்சார் அணுகல் டெலிமெட்ரி மற்றும் RFID பாதுகாப்பு சம்பவ பதிவுகளை ஏற்றுமதி செய்யவும்.",
    exportLogsButton: "செயல்பாடுகள் பதிவை ஏற்றுமதி செய்",

    camLiveFeed: "நேரடி ஊட்டம்",
    camLockdown: "முடக்கம்",
    lockdownActive: "பிரிவு முடக்கம் செயலில் உள்ளது",
    perimeterShield: "சுற்றளவு கவசம் செயல்படுத்தப்பட்டது",
    alertUnknownAsset: "எச்சரிக்கை: அறியப்படாத சொத்து",
    operatorDetected: "பணியாளர் கண்டறியப்பட்டார்",
    recIndicator: "பதிவு",
    actionUnlockSector: "பிரிவைத் திறக்கவும்",
    actionLockSector: "பிரிவை முடக்கவும்",
    rfidScanTitle: "RFID ஸ்கேன் முனைய ஸ்ட்ரீம்",
    autoRefreshing: "தானாக புதுப்பிக்கப்படுகிறது",

    settingsTitle: "ஆக்ஸியம் டாஷ்போர்டு அமைப்புகள் குழு",
    settingsDesc: "இடைமுக டெலிமெட்ரி அளவீடுகள், வடிவமைப்பு தோல்கள் மற்றும் ஒலி வெளியீடுகளை உள்ளமைக்கவும்.",
    soundsLabel: "தொட்டுணரக்கூடிய சின்தசைசர் ஒலிகள்",
    soundsDesc: "பேனல் கிளிக்குகள், எச்சரிக்கைகள் மற்றும் அறிக்கை பதிவிறக்கங்களின் போது சின்த் அலைவரிசையை இயக்குகிறது.",
    streamSpeedLabel: "நேரடி டெலிமெட்ரி ஸ்ட்ரீம் வேகம்",
    streamSpeedDesc: "டெலிமெட்ரி லூப் அதிர்வெண்ணை சரிசெய்கிறது (சென்சார் ஏற்ற இறக்கம், RFID பதிவு புதுப்பிப்புகள்).",
    speedSlow: "மெதுவான ஊட்டம் (4 வி)",
    speedNormal: "சாதாரண ஊட்டம் (2 வி)",
    speedFast: "உடனடி ஊட்டம் (0.8 வி)",
    axiomBuildLabel: "ஆக்ஸியம் பில்ட் v2.4.2 // உரிமம் வழங்கப்பட்டது",
    resetSystemTelemetry: "கணினி டெலிமெட்ரியை மீட்டமை",

    toastIncidentDispatched: "சம்பவம் அங்கீகரிக்கப்பட்டது. ஆபரேட்டர் அனுப்பப்பட்டார்.",
    toastIncidentResolved: "சம்பவம் தீர்க்கப்பட்டது. உபகரணங்கள் நிலை இயல்பு நிலைக்குத் திரும்பியது.",
    toastIncidentCleared: "சம்பவ பதிவுகள் அழிக்கப்பட்டன.",
    toastLogsExported: "செயல்பாடுகள் பதிவு வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது.",
    toastShiftToggled: "இயக்குநரின் பணி மாற்று நிலை மாற்றப்பட்டது.",
    toastLockdownToggled: "பிரிவு முடக்கம் மாற்றப்பட்டது.",
    toastResetSuccess: "கணினி போலி தரவு வெற்றிகரமாக மீட்டமைக்கப்பட்டது.",
  },
  "हिन्दी": {
    headerEngine: "एक्सिओम टेलीमेट्री इंजन",
    system: "सिस्टम",
    opsOverview: "संचालन अवलोकन",
    workerManagement: "कर्मचारी प्रबंधन कंसोल",
    incidentCenter: "घटना प्रतिक्रिया केंद्र",
    analytics: "उन्नत निदान और विश्लेषण",
    securityPortal: "साइट सुरक्षा पोर्टल",
    settings: "टेलीमेट्री सेटिंग्स",
    liveControl: "लाइव नियंत्रण",
    adminLevel: "प्रशासक स्तर 3",
    userProfile: "उपयोगकर्ता",
    userAvatar: "उ",
    navOps: "सिस्टम",
    navWorkers: "कर्मचारी",
    navIncidents: "घटनाएँ",
    navAnalytics: "विश्लेषण",
    navSecurity: "सुरक्षा",
    navSettings: "सेटिंग्स",

    oeeTitle: "कुल परिचालन दक्षता",
    oeeYield: "OEE उपज",
    oeeBenchmark: "लक्ष्य बेंचमार्क: 90%",
    bottlenecksTitle: "थ्रूपुट अड़चनें",
    flowRate: "प्रवाह दर",
    blockageRisk: "अवरोध जोखिम: ",
    flowingNormal: "सामान्य प्रवाह",
    flowingSlow: "धीमा प्रवाह",
    flowingFast: "तेज प्रवाह",
    securityTitle: "संपत्ति चोरी और सुरक्षा",
    activeBreach: "सक्रिय उल्लंघन",
    secure: "सुरक्षित",
    assetStatus: "संपत्ति की स्थिति",
    activeBreachesLabel: "सक्रिय उल्लंघन",
    zeroBreachesLabel: "0 सक्रिय उल्लंघन",
    sector4Scanner: "सेक्टर 4 स्कैनर",
    defectsTitle: "गुणवत्ता दोष और निरीक्षण",
    yieldQuality: "उपज गुणवत्ता",
    defectAnomaly: "दोष विसंगति",
    noDefects: "0 दोष ध्वजांकित",
    mlInspector: "एमएल विजुअल इंस्पेक्टर",

    floorMapTitle: "फ़ैक्टरी फ़्लोर टेलीमेट्री मानचित्र",
    selectNode: "टेलीमेट्री स्ट्रीम देखने के लिए एक नोड चुनें",
    actionClose: "बंद करें",
    temperatureLabel: "तापमान",
    vibrationLabel: "कंपन",
    energyDrawLabel: "ऊर्जा खपत",
    operatorLabel: "ऑपरेटर",
    statusUnassigned: "अनावंटित",
    actionInspectWorker: "आवंटित कर्मचारी का निरीक्षण करें",

    tabAlerts: "अलर्ट",
    tabSensors: "IoT सेंसर",
    tabModels: "AI मॉडल",
    noActiveIncidents: "कोई सक्रिय घटना नहीं",
    actionAcknowledge: "स्वीकार करें",
    actionResolve: "सुलझाएं",
    aiModuleLabel: "AI टेलीमेट्री मॉड्यूल",
    conveyorChartTitle: "कन्वेयर प्रवाह क्षमता और रुकावटें (24 घंटे)",

    workerProfiles: "ऑपरेटर प्रोफाइल",
    searchOperators: "ऑपरेटर खोजें...",
    activityEfficiency: "गतिविधि दक्षता",
    stationLabel: "स्टेशन: ",
    shiftLabel: "शिफ्ट: ",
    shiftAttendanceLabel: "शिफ्ट उपस्थिति: ",
    toggleShift: "शिफ्ट सक्रिय / ब्रेक टॉगल करें",
    triggerWarning: "सुरक्षा चेतावनी ट्रिगर करें",
    workerYieldRate: "कर्मचारी उपज दर",
    assignedLineEff: "आवंटित लाइन दक्षता",
    timeOnFloor: "फ्लोर पर समय",
    incidentHistory: "घटना इतिहास",
    complianceScore: "अनुपालन स्कोर",
    performanceAlignment: "एीआई प्रदर्शन संरेखण मैट्रिक्स",
    operatorStats: "ऑपरेटर आँकड़े",
    targetBenchmark: "लक्ष्य बेंचमार्क",
    shiftHistoryTimeline: "शिफ्ट इतिहास टाइमलाइन (आज)",
    axisTaskEff: "कार्य दक्षता",
    axisSafetyProtocol: "सुरक्षा प्रोटोकॉल",
    axisStationAttendance: "स्टेशन उपस्थिति",
    axisQualityOutput: "गुणवत्ता आउटपुट",
    axisMLAlignment: "एमएल संरेखण",
    axisResponseRate: "प्रतिक्रिया दर",
    lineTarget: "लाइन लक्ष्य",

    defectInjector: "टेलीमेट्री दोष इंजेक्टर",
    defectInjectorDesc: "लाइव डैशबोर्ड स्ट्रीम पर संचालन घटनाओं और सुरक्षा अलर्ट का अनुकरण करें।",
    activeMetricsSummary: "सक्रिय मेट्रिक्स सारांश",
    totalRegisteredToday: "आज पंजीकृत कुल",
    criticalFailures: "गंभीर विफलताएं",
    warningsPending: "लंबित चेतावनी",
    resolvedIncidents: "सुलझाए गए मामले",
    clearHistoryLogs: "इतिहास लॉग साफ़ करें",
    incidentLogsTitle: "लाइव घटना लॉग और प्रतिक्रिया कार्रवाई",
    incidentLogsDesc: "जवाबदेहों को तैनात करने के लिए अलर्ट स्वीकार करें। पूरा होने पर सुलझाया गया चिह्नित करें।",
    noActiveAnomalies: "कोई सक्रिय विसंगति नहीं",
    noActiveAnomaliesDesc: "सभी टेलीमेट्री सिस्टम सामान्य मापदंडों की रिपोर्ट कर रहे हैं।",
    statusCritical: "गंभीर विफलता",
    statusWarning: "चेतावनी प्रणाली",
    statusResolved: "सुलझाया गया",
    incidentIdLabel: "घटना आईडी: ",
    impactAreaLabel: "प्रभाव क्षेत्र: असेंबली फ्लोर जोन 4",
    statusResponding: "प्रतिक्रिया दी जा रही है...",
    statusClosed: "बंद",

    analyticsOee: "कुल उपकरण प्रभावशीलता",
    analyticsYield: "असेंबली लाइन उपज दर",
    analyticsSafety: "सुरक्षा सूचकांक रेटिंग",
    analyticsResolution: "औसत घटना समाधान समय",
    oeeDelta: "बेंचमार्क से +2.4% अधिक",
    yieldDelta: "शिखर प्रदर्शन उपज",
    safetyDelta: "शून्य अनुपालन उल्लंघन",
    resolutionDelta: "इस शिफ्ट में -1.1 मिनट",
    vibrationMatrixTitle: "मशीन नोड द्वारा कंपन विसंगति मैट्रिक्स",
    safeBoundsLabel: "सुरक्षित सीमा: < 2.5 mm/s",
    thermalTelemetryTitle: "लाइव थर्मल टेलीमेट्री वक्र",
    realtimeMonitoringLabel: "वास्तविक समय सेंसर निगरानी",
    logExporterTitle: "संचालन टेलीमेट्री लॉग निर्यातक",
    logExporterDesc: "कच्चे IoT सेंसर एक्सेस टेलीमेट्री और RFID सुरक्षा घटना लॉग निर्यात करें।",
    exportLogsButton: "संचालन लॉग निर्यात करें",

    camLiveFeed: "लाइव फीड",
    camLockdown: "लॉकडाउन",
    lockdownActive: "सेक्टर लॉकडाउन सक्रिय",
    perimeterShield: "परिवेश कवच सक्रिय",
    alertUnknownAsset: "चेतावनी: अज्ञात संपत्ति",
    operatorDetected: "ऑपरेटर का पता चला",
    recIndicator: "रिकॉर्ड",
    actionUnlockSector: "सेक्टर अनलॉक करें",
    actionLockSector: "सेक्टर लॉक करें",
    rfidScanTitle: "RFID स्कैन टर्मिनल स्ट्रीम",
    autoRefreshing: "ऑटो-रिफ्रेशिंग",

    settingsTitle: "एक्सिओम डैशबोर्ड सेटिंग्स पैनल",
    settingsDesc: "इंटरफ़ेस टेलीमेट्री मेट्रिक्स, स्टाइलिंग स्किन और ध्वनि आउटपुट कॉन्फ़िगर करें।",
    soundsLabel: "स्पर्शनीय सिंथेसाइज़र ध्वनियाँ",
    soundsDesc: "पैनल क्लिक, अलर्ट और रिपोर्ट डाउनलोड पर सिंथ आवृत्ति चलाता है।",
    streamSpeedLabel: "लाइव टेलीमेट्री स्ट्रीम गति",
    streamSpeedDesc: "टेलीमेट्री लूप आवृत्ति को समायोजित करता है (सेंसर उतार-चढ़ाव, आरएफआईडी लॉग अपडेट)।",
    speedSlow: "धीमी फीड (4s)",
    speedNormal: "मानक फीड (2s)",
    speedFast: "वास्तविक समय तेज़ (0.8s)",
    axiomBuildLabel: "एक्सिओम बिल्ड v2.4.2 // लाइसेंस स्वीकृत",
    resetSystemTelemetry: "सिस्टम टेलीमेट्री रीसेट करें",

    toastIncidentDispatched: "घटना स्वीकार की गई। ऑपरेटर तैनात किया गया।",
    toastIncidentResolved: "घटना सुलझ गई। उपकरण की स्थिति सामान्य हो गई।",
    toastIncidentCleared: "घटना लॉग साफ़ किए गए।",
    toastLogsExported: "संचालन लॉग सफलतापूर्वक निर्यात किया गया।",
    toastShiftToggled: "ऑपरेटर शिफ्ट की स्थिति बदली गई।",
    toastLockdownToggled: "सेक्टर लॉकडाउन बदला गया।",
    toastResetSuccess: "सिस्टम मॉक डेटा सफलतापूर्वक रीसेट किया गया।",
  }
};

const translateStation = (station: string, currentLang: Lang) => {
  if (currentLang === "EN") return station;
  const stationsMap: Record<string, Record<Lang, string>> = {
    "Assembly Line A": { EN: "Assembly Line A", "தமிழ்": "அசெம்பிளி வரிசை A", "हिन्दी": "असेंबली लाइन A" },
    "Assembly A": { EN: "Assembly A", "தமிழ்": "அசெம்பிளி A", "हिन्दी": "असेंबली A" },
    "Quality Control": { EN: "Quality Control", "தமிழ்": "தர கட்டுப்பாடு", "हिन्दी": "गुणवत्ता नियंत्रण" },
    "Packing Zone": { EN: "Packing Zone", "தமிழ்": "பேக்கிங் பகுதி", "हिन्दी": "पैकिंग क्षेत्र" },
    "Loading Bay": { EN: "Loading Bay", "தமிழ்": "ஏற்றும் தளம்", "हिन्दी": "लोडिंग बे" },
    "Inspection Deck": { EN: "Inspection Deck", "தமிழ்": "ஆய்வு தளம்", "हिन्दी": "निरीक्षण डेक" },
    "Assembly Line B": { EN: "Assembly Line B", "தமிழ்": "அசெம்பிளி வரிசை B", "हिन्दी": "असेंबली लाइन B" },
    "Sector 4": { EN: "Sector 4", "தமிழ்": "பிரிவு 4", "हिन्दी": "सेक्टर 4" }
  };
  return stationsMap[station]?.[currentLang] || station;
};

const translateShift = (shift: string, currentLang: Lang) => {
  if (currentLang === "EN") return shift;
  const shiftsMap: Record<string, Record<Lang, string>> = {
    "Day": { EN: "Day", "தமிழ்": "பகல்", "हिन्दी": "दिन" },
    "Night": { EN: "Night", "தமிழ்": "இரவு", "हिन्दी": "रात" },
    "Break": { EN: "Break", "தமிழ்": "இடைவேளை", "हिन्दी": "ब्रेक" }
  };
  return shiftsMap[shift]?.[currentLang] || shift;
};

const translateStatus = (status: string, currentLang: Lang) => {
  if (currentLang === "EN") return status;
  const statusMap: Record<string, Record<Lang, string>> = {
    "active": { EN: "active", "தமிழ்": "செயலில்", "हिन्दी": "सक्रिय" },
    "warning": { EN: "warning", "தமிழ்": "எச்சரிக்கை", "हिन्दी": "चेतावनी" },
    "idle": { EN: "idle", "தமிழ்": "செயலற்றது", "हिन्दी": "निष्क्रिय" }
  };
  return statusMap[status]?.[currentLang] || status;
};

const translateIncidentText = (msg: string, currentLang: Lang) => {
  if (currentLang === "EN") return msg;
  const msgsMap: Record<string, Record<Lang, string>> = {
    "Unauthorized Asset Movement — Sector 4": {
      EN: "Unauthorized Asset Movement — Sector 4",
      "தமிழ்": "அனுமதியற்ற சொத்து இயக்கம் — பிரிவு 4",
      "हिन्दी": "अनधिकृत संपत्ति आंदोलन — सेक्टर 4"
    },
    "Micro-fracture detected on Assembly Line B — 1.2% rate": {
      EN: "Micro-fracture detected on Assembly Line B — 1.2% rate",
      "தமிழ்": "அசெம்பிளி வரிசை B இல் நுண்-முறிவு கண்டறியப்பட்டது — 1.2% வீதம்",
      "हिन्दी": "असेंबली लाइन B पर सूक्ष्म-दरार का पता चला — 1.2% दर"
    },
    "Worker pathing anomaly — Zone 7 clearance confirmed": {
      EN: "Worker pathing anomaly — Zone 7 clearance confirmed",
      "தமிழ்": "பணியாளர் பாதை அலைமாறல் — மண்டலம் 7 அனுமதி உறுதிப்படுத்தப்பட்டது",
      "हिन्दी": "कर्मचारी मार्ग विसंगति — ज़ोन 7 मंजूरी की पुष्टि"
    },
    "Thermal runaway: Solder WS-2 temperature peaked 238.5°C": {
      EN: "Thermal runaway: Solder WS-2 temperature peaked 238.5°C",
      "தமிழ்": "வெப்ப ஓட்டம்: சாலிடர் WS-2 வெப்பநிலை 238.5°C ஐ எட்டியது",
      "हिन्दी": "थर्मल रनअवे: सोल्डर WS-2 तापमान 238.5°C पर पहुंच गया"
    },
    "Vibration anomaly detected on CNC-01. Structural warning rate: 1.9mm/s": {
      EN: "Vibration anomaly detected on CNC-01. Structural warning rate: 1.9mm/s",
      "தமிழ்": "CNC-01 இல் அதிர்வு அலைமாறல் கண்டறியப்பட்டது. கட்டமைப்பு எச்சரிக்கை வீதம்: 1.9mm/s",
      "हिन्दी": "CNC-01 पर कंपन विसंगति का पता चला। संरचनात्मक चेतावनी दर: 1.9mm/s"
    },
    "PPE Violation: Line A assembly area - helmet compliance failure.": {
      EN: "PPE Violation: Line A assembly area - helmet compliance failure.",
      "தமிழ்": "PPE மீறல்: வரிசை A அசெம்பிளி பகுதி - தலைக்கவசம் இணக்கத் தோல்வி.",
      "हिन्दी": "पीपीई उल्लंघन: लाइन A असेंबली क्षेत्र - हेलमेट अनुपालन विफलता।"
    },
    "Power surge on Loading Dock conveyor: peak rate: 14kW": {
      EN: "Power surge on Loading Dock conveyor: peak rate: 14kW",
      "தமிழ்": "ஏற்றும் தள கன்வேயரில் மின் எழுச்சி: உச்ச விகிதம்: 14kW",
      "हिन्दी": "लोडिंग डॉक कन्वेयर पर बिजली की वृद्धि: शिखर दर: 14kW"
    }
  };
  if (msg.startsWith("Path deviation warning for")) {
    const workerName = msg.replace("Path deviation warning for ", "").replace(" near restricted Zone R-4", "");
    if (currentLang === "தமிழ்") {
      return `கட்டுப்படுத்தப்பட்ட மண்டலம் R-4 இன் அருகில் ${workerName} க்கான பாதை விலகல் எச்சரிக்கை`;
    } else if (currentLang === "हिन्दी") {
      return `प्रतिबंधित क्षेत्र R-4 के पास ${workerName} के लिए पथ विचलन चेतावनी`;
    }
  }
  return msgsMap[msg]?.[currentLang] || msg;
};

const translateIncidentLabel = (label: string, currentLang: Lang) => {
  if (currentLang === "EN") return label;
  const labelsMap: Record<string, Record<Lang, string>> = {
    "Thermal runaway on Wave Solder WS-2": {
      EN: "Thermal runaway on Wave Solder WS-2",
      "தமிழ்": "அலை சாலிடர் WS-2 இல் வெப்ப ஓட்டம்",
      "हिन्दी": "वेव सोल्डर WS-2 पर थर्मल रनअवे"
    },
    "Vibration anomaly CNC-01 (1.9mm/s)": {
      EN: "Vibration anomaly CNC-01 (1.9mm/s)",
      "தமிழ்": "அதிர்வு அலைமாறல் CNC-01 (1.9mm/s)",
      "हिन्दी": "कंपन विसंगति CNC-01 (1.9mm/s)"
    },
    "PPE Violation: Missing Hardhat Line A": {
      EN: "PPE Violation: Missing Hardhat Line A",
      "தமிழ்": "PPE மீறல்: அசெம்பிளி வரிசை A இல் தலைக்கவசம் இல்லை",
      "हिन्दी": "पीपीई उल्लंघन: हेलमेट गायब लाइन A"
    },
    "Power surge on Loading Dock conveyor": {
      EN: "Power surge on Loading Dock conveyor",
      "தமிழ்": "ஏற்றும் தள கன்வேயரில் மின் எழுச்சி",
      "हिन्दी": "लोडिंग डॉक कन्वेयर पर बिजली की वृद्धि"
    }
  };
  return labelsMap[label]?.[currentLang] || label;
};

const translateTimelineMsg = (msg: string, currentLang: Lang) => {
  if (currentLang === "EN") return msg;
  const msgsMap: Record<string, Record<Lang, string>> = {
    "Safety compliance verification scan complete.": {
      EN: "Safety compliance verification scan complete.",
      "தமிழ்": "பாதுகாப்பு இணக்க சரிபார்ப்பு ஸ்கேன் முடிந்தது.",
      "हिन्दी": "सुरक्षा अनुपालन सत्यापन स्कैन पूरा हुआ।"
    },
    "Began scheduled worker rotation sequence.": {
      EN: "Began scheduled worker rotation sequence.",
      "தமிழ்": "திட்டமிடப்பட்ட பணியாளர் சுழற்சி முறை தொடங்கப்பட்டது.",
      "हिन्दी": "अनुसूचित कर्मचारी रोटेशन अनुक्रम शुरू हुआ।"
    },
    "Refreshed assembly parts calibration logs.": {
      EN: "Refreshed assembly parts calibration logs.",
      "தமிழ்": "அசெம்பிளி பாகங்கள் அளவுத்திருத்த பதிவுகள் புதுப்பிக்கப்பட்டன.",
      "हिन्दी": "असेंबली भागों के अंशांकन लॉग ताज़ा किए गए।"
    },
    "Flagged micro-vibration warning CNC-01.": {
      EN: "Flagged micro-vibration warning CNC-01.",
      "தமிழ்": "குறு அதிர்வு எச்சரிக்கை CNC-01 குறிக்கப்பட்டது.",
      "हिन्दी": "सूक्ष्म कंपन चेतावनी CNC-01 को ध्वजांकित किया गया।"
    },
    "Shift checkout initialized. RFID verified.": {
      EN: "Shift checkout initialized. RFID verified.",
      "தமிழ்": "பணி மாற்ற வெளியேற்றம் தொடங்கப்பட்டது. RFID சரிபார்க்கப்பட்டது.",
      "हिन्दी": "शिफ्ट चेकआउट प्रारंभ। आरएफआईडी सत्यापित।"
    }
  };
  return msgsMap[msg]?.[currentLang] || msg;
};

const translateCamTitle = (title: string, currentLang: Lang) => {
  if (currentLang === "EN") return title;
  const camMap: Record<string, Record<Lang, string>> = {
    "CAM 01 // SECTOR 1 MAINWAY": {
      EN: "CAM 01 // SECTOR 1 MAINWAY",
      "தமிழ்": "கேமரா 01 // பிரிவு 1 முதன்மை வழி",
      "हिन्दी": "कैमरा 01 // सेक्टर 1 मुख्य मार्ग"
    },
    "CAM 02 // SECTOR 4 RESTRICTED": {
      EN: "CAM 02 // SECTOR 4 RESTRICTED",
      "தமிழ்": "கேமரா 02 // பிரிவு 4 தடைசெய்யப்பட்ட பகுதி",
      "हिन्दी": "कैमरा 02 // सेक्टर 4 प्रतिबंधित"
    },
    "CAM 03 // ASSEMBLY LINE A": {
      EN: "CAM 03 // ASSEMBLY LINE A",
      "தமிழ்": "கேமரா 03 // அசெம்பிளி வரிசை A",
      "हिन्दी": "कैमरा 03 // असेंबली लाइन A"
    },
    "CAM 04 // LOADING DOCK B": {
      EN: "CAM 04 // LOADING DOCK B",
      "தமிழ்": "கேமரா 04 // ஏற்றும் தளம் B",
      "हिन्दी": "कैमरा 04 // लोडिंग डॉक B"
    }
  };
  return camMap[title]?.[currentLang] || title;
};

const translateMachineName = (name: string, currentLang: Lang) => {
  if (currentLang === "EN") return name;
  const machinesMap: Record<string, Record<Lang, string>> = {
    "CNC Milling CNC-01": { EN: "CNC Milling CNC-01", "தமிழ்": "CNC மில்லிங் CNC-01", "हिन्दी": "सीएनसी मिलिंग CNC-01" },
    "Assembly Robot AR-4": { EN: "Assembly Robot AR-4", "தமிழ்": "அசெம்பிளி ரோபோ AR-4", "हिन्दी": "असेंबली रोबोट AR-4" },
    "Wave Soldering WS-2": { EN: "Wave Soldering WS-2", "தமிழ்": "வேவ் சாலிடரிங் WS-2", "हिन्दी": "वेव सोल्डरिंग WS-2" },
    "Inspection Optical IO-9": { EN: "Inspection Optical IO-9", "தமிழ்": "ஆப்டிகல் ஆய்வு IO-9", "हिन्दी": "ऑप्टिकल इंस्पेक्टर IO-9" },
    "Laser Cutter LC-1": { EN: "Laser Cutter LC-1", "தமிழ்": "லேசர் கட்டர் LC-1", "हिन्दी": "लेजर कटर LC-1" },
    "Thermal Press TP-3": { EN: "Thermal Press TP-3", "தமிழ்": "வெப்ப பிரஸ் TP-3", "हिन्दी": "थर्मल प्रेस TP-3" },
    "Packing Belt PK-5": { EN: "Packing Belt PK-5", "தமிழ்": "பேக்கிங் பெல்ट PK-5", "हिन्दी": "पैकिंग बेल्ट PK-5" },
    "Optical Inspector OI-4": { EN: "Optical Inspector OI-4", "தமிழ்": "ஆப்டிகல் ஆய்வாளர் OI-4", "हिन्दी": "ऑप्टिकल इंस्पेक्टर OI-4" }
  };
  return machinesMap[name]?.[currentLang] || name;
};

const formatAccessLog = (log: AccessLog, currentLang: Lang) => {
  const timePrefix = `${log.ts} - `;
  if (log.type === "warning") {
    const msg = log.customMsg === "Unauthorized movement Sector 4 camera."
      ? (currentLang === "EN" ? "SECURITY WARNING: Unauthorized movement Sector 4 camera."
         : currentLang === "தமிழ்" ? "பாதுகாப்பு எச்சரிக்கை: பிரிவு 4 கேமராவில் அனுமதியற்ற இயக்கம்."
         : "सुरक्षा चेतावनी: सेक्टर 4 कैमरे में अनधिकृत गतिविधि।")
      : log.customMsg || "";
    return timePrefix + msg;
  }
  if (log.type === "sensor") {
    const msg = log.customMsg === "Thermal Press TP-3 heat curve calibration complete."
      ? (currentLang === "EN" ? "Sensor scan: Thermal Press TP-3 heat curve calibration complete."
         : currentLang === "தமிழ்" ? "சென்சார் ஸ்கேன்: தெர்மல் பிரஸ் TP-3 வெப்ப வளைவு அளவுத்திருத்தம் முடிந்தது."
         : "सेंसर स्कैन: थर्मल प्रेस TP-3 हीट कर्व कैलिब्रेशन पूरा हुआ।")
      : log.customMsg || "";
    return timePrefix + msg;
  }
  if (log.type === "rfid") {
    const sName = translateStation(log.station || "", currentLang);
    const statusStr = log.status === "Granted"
      ? (currentLang === "EN" ? "Granted." : currentLang === "தமிழ்" ? "அनुமதிக்கப்பட்டது." : "स्वीकृत।")
      : (currentLang === "EN" ? "DENIED (Access Violation)." : currentLang === "தமிழ்" ? "அனுமதி மறுக்கப்பட்டது (பாதுகாப்பு மீறல்)." : "अस्वीकृत (पहुंच उल्लंघन)।");
    
    let actionStr = "";
    if (log.action === "entered") {
      actionStr = currentLang === "EN" ? "entered" : currentLang === "தமிழ்" ? "நுழைந்தார்" : "प्रवेश किया";
    } else if (log.action === "exited") {
      actionStr = currentLang === "EN" ? "exited for break" : currentLang === "தமிழ்" ? "இடைவேளைக்காக வெளியேறினார்" : "ब्रेक के लिए बाहर गए";
    } else {
      actionStr = currentLang === "EN" ? "requested access" : currentLang === "தமிழ்" ? "அணுகல் கோரினார்" : "पहुंच का अनुरोध किया";
    }

    if (currentLang === "EN") {
      return `${timePrefix}RFID read: ${log.id} (${log.name}) ${actionStr} ${sName} - ${statusStr}`;
    } else if (currentLang === "தமிழ்") {
      return `${timePrefix}RFID வாசிப்பு: ${log.id} (${log.name}) ${sName} பகுதிக்கு ${actionStr} - ${statusStr}`;
    } else {
      return `${timePrefix}RFID रीड: ${log.id} (${log.name}) ने ${sName} के लिए ${actionStr} - ${statusStr}`;
    }
  }
  return "";
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
  const [isDark, setIsDark] = useState<boolean>(false);

  // Toggle dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

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
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    { ts: "14:02:11", type: "warning", customMsg: "Unauthorized movement Sector 4 camera." },
    { ts: "13:58:45", type: "rfid", id: "W-0034", name: "Meera Iyer", station: "Quality Control", action: "entered", status: "Granted" },
    { ts: "13:54:12", type: "sensor", customMsg: "Thermal Press TP-3 heat curve calibration complete." },
    { ts: "13:50:33", type: "rfid", id: "W-0102", name: "Karthik Murugan", station: "Inspection Deck", action: "entered", status: "Granted" },
    { ts: "13:46:18", type: "rfid", id: "W-0118", name: "Anitha Devi", station: "Assembly Line B", action: "exited", status: "Granted" },
  ]);

  const activeTheme = THEMES[themeMode];
  const t = TRANSLATIONS[lang];

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
      const newLog: AccessLog = {
        ts,
        type: "rfid",
        id: ids[randomIdx],
        name: names[randomIdx],
        station: stations[randomIdx],
        action: "requested",
        status: isGranted ? "Granted" : "Denied",
      };

      setAccessLogs((prev) => [newLog, ...prev.slice(0, 14)]);
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
    toast.error(`${lang === "EN" ? "ALERT" : lang === "தமிழ்" ? "எச்சரிக்கை" : "अलर्ट"}: ${translateIncidentText(message, lang)}`, {
      description: `${lang === "EN" ? "Time" : lang === "தமிழ்" ? "நேரம்" : "समय"}: ${ts} | ${lang === "EN" ? "Severity" : lang === "தமிழ்" ? "தீவிரம்" : "तीव्रता"}: ${sev.toUpperCase()}`,
      duration: 5000,
    });
  };

  const handleAcknowledgeIncident = (id: number) => {
    playBeep("click", soundEnabled);
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, acknowledged: true } : inc)));
    toast.info(t.toastIncidentDispatched);
  };

  const handleResolveIncident = (id: number) => {
    playBeep("success", soundEnabled);
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, resolved: true, acknowledged: true } : inc)));
    toast.success(t.toastIncidentResolved);
  };

  const handleClearIncidents = () => {
    playBeep("click", soundEnabled);
    setIncidents([]);
    toast.success(t.toastIncidentCleared);
  };

  // Mock Report Downloader
  const handleExportCSV = () => {
    playBeep("success", soundEnabled);
    const headers = "Timestamp,Log Details,Category\n";
    const rows = accessLogs.map((log) => {
      const formatted = formatAccessLog(log, lang);
      return `"${log.ts}","${formatted.slice(11)}","Access Event"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `axiom_ops_report_${Date.now()}.csv`;
    link.click();
    toast.success(t.toastLogsExported);
  };

  // Hexagon/Radar Chart Baseline Generation
  const selectedWorkerRadar = useMemo(() => {
    const e = selectedWorker.eff;
    return [
      { axis: t.axisTaskEff, value: e || 20, base: 80 },
      { axis: t.axisSafetyProtocol, value: selectedWorker.status === "active" ? Math.min(e + 5, 100) : 30, base: 80 },
      { axis: t.axisStationAttendance, value: selectedWorker.status === "idle" ? 0 : Math.max(e - 10, 50), base: 80 },
      { axis: t.axisQualityOutput, value: selectedWorker.status === "active" ? Math.min(e - 5, 100) : 10, base: 80 },
      { axis: t.axisMLAlignment, value: selectedWorker.status === "active" ? Math.min(Math.max(e - 4, 10), 100) : 20, base: 80 },
      { axis: t.axisResponseRate, value: selectedWorker.status === "active" ? Math.max(e - 15, 45) : 10, base: 80 },
    ];
  }, [selectedWorker, t]);

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
            { id: "ops", labelKey: "navOps", Icon: LayoutDashboard },
            { id: "workers", labelKey: "navWorkers", Icon: Users },
            { id: "incidents", labelKey: "navIncidents", Icon: AlertTriangle, badgeCount: activeAlertsCount },
            { id: "analytics", labelKey: "navAnalytics", Icon: Activity },
            { id: "security", labelKey: "navSecurity", Icon: Shield },
          ].map(({ id, labelKey, Icon, badgeCount }) => {
            const isActive = screen === id;
            const label = (t as any)[labelKey];
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
            title={t.navSettings}
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
              {t.headerEngine}
            </span>
            <div className="h-3 w-[1px] bg-border" />
            <h1 className="text-sm font-semibold tracking-wide text-foreground capitalize flex items-center gap-2">
              <span>{t.system}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 text-foreground" />
              <span className="opacity-90 font-medium text-xs font-mono bg-muted px-2 py-0.5 rounded border border-border text-foreground/80">
                {screen === "ops" ? t.opsOverview :
                 screen === "workers" ? t.workerManagement :
                 screen === "incidents" ? t.incidentCenter :
                 screen === "analytics" ? t.analytics :
                 screen === "security" ? t.securityPortal : t.settings}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-live-dot" />
              <span className="font-mono text-[10px] text-accent tracking-widest uppercase">{t.liveControl}</span>
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
                <div className="text-[11px] font-bold leading-none text-foreground">{t.userProfile}</div>
                <div className="text-[9px] font-mono leading-none text-[#6B7280] mt-0.5">{t.adminLevel}</div>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{
                  backgroundColor: activeTheme.primary,
                }}
              >
                {t.userAvatar}
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
                <div className="grid grid-cols-4 gap-4 shrink-0 stagger-children">
                  
                  {/* KPI 1: EFFICIENCY */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all border-l-4 border-l-[#1B4F8A] shadow-sm bg-white animate-fade-in">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">{t.oeeTitle}</span>
                      <Activity className="w-4 h-4 text-[#1B4F8A]" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2 animate-count-in">
                      <span className="text-[36px] font-bold text-[#1B4F8A] leading-none font-sans">{avgEfficiency}%</span>
                      <span className="text-[12px] font-sans text-[#2E7D5E] font-medium">{t.oeeYield}</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#2E7D5E] animate-bar-grow" style={{ width: `${avgEfficiency}%` }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 text-right">{t.oeeBenchmark}</div>
                  </div>

                  {/* KPI 2: BOTTLENECKS */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all border-l-4 border-l-[#C87A1A] shadow-sm bg-white animate-fade-in">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">{t.bottlenecksTitle}</span>
                      <Zap className="w-4 h-4 text-[#C87A1A]" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[36px] font-bold text-[#1B4F8A] leading-none font-sans">{currentFlow}%</span>
                      <span className="text-[12px] font-sans text-[#6B7280]">{t.flowRate}</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#1B4F8A] animate-bar-grow" style={{ width: `${currentFlow}%` }} />
                      <div className="h-full bg-[#B91C1C] animate-bar-grow" style={{ width: `${currentBlock}%`, animationDelay: '0.2s' }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 flex justify-between">
                      <span>{t.blockageRisk}{currentBlock}%</span>
                      <span>{t.flowingNormal}</span>
                    </div>
                  </div>

                  {/* KPI 3: PILFERAGE & SECURITY */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all shadow-sm bg-white animate-fade-in"
                       style={{ borderLeft: pilferageCount > 0 ? "4px solid #B91C1C" : "4px solid #2E7D5E" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">{t.securityTitle}</span>
                      <Shield className="w-4 h-4" style={{ color: pilferageCount > 0 ? "#B91C1C" : "#2E7D5E" }} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {pilferageCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#B91C1C] text-white">
                          {t.activeBreach}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#E6F4EA] text-[#2E7D5E]">
                          {t.secure}
                        </span>
                      )}
                      <span className="text-[12px] font-sans text-[#6B7280]">{t.assetStatus}</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: pilferageCount > 0 ? "100%" : "0%", backgroundColor: pilferageCount > 0 ? "#B91C1C" : "#2E7D5E" }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 flex justify-between">
                      <span style={{ color: pilferageCount > 0 ? "#B91C1C" : "inherit" }} className={pilferageCount > 0 ? "font-semibold" : ""}>
                        {pilferageCount > 0 ? `${pilferageCount} ${t.activeBreachesLabel}` : t.zeroBreachesLabel}
                      </span>
                      <span>{t.sector4Scanner}</span>
                    </div>
                  </div>

                  {/* KPI 4: DEFECTS */}
                  <div className="glass-panel p-4 flex flex-col justify-between transition-all shadow-sm bg-white animate-fade-in"
                       style={{ borderLeft: defectCount > 0 ? "4px solid #C87A1A" : "4px solid #2E7D5E" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[#6B7280] font-sans">{t.defectsTitle}</span>
                      <AlertCircle className="w-4 h-4" style={{ color: defectCount > 0 ? "#C87A1A" : "#2E7D5E" }} />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[36px] font-bold text-[#1B4F8A] leading-none font-sans">{yieldRate}%</span>
                      <span className="text-[12px] font-sans text-[#2E7D5E] font-medium">{t.yieldQuality}</span>
                    </div>
                    <div className="mt-3.5 h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(0, parseFloat(yieldRate))}%`, backgroundColor: defectCount > 0 ? "#C87A1A" : "#2E7D5E" }} />
                    </div>
                    <div className="text-[11px] font-sans text-[#6B7280] mt-2 flex justify-between">
                      <span style={{ color: defectCount > 0 ? "#C87A1A" : "inherit" }} className={defectCount > 0 ? "font-semibold" : ""}>
                        {defectCount > 0 ? `${defectCount} ${t.defectAnomaly}` : t.noDefects}
                      </span>
                      <span>{t.mlInspector}</span>
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
                          {t.floorMapTitle}
                        </span>
                      </div>
                      <span className="text-[11px] font-sans text-[#6B7280]">
                        {t.selectNode}
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
                      <div className="absolute bottom-4 left-4 w-72 border border-[#E2E6EA] bg-white p-4 z-30 shadow-lg rounded-lg animate-slide-up" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                        {(() => {
                          const mach = machines.find((m) => m.id === selectedMachineId);
                          if (!mach) return null;
                          return (
                            <div>
                              <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-2 mb-3">
                                <span className="text-xs font-sans font-bold text-[#1A1F2E]">{translateMachineName(mach.name, lang)}</span>
                                <button
                                  onClick={() => setSelectedMachineId(null)}
                                  className="text-[#6B7280] hover:text-[#1A1F2E] text-xs font-sans font-semibold"
                                >
                                  {t.actionClose}
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">{t.temperatureLabel}</div>
                                  <div className="text-sm font-sans font-bold text-[#1B4F8A]">
                                    {mach.temp.toFixed(1)}°C
                                  </div>
                                </div>
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">{t.vibrationLabel}</div>
                                  <div className="text-sm font-sans font-bold text-[#1B4F8A]">
                                    {mach.vib.toFixed(2)} mm/s
                                  </div>
                                </div>
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">{t.energyDrawLabel}</div>
                                  <div className="text-sm font-sans font-bold text-[#1B4F8A]">
                                    {mach.power.toFixed(1)} kW
                                  </div>
                                </div>
                                <div className="bg-[#F4F5F7] p-2 rounded border border-[#E2E6EA]">
                                  <div className="text-[10px] text-[#6B7280] font-sans font-medium">{t.operatorLabel}</div>
                                  <div className="text-xs font-sans font-bold truncate text-[#2E7D5E]">
                                    {selectedMachineOperator ? selectedMachineOperator.name : t.statusUnassigned}
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
                                {t.actionInspectWorker}
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
                          { id: "alerts", label: t.tabAlerts },
                          { id: "telemetry", label: t.tabSensors },
                          { id: "models", label: t.tabModels },
                        ].map((tb) => (
                          <button
                            key={tb.id}
                            onClick={() => { playBeep("click", soundEnabled); setOpsTab(tb.id as any); }}
                            className={`flex-1 py-2.5 font-sans text-[11px] font-bold border-r border-[#E2E6EA] last:border-r-0 transition-all ${
                              opsTab === tb.id
                                ? "text-[#1B4F8A] bg-white border-b-2 border-b-[#1B4F8A]"
                                : "text-[#6B7280] hover:text-[#1B4F8A]"
                            }`}
                          >
                            {tb.label}
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
                                <span className="text-[12px] font-sans font-semibold text-[#6B7280]">{t.noActiveIncidents}</span>
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
                                      {inc.sev === "critical" ? t.statusCritical : inc.sev === "warning" ? t.statusWarning : t.statusResolved}
                                    </span>
                                    <span className="text-[10px] font-sans text-[#6B7280]">{inc.ts}</span>
                                  </div>
                                  <p className="text-[12px] text-[#1A1F2E] leading-normal font-sans font-medium mb-2.5">{translateIncidentText(inc.msg, lang)}</p>
                                  <div className="flex gap-2 justify-end">
                                    {!inc.acknowledged && (
                                      <button
                                        onClick={() => handleAcknowledgeIncident(inc.id)}
                                        className="px-2.5 py-1 text-[10px] font-sans font-semibold border border-[#E2E6EA] hover:bg-[#F4F5F7] text-[#1B4F8A] rounded transition-colors"
                                      >
                                        {t.actionAcknowledge}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleResolveIncident(inc.id)}
                                      className="px-2.5 py-1 text-[10px] font-sans font-semibold border border-[#E2E6EA] hover:bg-[#E6F4EA] text-[#2E7D5E] hover:border-[#2E7D5E] rounded transition-colors"
                                    >
                                      {t.actionResolve}
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
                                  <span className="text-[12px] font-bold text-[#1A1F2E] block">{translateMachineName(m.name, lang)}</span>
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
                                  <span className="text-[10px] font-sans text-[#6B7280]">{t.aiModuleLabel}</span>
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
                        {t.conveyorChartTitle}
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
                              name={t.flowRate}
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
                      {t.workerProfiles}
                    </span>
                  </div>
                  
                  {/* Search / Filter Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7280]" />
                    <input
                      type="text"
                      placeholder={t.searchOperators}
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
                            {translateStatus(w.status, lang)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-sans">
                          <span>{translateStation(w.station, lang)}</span>
                          <span>{w.id}</span>
                        </div>

                        {w.status !== "idle" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-[9px] text-[#6B7280] font-sans mb-1">
                              <span>{t.activityEfficiency}</span>
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
                        <span>{t.stationLabel}{translateStation(selectedWorker.station, lang)}</span>
                        <span>•</span>
                        <span>{t.shiftLabel}{translateShift(selectedWorker.shift, lang)}</span>
                        <span>•</span>
                        <span>{t.shiftAttendanceLabel}98.2%</span>
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
                          toast.info(t.toastShiftToggled);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#E2E6EA] rounded text-xs font-sans font-semibold text-[#1B4F8A] transition-colors shadow-sm"
                      >
                        {t.toggleShift}
                      </button>
                      <button
                        onClick={() => {
                          handleTriggerIncident("warning", `Path deviation warning for ${selectedWorker.name} near restricted Zone R-4`);
                        }}
                        className="px-3.5 py-1.5 bg-[#FEE2E2] hover:bg-[#FEE2E2]/85 border border-[#FCA5A5] rounded text-xs font-sans font-semibold text-[#B91C1C] transition-colors shadow-sm"
                      >
                        {t.triggerWarning}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 border-t border-[#E2E6EA] pt-4 mt-1">
                    {[
                      { label: t.workerYieldRate, val: selectedWorker.status === "idle" ? "0%" : "99.4%", color: "#1B4F8A" },
                      { label: t.assignedLineEff, val: selectedWorker.status === "idle" ? "0%" : `${selectedWorker.eff}%`, color: "#1B4F8A" },
                      { label: t.timeOnFloor, val: selectedWorker.status === "idle" ? "0.0h" : "6.2h", color: "#2E7D5E" },
                      { label: t.incidentHistory, val: lang === "EN" ? "0 Alerts" : lang === "தமிழ்" ? "0 எச்சரிக்கைகள்" : "0 अलर्ट", color: "#2E7D5E" },
                      { label: t.complianceScore, val: "100%", color: "#2E7D5E" },
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
                        {t.performanceAlignment}
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
                            name={t.lineTarget}
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
                        <span className="text-[10px] font-sans text-[#6B7280]">{t.operatorStats}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 border border-dashed rounded" style={{ borderColor: "#2E7D5E" }} />
                        <span className="text-[10px] font-sans text-[#6B7280]">{t.targetBenchmark}</span>
                      </div>
                    </div>
                  </div>

                  {/* Worker Timeline */}
                  <div className="w-72 glass-panel p-4 flex flex-col shrink-0 bg-white">
                    <span className="font-sans text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3 block">
                      {t.shiftHistoryTimeline}
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
                          <p className="text-[11px] text-[#1A1F2E] leading-relaxed font-sans">{translateTimelineMsg(msg, lang)}</p>
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
                      {t.defectInjector}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    {t.defectInjectorDesc}
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
                            {sev === "critical" ? t.statusCritical : t.statusWarning}
                          </span>
                        </div>
                        {translateIncidentLabel(label, lang)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-4 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4 text-[#1B4F8A]" />
                      <span className="font-sans text-[11px] font-bold text-[#6B7280]">
                        {t.activeMetricsSummary}
                      </span>
                    </div>
                    <div className="space-y-2.5 mt-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">{t.totalRegisteredToday}</span>
                        <span className="text-xs font-sans font-bold text-[#1A1F2E]">{incidents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">{t.criticalFailures}</span>
                        <span className="text-xs font-sans font-bold text-[#B91C1C]">
                          {incidents.filter((i) => i.sev === "critical" && !i.resolved).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">{t.warningsPending}</span>
                        <span className="text-xs font-sans font-bold text-[#C87A1A]">
                          {incidents.filter((i) => i.sev === "warning" && !i.resolved).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[#6B7280]">{t.resolvedIncidents}</span>
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
                    {t.clearHistoryLogs}
                  </button>
                </div>
              </div>

              {/* Incidents Live Feed Panel */}
              <div className="flex-1 glass-panel flex flex-col min-w-0 bg-white">
                <div className="p-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F4F5F7]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
                    <span className="font-sans text-xs font-bold text-[#1A1F2E]">
                      {t.incidentLogsTitle}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-[#6B7280]">
                    {t.incidentLogsDesc}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                  {incidents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                      <CheckCircle className="w-12 h-12 text-[#2E7D5E] mb-2" />
                      <div className="text-sm font-sans font-bold text-[#1A1F2E]">{t.noActiveAnomalies}</div>
                      <div className="text-xs text-[#6B7280] mt-1">{t.noActiveAnomaliesDesc}</div>
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
                              {inc.resolved ? t.statusResolved : inc.sev === "critical" ? t.statusCritical : t.statusWarning}
                            </span>
                            <span className="text-[10px] font-sans text-[#6B7280]">{inc.ts}</span>
                          </div>
                          <p className="text-sm font-semibold text-[#1A1F2E]">{translateIncidentText(inc.msg, lang)}</p>
                          <div className="flex gap-4 mt-2.5 text-[10px] font-sans text-[#6B7280]">
                            <span>{t.incidentIdLabel}INC-{inc.id.toString().slice(-4)}</span>
                            <span>•</span>
                            <span>{t.impactAreaLabel}</span>
                          </div>
                        </div>

                        {/* Interactive response actions */}
                        <div className="flex items-center gap-2">
                          {!inc.acknowledged && !inc.resolved && (
                            <button
                              onClick={() => handleAcknowledgeIncident(inc.id)}
                              className="px-3.5 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#E2E6EA] rounded text-xs font-sans font-semibold text-[#1B4F8A] transition-colors shadow-sm"
                            >
                              {t.actionAcknowledge}
                            </button>
                          )}
                          {inc.acknowledged && !inc.resolved && (
                            <span className="text-[10px] font-sans font-bold text-[#1B4F8A] bg-[#F0F4F8] border border-[#1B4F8A]/20 px-2.5 py-1.5 rounded uppercase">
                              {t.statusResponding}
                            </span>
                          )}
                          {!inc.resolved && (
                            <button
                              onClick={() => handleResolveIncident(inc.id)}
                              className="px-3.5 py-1.5 bg-white hover:bg-[#E6F4EA] border border-[#E2E6EA] hover:border-[#2E7D5E] rounded text-xs font-sans font-semibold text-[#2E7D5E] transition-colors shadow-sm"
                            >
                              {t.actionResolve}
                            </button>
                          )}
                          {inc.resolved && (
                            <span className="text-[10px] font-sans font-bold text-[#2E7D5E] bg-[#E6F4EA] border border-[#2E7D5E]/20 px-2.5 py-1.5 rounded uppercase flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3" /> {t.statusClosed}
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
                  { label: t.analyticsOee, val: `${avgEfficiency}%`, delta: t.oeeDelta, color: "#1B4F8A" },
                  { label: t.analyticsYield, val: "99.85%", delta: t.yieldDelta, color: "#2E7D5E" },
                  { label: t.analyticsSafety, val: "100%", delta: t.safetyDelta, color: "#2E7D5E" },
                  { label: t.analyticsResolution, val: lang === "EN" ? "4.2m" : lang === "தமிழ்" ? "4.2 நிமி" : "4.2 मि", delta: t.resolutionDelta, color: "#1B4F8A" },
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
                        {t.vibrationMatrixTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-sans">
                      {t.safeBoundsLabel}
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
                        {t.thermalTelemetryTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-sans">
                      {t.realtimeMonitoringLabel}
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
                    {t.logExporterTitle}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    {t.logExporterDesc}
                  </span>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded text-xs font-sans font-semibold bg-[#1B4F8A] hover:bg-[#1B4F8A]/90 text-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.exportLogsButton}</span>
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
                      <span className="font-sans text-[10px] font-bold text-[#1A1F2E]">{translateCamTitle(title, lang)}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${locked ? "bg-[#B91C1C]" : "bg-[#2E7D5E] animate-live-dot"}`} />
                        <span className="font-sans text-[9px] text-[#6B7280] font-semibold">{locked ? t.camLockdown : t.camLiveFeed}</span>
                      </div>
                    </div>

                    {/* CCTV SVG Video Simulation */}
                    <div className="flex-1 bg-[#EEF1F5] relative flex items-center justify-center overflow-hidden">
                      {locked ? (
                        <div className="text-center space-y-2 z-20">
                          <Lock className="w-10 h-10 text-[#B91C1C] mx-auto" />
                          <div className="text-[#B91C1C] font-sans text-xs font-bold uppercase tracking-wider">
                            {t.lockdownActive}
                          </div>
                          <div className="text-[#B91C1C]/70 font-sans text-[10px]">
                            {t.perimeterShield}
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
                                  {t.alertUnknownAsset}
                                </text>
                              </g>
                            ) : (
                              <g>
                                <rect x="40" y="30" width="30" height="50" fill="none" stroke="#2E7D5E" strokeWidth="0.8" />
                                <text x="42" y="26" fill="#2E7D5E" fontSize="6" fontFamily="sans-serif" fontWeight="bold">
                                  {t.operatorDetected}
                                </text>
                              </g>
                            )}
                            <circle cx="10" cy="90" r="2.5" fill="#2E7D5E" />
                            <text x="16" y="92.5" fill="#2E7D5E" fontSize="6" fontFamily="sans-serif" fontWeight="bold">{t.recIndicator}</text>
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
                          toast.warning(t.toastLockdownToggled);
                        }}
                        className={`p-1.5 rounded border font-sans text-[10px] font-semibold transition-all flex items-center gap-1 shadow-sm ${
                          locked
                            ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5] hover:bg-[#FEE2E2]/85"
                            : "bg-white text-[#1B4F8A] border-[#E2E6EA] hover:bg-[#F4F5F7]"
                        }`}
                      >
                        {locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{locked ? t.actionUnlockSector : t.actionLockSector}</span>
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
                      {t.rfidScanTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-sans text-[#6B7280]">{t.autoRefreshing}</span>
                </div>
                
                {/* Scrolling Console */}
                <div className="flex-1 bg-[#F4F5F7] p-3 overflow-y-auto font-mono text-[10px] text-[#1A1F2E] space-y-2 leading-relaxed">
                  {accessLogs.map((logObj, i) => {
                    const formatted = formatAccessLog(logObj, lang);
                    const isAlert = logObj.type === "warning" || logObj.status === "Denied";
                    return (
                      <div
                        key={i}
                        className={`border-l-2 pl-2 py-0.5 rounded-r shadow-xs ${
                          isAlert
                            ? "border-[#B91C1C] text-[#B91C1C] bg-[#FEE2E2]/40"
                            : "border-[#2E7D5E]/30 text-[#6B7280] bg-white/60"
                        } ${i === 0 ? "animate-log-entry" : ""}`}
                      >
                        {formatted}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SETTINGS DIALOG */}
          {screen === "settings" && (
            <div className="h-full max-w-2xl mx-auto p-6 overflow-y-auto animate-fade-in bg-[#F4F5F7]">
              <div className="glass-panel p-6 space-y-6 bg-white border border-[#E2E6EA] shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-[#1A1F2E] font-sans">{t.settingsTitle}</h2>
                  <p className="text-xs text-[#6B7280] mt-1 font-sans">{t.settingsDesc}</p>
                </div>

                <div className="border-t border-[#E2E6EA] pt-4 space-y-6">
                  {/* Sound Settings */}
                  <div className="flex items-center justify-between pt-4 font-sans">
                    <div>
                      <label className="text-xs font-sans font-bold text-[#6B7280] uppercase block">
                        {t.soundsLabel}
                      </label>
                      <span className="text-[11px] text-[#6B7280]">
                        {t.soundsDesc}
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
                      {t.streamSpeedLabel}
                    </label>
                    <span className="text-[11px] text-[#6B7280] block mb-2">
                      {t.streamSpeedDesc}
                    </span>
                    <div className="flex gap-2">
                      {[
                        { val: "slow", label: t.speedSlow },
                        { val: "normal", label: t.speedNormal },
                        { val: "fast", label: t.speedFast },
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
                      {t.axiomBuildLabel}
                    </span>
                    <button
                      onClick={() => {
                        playBeep("success", soundEnabled);
                        setMachines(MACHINE_METRICS);
                        setIncidents(INITIAL_INCIDENTS);
                        setWorkers(WORKERS);
                        setLockdownSectors({ sector1: false, sector4: false, assemblyA: false, loadingDock: false });
                        toast.success(t.toastResetSuccess);
                      }}
                      className="px-4 py-2 border border-[#B91C1C]/20 hover:border-[#B91C1C]/40 bg-[#B91C1C]/5 hover:bg-[#B91C1C]/10 rounded text-xs font-semibold text-[#B91C1C] transition-colors"
                    >
                      {t.resetSystemTelemetry}
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
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
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
