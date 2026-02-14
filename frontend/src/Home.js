import { Shield, TrendingUp, FileCheck, ArrowRight, Moon, Sun, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/ThemeContext";
import { toast } from "sonner";

function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handlePlanSelect = (plan) => {
    localStorage.setItem('selectedPlan', plan);
    toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan selected!`);
    navigate('/audit');
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Security Analysis",
      description: "Advanced vulnerability detection using Gemini Pro 3 AI. Identifies OWASP Top 10, CWE vulnerabilities, and maps them to SOC 2 controls for comprehensive security assessment."
    },
    {
      icon: TrendingUp,
      title: "Financial Risk Quantification",
      description: "Translate security vulnerabilities into real business impact. Calculate developer remediation costs, downtime losses, regulatory fines, and reputation damage in Indian Rupees."
    },
    {
      icon: FileCheck,
      title: "Compliance Mapping (DPDP Act 2023 + SOC 2)",
      description: "Ensure compliance with Indian Data Protection laws and SOC 2 standards. Get detailed reports on data impact (PII, Financial, Authentication) and regulatory risk assessment."
    }
  ];

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
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className="border-slate-300 dark:border-slate-600"
              data-testid="theme-toggle-btn-home"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* SECTION 1 — HERO */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Translate Code Vulnerabilities into Financial Risk
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 max-w-3xl mx-auto">
            Stop guessing the business impact of security issues. VulnExplain uses AI to audit your code and quantify vulnerabilities in rupees—from developer costs to regulatory fines.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            Make data-driven security decisions with precise financial risk assessments based on IBM breach data and DPDP Act 2023 penalties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/audit')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              data-testid="run-audit-btn"
            >
              Run Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={scrollToPricing}
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-6 text-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              data-testid="view-pricing-btn"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 2 — FEATURES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Why VulnExplain?</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Enterprise-grade security auditing with financial transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300" data-testid={`feature-card-${index}`}>
                <CardHeader>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg w-fit">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Flexible Plans for Every Team</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan - Free */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <Badge className="w-fit mx-auto mb-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Best for Individual Developers
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">₹0</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">/forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Code snippet scanning</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">GitHub repository scanning</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Financial Risk Breakdown</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Severity Dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400 line-through">Vulnerability Grouping</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400 line-through">PDF Report Download</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400 line-through">Team Collaboration</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handlePlanSelect('starter')}
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan - Highlighted */}
            <Card className="bg-white dark:bg-slate-900 border-blue-500 border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1 text-sm">Recommended</Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <Badge className="w-fit mx-auto mb-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Best for Security Teams
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">₹10,000</span>
                  <span className="text-slate-600 dark:text-slate-400 text-sm">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Everything in Starter, plus:</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Vulnerability Grouping</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Downloadable PDF Report</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">AI Executive Summary Export</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Compliance Mapping Export</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Enterprise PDF Layout</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Financial Impact Projection Report</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400 line-through">Team Collaboration</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handlePlanSelect('pro')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan - Premium */}
            <Card className="bg-white dark:bg-slate-900 border-2 border-purple-400 dark:border-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              {/* Premium gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
              
              <CardHeader className="text-center pb-6 relative">
                <Badge className="w-fit mx-auto mb-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                  For Growing Organizations
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">Custom Pricing</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Tailored for your organization
                  </p>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Everything in Pro, plus:</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Team Collaboration</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Multi-user Access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Shared Audit Workspace</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Auto AI Summary Sharing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Scan History Tracking</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Role-based Access Control</span>
                  </li>
                </ul>
                <Button
                  onClick={() => {
                    handlePlanSelect('enterprise');
                    window.location.href = 'mailto:support@vulnexplain.com?subject=Enterprise Plan Inquiry&body=Hi, I am interested in the Enterprise plan for my organization.';
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
                >
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
    </div>
  );
}

export default Home;
