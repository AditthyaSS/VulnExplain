from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import json
import base64
import re
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class AuditRequest(BaseModel):
    code_snippet: str
    language: Optional[str] = None

class RepoAuditRequest(BaseModel):
    github_url: Optional[str] = None

class Vulnerability(BaseModel):
    title: str
    severity: str  # Critical, High, Medium, Low (backend-assigned)
    cwe_id: Optional[str] = None
    description: str
    remediation: str
    location: str
    soc2_controls: List[str] = []
    data_impact: List[str] = []  # PII, Financial, Authentication
    fix_time_hours: int  # backend-assigned
    category: Optional[str] = None  # Dynamic category from CWE/title


# STEP 2: Deterministic severity mapping based on CWE
SEVERITY_MAP = {
    "CWE-89": "Critical",      # SQL Injection
    "CWE-79": "Critical",      # XSS
    "CWE-78": "Critical",      # OS Command Injection
    "CWE-94": "Critical",      # Code Injection
    "CWE-022": "Critical",     # Path Traversal
    "CWE-798": "Critical",     # Hardcoded Credentials
    "CWE-502": "Critical",     # Deserialization
    "CWE-601": "High",         # Open Redirect
    "CWE-352": "High",         # CSRF
    "CWE-918": "High",         # SSRF
    "CWE-434": "High",         # Unrestricted File Upload
    "CWE-862": "High",         # Missing Authorization
    "CWE-863": "High",         # Incorrect Authorization
    "CWE-306": "High",         # Missing Authentication
    "CWE-532": "Medium",       # Information Exposure Through Log Files
    "CWE-200": "Medium",       # Information Exposure
    "CWE-327": "Medium",       # Weak Crypto
    "CWE-311": "Medium",       # Missing Encryption
    "CWE-284": "Medium",       # Improper Access Control
    "CWE-676": "Low",          # Use of Potentially Dangerous Function
    "CWE-732": "Low",          # Incorrect Permission Assignment
}

# STEP 3: Deterministic fix time based on severity
FIX_TIME_MAP = {
    "Critical": 24,
    "High": 8,
    "Medium": 4,
    "Low": 1
}


def assign_severity(cwe: str) -> str:
    """Assign severity based on CWE mapping"""
    return SEVERITY_MAP.get(cwe, "Medium")


def assign_fix_time(severity: str) -> int:
    """Assign fix time based on severity"""
    return FIX_TIME_MAP.get(severity, 4)


# CWE to Category mapping for dynamic grouping
CWE_CATEGORY_MAP = {
    "CWE-89": "SQL Injection",
    "CWE-79": "Cross-Site Scripting (XSS)",
    "CWE-78": "OS Command Injection",
    "CWE-94": "Code Injection",
    "CWE-22": "Path Traversal",
    "CWE-798": "Hardcoded Credentials",
    "CWE-502": "Insecure Deserialization",
    "CWE-601": "Open Redirect",
    "CWE-352": "Cross-Site Request Forgery (CSRF)",
    "CWE-918": "Server-Side Request Forgery (SSRF)",
    "CWE-434": "Unrestricted File Upload",
    "CWE-862": "Missing Authorization",
    "CWE-863": "Incorrect Authorization",
    "CWE-306": "Missing Authentication",
    "CWE-287": "Improper Authentication",
    "CWE-532": "Information Exposure Through Logs",
    "CWE-200": "Information Exposure",
    "CWE-327": "Weak Cryptography",
    "CWE-311": "Missing Encryption",
    "CWE-284": "Improper Access Control",
    "CWE-676": "Use of Dangerous Function",
    "CWE-732": "Incorrect Permissions",
}


def assign_category(cwe: str, title: str) -> str:
    """Assign category based on CWE or title"""
    if cwe in CWE_CATEGORY_MAP:
        return CWE_CATEGORY_MAP[cwe]
    # Fallback to extracting category from title
    return "Other Security Issues"

class ImpactBreakdown(BaseModel):
    fixCost: int
    downtime: int
    regulatoryFines: int
    reputation: int

class DetailedImpact(BaseModel):
    breakdown: ImpactBreakdown
    totalINR: int

class AuditResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vulnerabilities: List[Vulnerability]
    security_score: int  # 0-100
    detailedImpact: DetailedImpact
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Financial Impact Calculation Function
def calculate_detailed_impact(vulnerabilities: List[Vulnerability]) -> DetailedImpact:
    """
    Calculate financial impact based on Indian Enterprise Data
    """
    # 1. Developer Remediation Costs (Avg Senior Dev Rate: ₹2,500/hr)
    dev_cost = 0
    for v in vulnerabilities:
        if v.severity == 'Critical':
            dev_cost += (24 * 2500)
        elif v.severity == 'High':
            dev_cost += (8 * 2500)
        elif v.severity == 'Medium':
            dev_cost += (4 * 2500)
        else:  # Low
            dev_cost += (1 * 2500)
    
    # 2. Potential Downtime Losses (Avg SaaS Rev Loss: ₹50,000/hr)
    critical_count = sum(1 for v in vulnerabilities if v.severity == 'Critical')
    downtime_cost = critical_count * 4 * 50000
    
    # 3. Compliance Fines (DPDP Act 2023 Context)
    compliance_fine = critical_count * 250000
    
    # 4. Reputation & Churn (Customer Trust Loss)
    high_critical_count = sum(1 for v in vulnerabilities if v.severity in ['Critical', 'High'])
    reputation_cost = high_critical_count * 100000
    
    total = dev_cost + downtime_cost + compliance_fine + reputation_cost
    
    return DetailedImpact(
        breakdown=ImpactBreakdown(
            fixCost=dev_cost,
            downtime=downtime_cost,
            regulatoryFines=compliance_fine,
            reputation=reputation_cost
        ),
        totalINR=total
    )


# STEP 4: Deduplication function (updated to use CWE + file)
def deduplicate_vulnerabilities(vulnerabilities: List[Vulnerability]) -> List[Vulnerability]:
    """
    Deduplicate vulnerabilities using unique key: cwe + location (file)
    Same CWE in same file = one vulnerability
    """
    seen = set()
    deduplicated = []
    
    for vuln in vulnerabilities:
        # Create unique key with CWE and normalized file location
        cwe = vuln.cwe_id if vuln.cwe_id else "UNKNOWN"
        unique_key = (
            cwe.strip().upper(),
            vuln.location.strip().lower()
        )
        
        if unique_key not in seen:
            seen.add(unique_key)
            deduplicated.append(vuln)
    
    return deduplicated


# Calculate security score based on vulnerabilities
def calculate_security_score(vulnerabilities: List[Vulnerability]) -> int:
    """
    Calculate security score (0-100) based on vulnerability severity
    """
    if not vulnerabilities:
        return 100
    
    # Weighted penalty system
    penalty = 0
    for v in vulnerabilities:
        if v.severity == 'Critical':
            penalty += 25
        elif v.severity == 'High':
            penalty += 15
        elif v.severity == 'Medium':
            penalty += 8
        else:  # Low
            penalty += 3
    
    score = max(0, 100 - penalty)
    return score


# Gemini Analysis Function
async def analyze_with_gemini(code_content: str, context: str = "code snippet") -> List[Vulnerability]:
    """
    Analyze code using Groq API with Llama 3.3-70b-versatile for security vulnerabilities
    """
    api_key = os.environ.get('GROQ_API_KEY')
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    # STEP 1: Updated system prompt - Gemini should NOT assign severity
    system_message = """Act as a Senior Security Engineer. Audit the code/repo for security vulnerabilities.

CRITICAL INSTRUCTIONS:
- You must NOT assign severity levels (Critical/High/Medium/Low).
- You must NOT assign risk levels.
- You must NOT assign estimated fix time.
- You must ONLY extract structured vulnerability evidence directly supported by visible code.
- Do not speculate. Do not duplicate findings. Do not infer hypothetical vulnerabilities.

For each vulnerability found, provide:
1. CWE identifier (e.g., "CWE-89")
2. Vulnerability title
3. File/component location
4. Line number or code location
5. Detailed description of the vulnerability
6. Remediation steps
7. Data impact classification (if applicable): ["PII", "Financial", "Authentication"]
8. Relevant SOC 2 controls

Return ONLY valid JSON array (no markdown, no extra text) with this exact structure:
[
  {
    "cwe_id": "CWE-XXX",
    "title": "Vulnerability name",
    "location": "filename.py:line_number or component_name",
    "description": "Detailed description of vulnerability with evidence from code",
    "remediation": "How to fix this specific issue",
    "data_impact": ["PII", "Financial"],
    "soc2_controls": ["CC6.1", "CC6.6"]
  }
]

If no vulnerabilities found, return [].

IMPORTANT: Do NOT include "severity" or "fix_time_hours" fields. These will be assigned by the backend based on CWE mapping."""
    
    try:
        # Configure Groq for deterministic output
        # Use llama-3.3-70b-versatile for best free tier performance
        groq_model = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"audit-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("groq", groq_model).with_params(
            temperature=0,
            top_p=0.1,
            max_tokens=8192
        )
        
        user_message = UserMessage(
            text=f"Analyze this {context} for security vulnerabilities:\n\n{code_content}"
        )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        response_text = response.strip()
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        vulnerabilities_data = json.loads(response_text)
        
        # STEP 5: Convert to Vulnerability models with backend-assigned severity and fix time
        vulnerabilities = []
        for v_data in vulnerabilities_data:
            cwe_id = v_data.get('cwe_id', 'UNKNOWN')
            
            # Backend assigns severity based on CWE
            severity = assign_severity(cwe_id)
            
            # Backend assigns fix time based on severity
            fix_time_hours = assign_fix_time(severity)
            
            # Backend assigns category based on CWE
            title = v_data.get('title', 'Unknown Vulnerability')
            category = assign_category(cwe_id, title)
            
            # Create vulnerability with backend-assigned values
            vuln = Vulnerability(
                cwe_id=cwe_id,
                title=title,
                location=v_data.get('location', 'Unknown location'),
                description=v_data.get('description', ''),
                remediation=v_data.get('remediation', ''),
                data_impact=v_data.get('data_impact', []),
                soc2_controls=v_data.get('soc2_controls', []),
                severity=severity,
                fix_time_hours=fix_time_hours,
                category=category
            )
            vulnerabilities.append(vuln)
        
        # STEP 4: Deduplicate vulnerabilities
        vulnerabilities = deduplicate_vulnerabilities(vulnerabilities)
        
        return vulnerabilities
    
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}, Response: {response}")
        # Return a default vulnerability if parsing fails
        return [
            Vulnerability(
                title="Analysis Error",
                severity="Low",
                description="Unable to parse AI response. Please try again.",
                remediation="Retry the audit",
                location="N/A",
                fix_time_hours=1
            )
        ]
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@api_router.post("/audit", response_model=AuditResult)
async def audit_code(request: AuditRequest):
    """
    Audit a code snippet for security vulnerabilities
    """
    try:
        # Analyze with Gemini
        vulnerabilities = await analyze_with_gemini(
            request.code_snippet,
            f"{request.language or 'code'} snippet"
        )
        
        # Calculate impact
        detailed_impact = calculate_detailed_impact(vulnerabilities)
        
        # Calculate security score
        security_score = calculate_security_score(vulnerabilities)
        
        # Create result
        result = AuditResult(
            vulnerabilities=vulnerabilities,
            security_score=security_score,
            detailedImpact=detailed_impact
        )
        
        # Store in database
        result_dict = result.model_dump()
        result_dict['timestamp'] = result_dict['timestamp'].isoformat()
        await db.audit_results.insert_one(result_dict)
        
        return result
    
    except Exception as e:
        logger.error(f"Audit error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/audit-repo", response_model=AuditResult)
async def audit_repo(
    github_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Audit a GitHub repository or uploaded file
    """
    try:
        code_content = ""
        context = ""
        
        if github_url:
            # Extract owner and repo from GitHub URL
            # Supports: https://github.com/owner/repo or github.com/owner/repo
            import re
            pattern = r'github\.com/([^/]+)/([^/]+)'
            match = re.search(pattern, github_url.strip('/'))
            
            if not match:
                raise HTTPException(status_code=400, detail="Invalid GitHub URL format. Expected: https://github.com/owner/repo")
            
            owner, repo = match.groups()
            # Remove .git suffix if present
            repo = repo.replace('.git', '')
            
            # Fetch repository contents using GitHub API
            import requests
            
            # Setup authentication headers if GitHub token is available
            headers = {}
            github_token = os.environ.get('GITHUB_TOKEN')
            if github_token:
                headers['Authorization'] = f'token {github_token}'
            
            # Get repository tree (all files)
            api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1"
            
            # Try main branch, fallback to master
            response = requests.get(api_url, headers=headers, timeout=10)
            if response.status_code == 404:
                api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1"
                response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to fetch repository. Status: {response.status_code}. Make sure the repository is public.")
            
            tree_data = response.json()
            
            # Get code files (limit to reasonable file types and size)
            code_extensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.go', '.rb', '.php', '.cs', '.swift']
            code_files = [
                item for item in tree_data.get('tree', [])
                if item['type'] == 'blob' and any(item['path'].endswith(ext) for ext in code_extensions)
            ][:20]  # Limit to 20 files for analysis
            
            if not code_files:
                raise HTTPException(status_code=400, detail="No code files found in repository")
            
            # Fetch content of selected files
            file_contents = []
            for file_item in code_files:
                file_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_item['path']}"
                file_response = requests.get(file_url, headers=headers, timeout=10)
                
                if file_response.status_code == 200:
                    file_data = file_response.json()
                    if file_data.get('encoding') == 'base64':
                        try:
                            content = base64.b64decode(file_data['content']).decode('utf-8')
                            file_contents.append(f"\n\n=== File: {file_item['path']} ===\n{content}")
                        except:
                            continue
            
            if not file_contents:
                raise HTTPException(status_code=400, detail="Failed to read any files from repository")
            
            code_content = f"GitHub Repository: {owner}/{repo}\n\nAnalyzing {len(file_contents)} code files:\n" + "\n".join(file_contents)
            context = f"GitHub repository {owner}/{repo}"
        
        elif file:
            # Read uploaded file
            content = await file.read()
            try:
                code_content = content.decode('utf-8')
                context = f"uploaded file ({file.filename})"
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="File must be a text file")
        
        else:
            raise HTTPException(status_code=400, detail="Either github_url or file must be provided")
        
        # Analyze with Gemini
        vulnerabilities = await analyze_with_gemini(code_content, context)
        
        # Calculate impact
        detailed_impact = calculate_detailed_impact(vulnerabilities)
        
        # Calculate security score
        security_score = calculate_security_score(vulnerabilities)
        
        # Create result
        result = AuditResult(
            vulnerabilities=vulnerabilities,
            security_score=security_score,
            detailedImpact=detailed_impact
        )
        
        # Store in database
        result_dict = result.model_dump()
        result_dict['timestamp'] = result_dict['timestamp'].isoformat()
        await db.audit_results.insert_one(result_dict)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Repo audit error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@api_router.post("/generate-report")
async def generate_report(audit_result: dict):
    """
    Generate PDF report from audit result
    Isolated endpoint - does not modify existing audit logic
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from io import BytesIO
    
    try:
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Container for PDF elements
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        elements.append(Paragraph("VulnExplain Security Audit Report", title_style))
        elements.append(Spacer(1, 0.3*inch))
        
        # Summary Table
        summary_data = [
            ['Security Score', str(audit_result.get('security_score', 'N/A'))],
            ['Total Vulnerabilities', str(len(audit_result.get('vulnerabilities', [])))],
            ['Total Financial Risk', f"₹{audit_result.get('detailedImpact', {}).get('totalINR', 0):,}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0'))
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Financial Breakdown
        elements.append(Paragraph("Financial Risk Breakdown", heading_style))
        breakdown = audit_result.get('detailedImpact', {}).get('breakdown', {})
        financial_data = [
            ['Category', 'Amount (INR)'],
            ['Fix Costs', f"₹{breakdown.get('fixCost', 0):,}"],
            ['Downtime', f"₹{breakdown.get('downtime', 0):,}"],
            ['Legal/Fines', f"₹{breakdown.get('regulatoryFines', 0):,}"],
            ['Reputation', f"₹{breakdown.get('reputation', 0):,}"]
        ]
        
        financial_table = Table(financial_data, colWidths=[3*inch, 3*inch])
        financial_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0'))
        ]))
        
        elements.append(financial_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Severity Distribution
        vulnerabilities = audit_result.get('vulnerabilities', [])
        severity_counts = {}
        for vuln in vulnerabilities:
            sev = vuln.get('severity', 'Unknown')
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
        
        elements.append(Paragraph("Severity Distribution", heading_style))
        severity_text = " | ".join([f"{count} {sev}" for sev, count in sorted(severity_counts.items(), key=lambda x: {'Critical': 5, 'High': 4, 'Medium': 3, 'Low': 2}.get(x[0], 0), reverse=True)])
        elements.append(Paragraph(severity_text, styles['Normal']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Vulnerabilities Detail
        elements.append(Paragraph("Detailed Vulnerabilities", heading_style))
        
        for idx, vuln in enumerate(vulnerabilities, 1):
            vuln_data = [
                [f"#{idx}", vuln.get('title', 'Unknown')],
                ['Severity', vuln.get('severity', 'Unknown')],
                ['CWE', vuln.get('cwe_id', 'N/A')],
                ['Category', vuln.get('category', 'N/A')],
                ['Location', vuln.get('location', 'Unknown')],
                ['Fix Time', f"{vuln.get('fix_time_hours', 0)}h"],
                ['Description', vuln.get('description', 'N/A')[:200] + '...'],
            ]
            
            vuln_table = Table(vuln_data, colWidths=[1.2*inch, 4.8*inch])
            vuln_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8fafc')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1'))
            ]))
            
            elements.append(vuln_table)
            elements.append(Spacer(1, 0.15*inch))
        
        # Footer
        elements.append(Spacer(1, 0.3*inch))
        footer_text = "Generated by VulnExplain | Based on IBM Cost of Data Breach 2024 & DPDP Act 2023"
        elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()
        
        # Return as streaming response
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            BytesIO(pdf_data),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=VulnExplain-Security-Report.pdf"
            }
        )
    
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@api_router.get("/")
async def root():
    return {"message": "VulnExplain API - B2B Security Audit SaaS"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()