"""Editable CV source. Run python cv_source.py (requires reportlab)."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
FONT_DIR=Path('/usr/share/fonts/truetype/dejavu')
for name,file in [('JNSans','DejaVuSans.ttf'),('JNSans-Bold','DejaVuSans-Bold.ttf'),('JNSans-Oblique','DejaVuSans.ttf'),('JNSans-BoldOblique','DejaVuSans-Bold.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(FONT_DIR/file)))
pdfmetrics.registerFontFamily('JNSans',normal='JNSans',bold='JNSans-Bold',italic='JNSans-Oblique',boldItalic='JNSans-BoldOblique')
ROOT=Path(__file__).resolve().parent
styles=getSampleStyleSheet()
for name,size,leading,color,bold in [('Name',25,29,'142129',True),('Tag',10,14,'164dcc',False),('Body',9,12,'142129',False),('Meta',8,10.5,'53616b',False),('Section',11,15,'164dcc',True),('Role',10,13,'142129',True),('Bullet',9,12,'142129',False)]:
 styles.add(ParagraphStyle(name='JN'+name,fontName='JNSans-Bold' if bold else 'JNSans',fontSize=size,leading=leading,textColor=HexColor('#'+color),spaceAfter=4,spaceBefore=10 if name=='Section' else 0,leftIndent=10 if name=='Bullet' else 0,firstLineIndent=-8 if name=='Bullet' else 0))
story=[]
def p(t,s='Body'): return Paragraph(t,styles['JN'+s])
def add(t,s='Body'): story.append(p(t,s))
def sec(t): add(t.upper(),'Section')
def link(u,t): return '<link href="'+u+'" color="#164dcc">'+t+'</link>'
def role(t,o,d,bs):
 story.append(KeepTogether([p(t,'Role'),p(o+' | '+d,'Meta')]+[p('- '+b,'Bullet') for b in bs]+[Spacer(1,4)]))
add('JAMAL NASIR','Name')
add('Financial Risk | Quantitative Modelling | Applied Research','Tag')
add('+92 307 621 7032 | '+link('mailto:j.nasir25260@gmail.com','j.nasir25260@gmail.com'),'Meta')
add(' | '.join([link('https://jamal715.github.io/','Portfolio'),link('https://github.com/jamal715','GitHub'),link('https://linkedin.com/in/jamal-nasir-5696b3222','LinkedIn'),link('https://jamal-nasir-research.vercel.app/','Research &amp; Analysis'),link('https://www.youtube.com/watch?v=yjThZL2-lhk','YouTube'),link('https://quantora-six.vercel.app/','QuantOra')]),'Meta')
sec('Profile')
add('Finance professional working across credit risk, guarantee structuring, quantitative modelling and applied machine learning. Experience includes transaction evaluations for PKR 5.5 billion in guarantee facilities, credit analysis across 24 entities, and building research models and data applications. Uses financial analysis, mathematics and code to turn complex evidence into practical decisions.')
sec('Professional experience')
role('Consultant - ECL Valuation, Assurance','EY MENA','October 2026-Present',[
'Working on forecasting and expected credit loss (ECL) models for assurance and valuation engagements, reporting to the Partner.'])
role('Financial Planning Analyst','National Credit Guarantee Company Limited (NCGCL)','May-October 2026',[
'Developed ISMO-based electricity-price guarantee research and simulation models for <i>The price of a promise</i>, examining fixed-price choices, buyer contributions, reserve depletion and guarantor exposure.',
'Built and deployed an '+link('https://pakistan-non-rice-food-export-intelligence-ncgcl.streamlit.app/','export intelligence application')+' to automate recurring analysis of Pakistan\'s export data.',
'Conducted transaction evaluations and supported offer letters and guarantees for a PKR 1.5 billion facility with HBL Microfinance Bank and a PKR 4.0 billion facility with Bank Alfalah.',
'Worked on fund allocation and financial frameworks for the LUMS-MAF returnable guarantee facility supporting Pakistan\'s swappable battery programme.',
'Led Phase 2 development work for the Guarantee Management Portal, standardising data fields and reporting protocols across financial institutions.'])
role('Analyst','The Pakistan Credit Rating Agency (PACRA)','October 2025-April 2026',[
'Managed credit evaluations for a 24-entity portfolio, primarily in the energy and construction sectors.',
'Analysed capital structure, liquidity, coverage and cash flows to assess credit risk and support ratings.'])
role('Research Associate','Project Indigenous Mechanization, Government of Punjab','August 2025-January 2026',[
'Collaborated with Dr. Shakeel Sadiq Jajja on an indigenous e-mechanisation initiative; engaged 50+ farmers, manufacturers and financial-sector stakeholders to identify adoption barriers and opportunities.'])
role('Executive Assistant - Strategic Planning Cell','Institute of Business Administration, Karachi','July-December 2024',[
'Co-developed IBA\'s five-year strategic plan across seven pillars, designed accreditation-aligned KPIs, and supported data modelling and institutional performance dashboards.'])
role('Project Consultant (Remote)','QuantOra, Dublin','October 2022-January 2024',[
'Built differential-equation models for Irish cattle-land saturation forecasting and mentored the team on an MNIST classification pipeline.'])
story.append(PageBreak())
add('JAMAL NASIR','Role');add('Selected projects, education &amp; technical skills','Meta')
sec('Selected projects')
role('The price of a promise','Electricity-price guarantee research','2026',[
'Built historical replay and sensitivity analysis using ISMO demand and marginal-cost profiles to compare fixed prices, reserve contributions and residual guarantee exposure. '+link('https://jamal-nasir-research.vercel.app/article/price-of-a-promise','Read research')+'.'])
role('TinyLlama Fine-Tuning - LoRA &amp; DPO','Text analytics','Spring 2025',[
'Fine-tuned the 1.1-billion-parameter TinyLlama model using LoRA and Direct Preference Optimization; evaluated instruction-following and question-answering behaviour on custom datasets.'])
role('Optimisation for High-Dimensional Logistic Regression','Mathematical optimisation','Spring 2025',[
'Reviewed optimisation techniques and mathematical derivations, and built and ran multiple optimisation models on high-dimensional datasets.'])
role('Loan Servicing Risk Alert System','Financial data analytics','Fall 2024',[
'Designed early-warning models to flag high-risk microfinance clients, identified predictive features and supported the workflow design for deployment.'])
role('Predictive Models - Classification &amp; Regression','Machine learning','Fall 2024',[
'Built models for two Kaggle tasks using feature engineering and iterative tuning under tight deadlines.'])
role('Derivative Pricing &amp; Monte Carlo Simulation','Summer School, IBA','Summer 2023',[
'Implemented Black-Scholes and Heston models in Python. Applied Monte Carlo simulations to NSE market data and benchmarked outputs against Black-Scholes predictions.'])
role('Blockchain Fundamentals &amp; Ethereum DApp Deployment','Smart contracts','Summer 2022',[
'Set up an Ethereum VM on Microsoft Azure, developed Solidity smart contracts, and built and tested a decentralised application using Remix IDE.'])
sec('Education')
add('<b>MS Financial Management</b> | Lahore University of Management Sciences | 2025')
add('<b>BS Economics &amp; Mathematics</b> | Institute of Business Administration, Karachi | 2021')
sec('Technical skills')
add('<b>Programming &amp; data:</b> Python (NumPy, pandas, SciPy, scikit-learn, TensorFlow, PyTorch), R, SQL.')
add('<b>Tools &amp; platforms:</b> Microsoft Azure, Power BI, Excel Power Tools, EViews, MATLAB, Stata, SPSS, Git, LaTeX.')
add('<b>Methods:</b> Econometrics, forecasting, machine learning, LoRA, DPO, credit risk analysis, valuation, financial analysis and simulation.')
sec('Certifications');add('IELTS - Band 6.5 | Blockchain Basics &amp; Smart Contracts')
def footer(c,d):
 c.setStrokeColor(HexColor('#dce3e8'));c.line(42,35,A4[0]-42,35);c.setFont('JNSans',8);c.setFillColor(HexColor('#53616b'));c.drawString(42,23,'Jamal Nasir | jamal715.github.io');c.drawRightString(A4[0]-42,23,str(d.page))
out=ROOT/'assets'/'Jamal-Nasir-CV.pdf';out.parent.mkdir(exist_ok=True)
SimpleDocTemplate(str(out),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=35,bottomMargin=45,title='Jamal Nasir - CV',author='Jamal Nasir').build(story,onFirstPage=footer,onLaterPages=footer)
print(out)
