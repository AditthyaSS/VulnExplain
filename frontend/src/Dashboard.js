import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Upload, Github, AlertTriangle, CheckCircle, DollarSign, Download, ChevronDown, ChevronRight, Moon, Sun, Check, X, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from "sonner";
import { useTheme } from "@/ThemeContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Severity ranking for dynamic comparison
const SEVERITY_RANK = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Info: 1
};

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("code");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedVulns, setExpandedVulns] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "all"
  const [chartView, setChartView] = useState("financial"); // "financial" or "severity"
  const [animatedRisk, setAnimatedRisk] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(() => {
    return localStorage.getItem('selectedPlan') || 'starter';
  });
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  // ISSUE 4 FIX: Updated scanning steps
  const scanSteps = [
    "Initializing secure scan environment",
    "Parsing repository structure",
    "Running static analysis engine",
    "Detecting vulnerability patterns",
    "Evaluating dependency risks",
    "Mapping compliance impact",
    "Calculating risk score"
  ];

  // Count-up animation for financial risk
  useEffect(() => {
    if (auditResult && auditResult.detailedImpact) {
      const targetValue = auditResult.detailedImpact.totalINR;
      const duration = 1000; // 1 second
      const steps = 60; // 60 frames
      const increment = targetValue / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setAnimatedRisk(Math.floor(increment * currentStep));
        } else {
          setAnimatedRisk(targetValue);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedRisk(0);
    }
  }, [auditResult]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCodeAudit = async () => {
    if (!codeSnippet.trim()) {
      toast.error("Please enter code to audit");
      return;
    }

    setLoading(true);
    setIsScanning(true);
    setScanStep(0);

    // Animate scan steps
    const stepInterval = setInterval(() => {
      setScanStep(prev => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600); // 600ms per step

    try {
      const response = await axios.post(`${API}/audit`, {
        code_snippet: codeSnippet,
        language: "auto-detect"
      }, {
        timeout: 120000
      });
      
      // Complete remaining steps immediately
      clearInterval(stepInterval);
      setScanStep(scanSteps.length - 1);
      
      // Wait a moment before showing results
      setTimeout(() => {
        setAuditResult(response.data);
        setIsScanning(false);
        setScanStep(0);
        toast.success("Security audit completed");
      }, 800);
      
    } catch (error) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setScanStep(0);
      console.error("Audit error:", error);
      toast.error("Audit failed: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRepoAudit = async () => {
    setLoading(true);
    setIsScanning(true);
    setScanStep(0);

    // Animate scan steps
    const stepInterval = setInterval(() => {
      setScanStep(prev => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    try {
      const formData = new FormData();
      
      if (activeTab === "github" && githubUrl) {
        formData.append("github_url", githubUrl);
      } else if (activeTab === "upload" && file) {
        formData.append("file", file);
      } else {
        setIsScanning(false);
        setScanStep(0);
        clearInterval(stepInterval);
        toast.error("Please provide a GitHub URL or upload a file");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API}/audit-repo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      
      // Complete remaining steps immediately
      clearInterval(stepInterval);
      setScanStep(scanSteps.length - 1);
      
      // Wait a moment before showing results
      setTimeout(() => {
        setAuditResult(response.data);
        setIsScanning(false);
        setScanStep(0);
        toast.success("Security audit completed");
      }, 800);
      
    } catch (error) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setScanStep(0);
      console.error("Audit error:", error);
      toast.error("Audit failed: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'info': return 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300 border-gray-300 dark:border-gray-600';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate risk grade from security score
  const getRiskGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700', status: 'Secure' };
    if (score >= 75) return { grade: 'B', color: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700', status: 'Good' };
    if (score >= 60) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700', status: 'Fix Required' };
    if (score >= 40) return { grade: 'D', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700', status: 'Fix Required' };
    return { grade: 'F', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700', status: 'Fix Required' };
  };

  // Group vulnerabilities by category dynamically
  const groupVulnerabilities = (vulnerabilities) => {
    const groups = {};
    vulnerabilities.forEach(vuln => {
      const category = vuln.category || 'Other Security Issues';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(vuln);
    });
    return groups;
  };

  // Team collaboration handlers
  const handleTeamClick = () => {
    if (selectedPlan === 'enterprise') {
      setShowTeamPanel(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleShareSummary = () => {
    if (shareEmail.trim()) {
      toast.success('AI Summary shared successfully!', {
        description: `Sent to ${shareEmail}`
      });
      setShareEmail('');
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  // Get highest severity in a group
  const getGroupSeverity = (vulns) => {
    let highest = { severity: 'Info', rank: 0 };
    vulns.forEach(v => {
      const rank = SEVERITY_RANK[v.severity] || 0;
      if (rank > highest.rank) {
        highest = { severity: v.severity, rank };
      }
    });
    return highest.severity;
  };

  // Calculate severity distribution
  const getSeverityDistribution = (vulnerabilities) => {
    const dist = {};
    vulnerabilities.forEach(v => {
      dist[v.severity] = (dist[v.severity] || 0) + 1;
    });
    return dist;
  };

  // Toggle group expansion
  const toggleGroup = (category) => {
    setExpandedGroups(prev => {
      // Close all other groups, open only clicked one
      const newState = {};
      if (!prev[category]) {
        newState[category] = true;
      }
      return newState;
    });
  };

  // Toggle vulnerability description
  const toggleVuln = (vulnId) => {
    setExpandedVulns(prev => ({
      ...prev,
      [vulnId]: !prev[vulnId]
    }));
  };

  // Download PDF report
  const handleDownloadReport = async () => {
    if (!auditResult) {
      toast.error("No audit result to download");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/generate-report`,
        auditResult,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'VulnExplain-Security-Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    }
  };

  // Dynamic chart data based on chartView mode
  const chartData = auditResult ? (
    chartView === "financial" ? [
      { name: 'Fix Costs', value: auditResult.detailedImpact.breakdown.fixCost, fill: '#3b82f6' },
      { name: 'Downtime', value: auditResult.detailedImpact.breakdown.downtime, fill: '#ef4444' },
      { name: 'Legal/Fines', value: auditResult.detailedImpact.breakdown.regulatoryFines, fill: '#f59e0b' },
      { name: 'Reputation', value: auditResult.detailedImpact.breakdown.reputation, fill: '#8b5cf6' }
    ] : [
      // Severity View - dynamically computed
      { name: 'Critical', value: auditResult.vulnerabilities.filter(v => v.severity === 'Critical').length, fill: '#ef4444' },
      { name: 'High', value: auditResult.vulnerabilities.filter(v => v.severity === 'High').length, fill: '#f97316' },
      { name: 'Medium', value: auditResult.vulnerabilities.filter(v => v.severity === 'Medium').length, fill: '#eab308' },
      { name: 'Low', value: auditResult.vulnerabilities.filter(v => v.severity === 'Low').length, fill: '#3b82f6' },
      { name: 'Info', value: auditResult.vulnerabilities.filter(v => v.severity === 'Info').length, fill: '#6b7280' }
    ].filter(item => item.value > 0) // Only show severities that exist
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-950 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">VulnExplain</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">B2B Security Audit Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Current Plan Badge */}
              <Badge className={`
                ${selectedPlan === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                ${selectedPlan === 'enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                ${selectedPlan === 'starter' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                text-xs font-medium px-3 py-1
              `}>
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
              </Badge>

              {/* Team Button */}
              <Button
                onClick={handleTeamClick}
                variant="outline"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                data-testid="team-btn"
              >
                <span className="mr-2">👥</span>
                Team
              </Button>

              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className="border-slate-300 dark:border-slate-600"
                data-testid="theme-toggle-btn"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>
              
              {/* Download Report - Always Enabled (Demo) */}
              {auditResult && (
                <Button
                  onClick={() => {
                    if (selectedPlan === 'starter') {
                      toast.info('PDF export is part of Pro plan (enabled for demo)', {
                        duration: 3000
                      });
                    }
                    handleDownloadReport();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  data-testid="download-report-btn"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                  <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 font-medium">
                    Pro
                  </Badge>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        {isScanning ? (
          /* Scanning Animation Screen */
          <div className="flex items-center justify-center min-h-[600px]">
            <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 max-w-2xl w-full transition-colors duration-300">
              <CardContent className="pt-12 pb-12">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
                    <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Security Scan in Progress</h2>
                  <p className="text-slate-600 dark:text-slate-400">Analyzing your code for vulnerabilities...</p>
                </div>

                <div className="space-y-4">
                  {scanSteps.map((step, index) => {
                    const isCompleted = index < scanStep;
                    const isActive = index === scanStep;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                          isActive ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : 
                          isCompleted ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 
                          'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : isActive ? (
                            <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <p className={`text-sm font-medium ${
                          isCompleted ? 'text-green-800 dark:text-green-300' : 
                          isActive ? 'text-blue-800 dark:text-blue-300' : 
                          'text-slate-500 dark:text-slate-400'
                        }`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : auditResult ? (
          <>
            {/* TOP RISK GRADE STRIP */}
            <div className="mb-6">
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Risk Grade */}
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Risk Grade</p>
                        <Badge className={`${getRiskGrade(auditResult.security_score).color} text-2xl font-bold px-4 py-2`}>
                          {getRiskGrade(auditResult.security_score).grade}
                        </Badge>
                      </div>
                      <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Status</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {getRiskGrade(auditResult.security_score).status}
                        </p>
                      </div>
                    </div>

                    {/* Severity Counts */}
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Severity Breakdown</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(getSeverityDistribution(auditResult.vulnerabilities))
                          .sort((a, b) => (SEVERITY_RANK[b[0]] || 0) - (SEVERITY_RANK[a[0]] || 0))
                          .map(([severity, count]) => (
                            <div key={severity} className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{count}</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">{severity}</span>
                            </div>
                          ))
                          .reduce((prev, curr, idx) => 
                            idx === 0 ? [curr] : [...prev, <span key={`sep-${idx}`} className="text-slate-400 dark:text-slate-600">|</span>, curr],
                            []
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Banner for Starter Plan */}
            {selectedPlan === 'starter' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Upgrade to Pro to unlock PDF Reports</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Get downloadable executive summaries and compliance exports</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/#pricing'}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Plans
                  </Button>
                </div>
              </div>
            )}

            {/* TOP KPI ROW - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Card 1: Security Score */}
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300" data-testid="security-score-card">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Security Score</p>
                    {auditResult.security_score >= 80 ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">Good</Badge>
                    ) : auditResult.security_score >= 60 ? (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">Fair</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">At Risk</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100" data-testid="security-score-value">
                      {auditResult.security_score}
                    </span>
                    <span className="text-sm text-slate-500">/ 100</span>
                  </div>
                  <Progress value={auditResult.security_score} className="h-2" data-testid="security-score-progress" />
                </CardContent>
              </Card>

              {/* Card 2: Total Financial Risk */}
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <CardContent className="pt-8 pb-8">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Total Financial Risk</p>
                  <p className="text-3xl font-bold text-red-600 mb-3" data-testid="total-liability">
                    {formatCurrency(animatedRisk)}
                  </p>
                  <p className="text-xs text-slate-500">Potential liability</p>
                </CardContent>
              </Card>

              {/* Card 3: Total Vulnerabilities */}
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <CardContent className="pt-8 pb-8">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Total Vulnerabilities</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                      {auditResult.vulnerabilities.length}
                    </span>
                    <span className="text-sm text-slate-500">detected</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {auditResult.vulnerabilities.filter(v => v.severity === 'Critical').length} Critical,{' '}
                    {auditResult.vulnerabilities.filter(v => v.severity === 'High').length} High
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* SECOND SECTION - Financial Breakdown & Vulnerabilities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 lg:items-start">
              {/* Left: Financial Risk Breakdown */}
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300 lg:h-[750px] flex flex-col" data-testid="financial-impact-card">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {chartView === "financial" ? "Financial Risk Breakdown" : "Severity Distribution"}
                    </CardTitle>
                    
                    {/* Chart View Toggle */}
                    {auditResult && (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => setChartView("financial")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            chartView === "financial"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          Financial
                        </button>
                        <button
                          onClick={() => setChartView("severity")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            chartView === "severity"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          Severity
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-8 pb-8 flex-1 flex flex-col overflow-hidden">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={500}
                        animationBegin={0}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => chartView === "financial" ? formatCurrency(value) : `${value} issues`}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                          border: theme === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Dynamic Legend */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {chartView === "financial" ? (
                      // Financial View Legend
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">Fix Costs</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(auditResult.detailedImpact.breakdown.fixCost)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">Downtime</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(auditResult.detailedImpact.breakdown.downtime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">Legal/Fines</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(auditResult.detailedImpact.breakdown.regulatoryFines)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">Reputation</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(auditResult.detailedImpact.breakdown.reputation)}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Severity View Legend
                      chartData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item.name}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value} {item.value === 1 ? 'issue' : 'issues'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {chartView === "financial" && (
                    <p className="text-xs text-slate-500 mt-4 italic">
                      Based on IBM Cost of Data Breach 2024 & DPDP Act 2023
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Right: Vulnerabilities Summary with Grouped Accordion */}
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300 flex flex-col lg:h-[750px]">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Vulnerabilities Detected</CardTitle>
                    
                    {/* View Mode Toggle */}
                    {auditResult && auditResult.vulnerabilities.length > 0 && (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("grouped")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            viewMode === "grouped"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          GROUPED
                        </button>
                        <button
                          onClick={() => setViewMode("all")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            viewMode === "all"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          ALL
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-8 pb-6 flex-1 flex flex-col overflow-hidden">
                  {auditResult.vulnerabilities.length === 0 ? (
                    <div className="text-center py-8 flex-shrink-0">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No vulnerabilities found!</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Your code appears secure.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 min-h-0">
                      {/* Severity Distribution Strip */}
                      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex-shrink-0">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Severity Distribution</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          {Object.entries(getSeverityDistribution(auditResult.vulnerabilities))
                            .sort((a, b) => (SEVERITY_RANK[b[0]] || 0) - (SEVERITY_RANK[a[0]] || 0))
                            .map(([severity, count]) => (
                              <div key={severity} className="flex items-center gap-2">
                                <Badge className={getSeverityColor(severity)}>{severity}</Badge>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Grouped Vulnerabilities with Accordion - Scrollable */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: 'calc(100% - 100px)' }}>
                        {viewMode === "grouped" ? (
                          // GROUPED VIEW
                          Object.entries(groupVulnerabilities(auditResult.vulnerabilities)).map(([category, vulns]) => {
                            const groupSeverity = getGroupSeverity(vulns);
                            const isExpanded = expandedGroups[category];

                            return (
                              <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                {/* Group Header */}
                                <button
                                  onClick={() => toggleGroup(category)}
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                                  data-testid={`group-${category}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                    )}
                                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{category}</span>
                                    <Badge className={getSeverityColor(groupSeverity)} variant="outline">
                                      {groupSeverity}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-slate-600 dark:text-slate-300">{vulns.length} issue{vulns.length > 1 ? 's' : ''}</span>
                                </button>

                                {/* Group Content */}
                                {isExpanded && (
                                  <div className="p-4 space-y-3 bg-white dark:bg-slate-900 transition-colors duration-300">
                                    {vulns.map((vuln, idx) => {
                                      const vulnId = `${category}-${idx}`;
                                      const isVulnExpanded = expandedVulns[vulnId];

                                      return (
                                        <div key={idx} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800 transition-colors duration-300" data-testid={`vulnerability-item-${idx}`}>
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge className={getSeverityColor(vuln.severity)}>
                                                {vuln.severity}
                                              </Badge>
                                              {vuln.cwe_id && (
                                                <Badge variant="outline" className="text-xs">{vuln.cwe_id}</Badge>
                                              )}
                                            </div>
                                            <span className="text-xs text-slate-500">{vuln.fix_time_hours}h</span>
                                          </div>

                                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{vuln.title}</p>
                                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                            📁 {vuln.location}
                                          </p>

                                          {vuln.data_impact && vuln.data_impact.length > 0 && (
                                            <div className="flex gap-1 mb-2">
                                              {vuln.data_impact.map((impact, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                                  {impact}
                                                </span>
                                              ))}
                                            </div>
                                          )}

                                          {/* Expandable Description */}
                                          <button
                                            onClick={() => toggleVuln(vulnId)}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                                          >
                                            {isVulnExpanded ? 'Hide details' : 'Show details'}
                                            {isVulnExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                          </button>

                                          {isVulnExpanded && (
                                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                              <div>
                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Description:</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{vuln.description}</p>
                                              </div>
                                              <div>
                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Remediation:</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{vuln.remediation}</p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          // ALL VIEW - Flat list
                          auditResult.vulnerabilities.map((vuln, idx) => {
                            const vulnId = `all-${idx}`;
                            const isVulnExpanded = expandedVulns[vulnId];

                            return (
                              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 transition-colors duration-300" data-testid={`vulnerability-item-all-${idx}`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={getSeverityColor(vuln.severity)}>
                                      {vuln.severity}
                                    </Badge>
                                    {vuln.cwe_id && (
                                      <Badge variant="outline" className="text-xs">{vuln.cwe_id}</Badge>
                                    )}
                                    {vuln.category && (
                                      <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {vuln.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500">{vuln.fix_time_hours}h</span>
                                </div>

                                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{vuln.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                  📁 {vuln.location}
                                </p>

                                {vuln.data_impact && vuln.data_impact.length > 0 && (
                                  <div className="flex gap-1 mb-2">
                                    {vuln.data_impact.map((impact, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                        {impact}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Expandable Description */}
                                <button
                                  onClick={() => toggleVuln(vulnId)}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                                >
                                  {isVulnExpanded ? 'Hide details' : 'Show details'}
                                  {isVulnExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                </button>

                                {isVulnExpanded && (
                                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                    <div>
                                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Description:</p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">{vuln.description}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Remediation:</p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">{vuln.remediation}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Security Audit Input</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Analyze code, GitHub repos, or upload files</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="code" data-testid="tab-code">Code Snippet</TabsTrigger>
                      <TabsTrigger value="github" data-testid="tab-github">GitHub URL</TabsTrigger>
                      <TabsTrigger value="upload" data-testid="tab-upload">Upload File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="code" data-testid="code-input-section">
                      <Textarea
                        placeholder="Paste your code here..."
                        className="min-h-[300px] font-mono text-sm"
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                        data-testid="code-textarea"
                      />
                      <Button
                        onClick={handleCodeAudit}
                        disabled={loading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        data-testid="analyze-code-btn"
                      >
                        {loading ? "Analyzing..." : "Analyze Code"}
                      </Button>
                    </TabsContent>

                    <TabsContent value="github" data-testid="github-input-section">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Github className="h-5 w-5 text-slate-500 mt-2" />
                          <Input
                            placeholder="https://github.com/username/repo"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            data-testid="github-url-input"
                          />
                        </div>
                        <Button
                          onClick={handleRepoAudit}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          data-testid="analyze-github-btn"
                        >
                          {loading ? "Analyzing..." : "Analyze Repository"}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" data-testid="upload-input-section">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <Input
                            type="file"
                            onChange={handleFileChange}
                            className="max-w-xs mx-auto"
                            accept=".js,.py,.java,.cpp,.c,.go,.rb,.php,.ts,.jsx,.tsx"
                            data-testid="file-upload-input"
                          />
                          {file && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Selected: {file.name}</p>
                          )}
                        </div>
                        <Button
                          onClick={handleRepoAudit}
                          disabled={loading || !file}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          data-testid="analyze-file-btn"
                        >
                          {loading ? "Analyzing..." : "Analyze File"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder for no results */}
            <div>
              <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <CardContent className="pt-12 pb-12 text-center">
                  <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Audit Results Yet</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Submit code, a GitHub URL, or upload a file to begin security analysis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            © 2026 VulnExplain. Enterprise Security Audit Platform.
          </p>
          <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-2">
            Contact: <a href="mailto:support@vulnexplain.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@vulnexplain.com</a>
          </p>
        </div>
      </footer>

      {/* Upgrade Modal - For Starter/Pro */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUpgradeModal(false)}></div>
          <Card className="relative bg-white dark:bg-slate-900 max-w-md mx-4 z-10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Upgrade to Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Team collaboration features are available exclusively in the Enterprise plan.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Multi-user Access
                </li>
                <li className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Shared Audit Workspace
                </li>
                <li className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  AI Summary Sharing
                </li>
                <li className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Activity Timeline
                </li>
              </ul>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = '/#pricing'}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Upgrade Now
                </Button>
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Collaboration Panel - Enterprise Only */}
      {showTeamPanel && selectedPlan === 'enterprise' && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setShowTeamPanel(false)}
          ></div>
          
          {/* Slide-in Panel */}
          <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Team Collaboration</h2>
              </div>
              <Button
                onClick={() => setShowTeamPanel(false)}
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Panel Content */}
            <div className="p-6 space-y-8">
              {/* Team Members Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Team Members</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Aditya', role: 'Backend Developer', color: 'bg-blue-500' },
                    { name: 'Peeyush', role: 'Security Lead', color: 'bg-purple-500' },
                    { name: 'Elon', role: 'Compliance Officer', color: 'bg-green-500' }
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-semibold`}>
                        {member.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{member.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Audit Summary Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Share Audit Summary</h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter teammate email"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleShareSummary}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Share AI Summary
                  </Button>
                </div>
              </div>

              {/* Activity Timeline Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Activity Timeline</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Audit generated', time: '2 mins ago' },
                    { action: 'Critical vulnerability assigned', time: '15 mins ago' },
                    { action: 'PDF report exported', time: '1 hour ago' },
                    { action: 'AI summary shared', time: '3 hours ago' }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
